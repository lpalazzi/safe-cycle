import express from 'express';
import mongoose from 'mongoose';
import joi from 'joi';
import { container } from 'tsyringe';
import {
  NogoGroupService,
  NogoService,
  RegionService,
  RouterService,
} from 'services';
import { INogoCreateDTO } from 'interfaces';
import { checkAdmin, checkLoggedIn } from 'api/middlewares';
import {
  BadRequestError,
  InternalServerError,
  UnauthorizedError,
} from 'api/errors';

export const nogo = (app: express.Router) => {
  const route = express.Router();
  app.use('/nogo', route);
  const nogoService = container.resolve(NogoService);
  const nogoGroupService = container.resolve(NogoGroupService);
  const regionService = container.resolve(RegionService);
  const routerService = container.resolve(RouterService);

  route.get('/getAllByGroup/:groupId/:groupType', async (req, res, next) => {
    try {
      if (!mongoose.isValidObjectId(req.params.groupId)) {
        throw new BadRequestError(
          `${req.params.groupId} is not a valid ObjectId`
        );
      }
      const groupId = new mongoose.Types.ObjectId(req.params.groupId);
      const isRegion = req.params.groupType === 'region';

      if (!isRegion) {
        if (
          !req.session.userId ||
          !mongoose.isValidObjectId(req.session?.userId)
        )
          throw new UnauthorizedError('User is not logged in');

        const userId = new mongoose.Types.ObjectId(req.session.userId);
        const userOwnsNogoGroup = await nogoGroupService.doesUserOwnNogoGroup(
          userId,
          groupId
        );
        if (!userOwnsNogoGroup)
          throw new UnauthorizedError(
            'User does not have access to Nogo Group'
          );
      }

      const nogos = await nogoService.getAllByGroup(groupId, isRegion);
      return res.json({ nogos });
    } catch (err) {
      next(err);
    }
  });

  route.post('/create', checkLoggedIn, async (req, res, next) => {
    try {
      const nogoCreate: INogoCreateDTO = req.body.nogoCreate;

      const { error } = joi
        .object({
          points: joi.array().items(joi.geojson().position()).min(2).required(),
          nogoGroup: joi.objectId(),
          region: joi.objectId(),
        })
        .required()
        .validate(nogoCreate);

      if (error)
        throw new BadRequestError(
          error.message || 'Request was not formatted correctly'
        );
      if (!nogoCreate.nogoGroup && !nogoCreate.region)
        throw new BadRequestError('A group or region ID was not provided');

      if (nogoCreate.nogoGroup && nogoCreate.region)
        throw new BadRequestError(
          'A group or region ID cannot both be provided'
        );

      const nogoGroupId = nogoCreate.nogoGroup
        ? new mongoose.Types.ObjectId(nogoCreate.nogoGroup)
        : undefined;
      const regionId = nogoCreate.region
        ? new mongoose.Types.ObjectId(nogoCreate.region)
        : undefined;

      if (
        regionId &&
        !(await regionService.isUserContributorOnRegion(
          new mongoose.Types.ObjectId(req.session.userId),
          regionId
        ))
      )
        throw new UnauthorizedError(`User does not have access to ${'Region'}`);

      if (
        nogoGroupId &&
        !(await nogoGroupService.doesUserOwnNogoGroup(
          new mongoose.Types.ObjectId(req.session.userId),
          nogoGroupId
        ))
      )
        throw new UnauthorizedError(
          `User does not have access to ${regionId ? 'Region' : 'Nogo Group'}`
        );

      try {
        const { lineString } = await routerService.getRouteForNewNogo(
          nogoCreate.points
        );
        const nogo = await nogoService.create(
          lineString,
          nogoGroupId,
          regionId
        );
        if (!nogo) throw new Error('Nogo could not be created');
        return res.json({ nogo });
      } catch (error: any) {
        if (
          [
            'Only one of nogoGroupId or regionId can be provided',
            'Either nogoGroupId or regionId must be provided',
            'Nogo is outside selected region',
          ].includes(error.message)
        )
          throw new BadRequestError(error.message);
        if (
          String(error.message).includes(
            'position not mapped in existing datafile'
          )
        )
          throw new BadRequestError(
            'One or more of your points are not close enough to a routable location. Please select another point.'
          );
        throw error;
      }
    } catch (err) {
      next(err);
    }
  });

  route.post(
    '/transferNogosToRegion',
    checkLoggedIn,
    checkAdmin,
    async (req, res, next) => {
      try {
        if (!mongoose.isValidObjectId(req.body.nogoGroupId))
          throw new BadRequestError('nogoGroupId is not a valid ObjectId');
        if (!mongoose.isValidObjectId(req.body.regionId))
          throw new BadRequestError('regionId is not a valid ObjectId');
        const nogoGroupId = new mongoose.Types.ObjectId(req.body.nogoGroupId);
        const regionId = new mongoose.Types.ObjectId(req.body.regionId);
        try {
          const updateCount = await nogoService.transferNogosToRegion(
            nogoGroupId,
            regionId
          );
          return res.json({ updateCount });
        } catch (error: any) {
          if (
            ['Region does not exist', 'Nogo group does not exist'].includes(
              error.message
            )
          )
            throw new BadRequestError(error.message);
          throw error;
        }
      } catch (err) {
        next(err);
      }
    }
  );

  route.delete('/delete/:id', checkLoggedIn, async (req, res, next) => {
    try {
      if (!mongoose.isValidObjectId(req.params.id)) {
        throw new BadRequestError(`${req.params.id} is not a valid ObjectId`);
      }
      const nogoId = new mongoose.Types.ObjectId(req.params.id);
      const userId = new mongoose.Types.ObjectId(req.session.userId);

      const userCanDelete = await nogoService.canUserUpdateNogo(nogoId, userId);
      if (!userCanDelete) {
        throw new UnauthorizedError(
          'User is not authorized to delete this nogo'
        );
      }

      const deleteResult = await nogoService.deleteById(nogoId);
      if (!deleteResult.acknowledged) {
        throw new InternalServerError('Delete request was not acknowledged');
      }

      return res.json({
        deletedCount: deleteResult.deletedCount,
      });
    } catch (err) {
      next(err);
    }
  });
};
