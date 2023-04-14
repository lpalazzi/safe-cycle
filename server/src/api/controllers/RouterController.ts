import express from 'express';
import mongoose from 'mongoose';
import { container } from 'tsyringe';
import { RouterService } from 'services';
import { RouteOptions } from 'types';
import { BadRequestError, ServiceUnavailableError } from 'api/errors';

export const router = (app: express.Router) => {
  const route = express.Router();
  app.use('/router', route);
  const routerService = container.resolve(RouterService);

  route.post('/generateRoute', async (req, res, next) => {
    try {
      const points: GeoJSON.Position[] = req.body.points ?? [];
      const nogoGroupIds: string[] = req.body.nogoGroupIds ?? [];
      const regionIds: string[] = req.body.regionIds ?? [];
      const routeOptions: RouteOptions = req.body.routeOptions ?? {
        alternativeidx: 0,
      };

      if (points.length < 2)
        throw new BadRequestError('Route request must have at least 2 points');

      const invalidNogoGroupId = nogoGroupIds.find(
        (nogoGroupId) => !mongoose.isValidObjectId(nogoGroupId)
      );
      const invalidRegionId = regionIds.find(
        (regionId) => !mongoose.isValidObjectId(regionId)
      );
      if (invalidNogoGroupId || invalidRegionId) {
        const errorText = invalidNogoGroupId
          ? `nogoGroupId=${invalidNogoGroupId}`
          : `regionId=${invalidRegionId}`;
        throw new BadRequestError(`${errorText} is not a valid ObjectId`);
      }

      try {
        const routes = await routerService.getRouteForUser(
          points,
          nogoGroupIds.map(
            (nogoGroupId) => new mongoose.Types.ObjectId(nogoGroupId)
          ),
          regionIds.map((regionId) => new mongoose.Types.ObjectId(regionId)),
          routeOptions
        );

        return res.json({ routes });
      } catch (error: any) {
        if (
          String(error.message).includes(
            'position not mapped in existing datafile'
          )
        )
          throw new BadRequestError(
            'One or more of your points are not close enough to a routable location. Please select another point.'
          );

        if (
          String(error.message).includes(
            'operation killed by thread-priority-watchdog'
          )
        )
          throw new ServiceUnavailableError(
            'Routing service is busy, please try again'
          );

        console.log(error.message); // Log unhandled BRouter errors to console
        throw new Error(error.message ?? 'BRouter error');
      }
    } catch (err) {
      next(err);
    }
  });
};
