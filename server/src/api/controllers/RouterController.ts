import express from 'express';
import mongoose from 'mongoose';
import { container } from 'tsyringe';
import { NogoService, RouterService } from 'services';
import { BadRequestError } from 'api/errors';

export const router = (app: express.Router) => {
  const route = express.Router();
  app.use('/router', route);
  const routerService = container.resolve(RouterService);
  const nogoService = container.resolve(NogoService);

  route.post('/generateRoute', async (req, res, next) => {
    try {
      const points: GeoJSON.Position[] = req.body.points ?? [];
      const nogoGroupIds: string[] = req.body.nogoGroupIds ?? [];
      const isNogo = req.query.isNogo === 'true';

      if (points.length < 2) {
        throw new BadRequestError('Route request must have at least 2 points');
      }

      const invalidNogoGroupId = nogoGroupIds.find(
        (nogoGroupId) => !mongoose.isValidObjectId(nogoGroupId)
      );
      if (invalidNogoGroupId) {
        throw new BadRequestError(
          `nogoGroupId=${invalidNogoGroupId} is not a valid ObjectId`
        );
      }

      let route: GeoJSON.LineString;
      let properties: GeoJSON.GeoJsonProperties;
      if (isNogo) {
        const data = await routerService.getRouteForNewNogo(points);
        route = data.route;
        properties = data.properties;
      } else {
        const nogos = (
          await Promise.all(
            nogoGroupIds.map((nogoGroupId) =>
              nogoService.getAllByList(new mongoose.Types.ObjectId(nogoGroupId))
            )
          )
        ).flat();
        const data = await routerService.getRouteForUser(points, nogos);
        route = data.route;
        properties = data.properties;
      }

      return res.json({ route, properties });
    } catch (err) {
      next(err);
    }
  });
};
