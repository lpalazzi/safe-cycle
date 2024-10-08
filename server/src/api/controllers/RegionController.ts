import express from 'express';
import mongoose from 'mongoose';
import joi from 'joi';
import { container } from 'tsyringe';
import { RegionService } from 'services';
import { IRegionCreateDTO } from 'interfaces';
import { BadRequestError, InternalServerError } from 'api/errors';
import { checkAdmin, checkLoggedIn } from 'api/middlewares';

export const region = (app: express.Router) => {
  const route = express.Router();
  app.use('/region', route);
  const regionService = container.resolve(RegionService);

  route.get('/getAll', async (req, res, next) => {
    try {
      const userId =
        req.session?.userId && mongoose.isValidObjectId(req.session?.userId)
          ? new mongoose.Types.ObjectId(req.session?.userId)
          : undefined;
      const regions = await regionService.getAll(userId);
      return res.json({
        regions,
      });
    } catch (err) {
      next(err);
    }
  });

  route.post('/create', checkLoggedIn, checkAdmin, async (req, res, next) => {
    try {
      const newRegion: IRegionCreateDTO = req.body.region;
      const { error } = joi
        .object({
          name: joi.string().required(),
          shortName: joi.string().required(),
          polygon: joi.geojson().polygon().required(),
          iso31662: joi.string().required(),
        })
        .required()
        .validate(newRegion);

      if (error)
        throw new BadRequestError(
          error.message || 'Request was not formatted correctly'
        );

      const nameIsTaken = await regionService.existsWithName(
        newRegion.name.trim()
      );
      if (nameIsTaken)
        throw new BadRequestError(
          `Name \"${newRegion.name}\" is already taken`
        );

      const region = await regionService.create(newRegion);
      if (!region) throw new InternalServerError('Region could not be created');

      return res.json({ region });
    } catch (err) {
      next(err);
    }
  });

  route.post(
    '/addContributorToRegion',
    checkLoggedIn,
    checkAdmin,
    async (req, res, next) => {
      try {
        if (!req.body.userId) throw new BadRequestError('userId not provided');
        if (!req.body.regionId)
          throw new BadRequestError('regionId not provided');
        if (!mongoose.isValidObjectId(req.body.userId))
          throw new BadRequestError('userId is not a valid ObjectId');
        if (!mongoose.isValidObjectId(req.body.regionId))
          throw new BadRequestError('regionId is not a valid ObjectId');

        const userId = new mongoose.Types.ObjectId(req.body.userId);
        const regionId = new mongoose.Types.ObjectId(req.body.regionId);

        try {
          const success = await regionService.addContributorToRegion(
            regionId,
            userId
          );
          return res.json({ success });
        } catch (error: any) {
          if (error.message === 'User is already a contributor on this region')
            throw new BadRequestError(error.message);
          throw error;
        }
      } catch (err) {
        next(err);
      }
    }
  );

  route.post(
    '/removeContributorFromRegion',
    checkLoggedIn,
    checkAdmin,
    async (req, res, next) => {
      try {
        if (!req.body.userId) throw new BadRequestError('userId not provided');
        if (!req.body.regionId)
          throw new BadRequestError('regionId not provided');
        if (!mongoose.isValidObjectId(req.body.userId))
          throw new BadRequestError('userId is not a valid ObjectId');
        if (!mongoose.isValidObjectId(req.body.regionId))
          throw new BadRequestError('regionId is not a valid ObjectId');

        const userId = new mongoose.Types.ObjectId(req.body.userId);
        const regionId = new mongoose.Types.ObjectId(req.body.regionId);
        const success = await regionService.removeContributorFromRegion(
          regionId,
          userId
        );
        if (!success) {
          throw new InternalServerError(
            'User could not be removed as a contributor'
          );
        }
        return res.json({ success: true });
      } catch (err) {
        next(err);
      }
    }
  );
};
