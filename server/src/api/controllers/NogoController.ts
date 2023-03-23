import express from 'express';
import mongoose from 'mongoose';
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
      const points: GeoJSON.Position[] = req.body.points ?? [];
      const groupId: string = req.body.groupId;
      const isOnRegion: boolean = req.body.isOnRegion;

      if (points.length < 2)
        throw new BadRequestError('Route request must have at least 2 points');
      if (!mongoose.isValidObjectId(groupId))
        throw new BadRequestError(`groupId=${groupId} is not a valid ObjectId`);
      if (
        isOnRegion
          ? !(await regionService.isUserContributorOnRegion(
              new mongoose.Types.ObjectId(req.session.userId),
              new mongoose.Types.ObjectId(groupId)
            ))
          : !(await nogoGroupService.doesUserOwnNogoGroup(
              new mongoose.Types.ObjectId(req.session.userId),
              new mongoose.Types.ObjectId(groupId)
            ))
      )
        throw new UnauthorizedError(
          `User does not have access to ${isOnRegion ? 'Region' : 'Nogo Group'}`
        );

      const routeData = await routerService.getRouteForNewNogo(points);
      const route = routeData.route;

      const routeIsOutsideRegion =
        isOnRegion &&
        !(await regionService.isLineStringInRegion(
          route,
          new mongoose.Types.ObjectId(groupId)
        ));
      if (routeIsOutsideRegion)
        throw new BadRequestError('Nogo must be inside selected region');

      const newNogo: INogoCreateDTO = isOnRegion
        ? {
            lineString: route,
            region: new mongoose.Types.ObjectId(groupId),
          }
        : {
            lineString: route,
            nogoGroup: new mongoose.Types.ObjectId(groupId),
          };
      const { nogo, error } = await nogoService.create(newNogo);

      if (error) throw new InternalServerError(error);
      if (!nogo) throw new InternalServerError('Nogo could not be created');

      return res.json({ nogo });
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
        const updateCount = await nogoService.transferNogosToRegion(
          nogoGroupId,
          regionId
        );
        return res.json({ updateCount });
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
