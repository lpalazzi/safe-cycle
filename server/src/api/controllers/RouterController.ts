import express from 'express';
import mongoose from 'mongoose';
import { container } from 'tsyringe';
import { RouterService } from 'services';
import { RouteOptions } from 'types';
import { BadRequestError } from 'api/errors';

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

      if (![undefined, 0, 1, 2, 3].includes(routeOptions.alternativeidx))
        throw new BadRequestError(
          'alternativeidx must be a valid integer from 0 to 3'
        );

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

      const data = await routerService.getRouteForUser(
        points,
        nogoGroupIds,
        regionIds,
        routeOptions
      );
      const route: GeoJSON.LineString = data.route;
      const properties: GeoJSON.GeoJsonProperties = data.properties;

      return res.json({ route, properties });
    } catch (err) {
      next(err);
    }
  });
};
