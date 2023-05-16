import mongoose from 'mongoose';
import express, { Request } from 'express';
import { container } from 'tsyringe';
import joi from 'joi';
import { RouterService } from 'services';
import { RouteOptions } from 'types';
import {
  BadGatewayError,
  BadRequestError,
  ServiceUnavailableError,
} from 'api/errors';

export const router = (app: express.Router) => {
  const route = express.Router();
  app.use('/router', route);
  const routerService = container.resolve(RouterService);

  route.post('/generateRoute', async (req, res, next) => {
    try {
      const { points, nogoGroupIds, regionIds, routeOptions } =
        validateRouteRequest(req);

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
        parseRoutingError(error.message);
      }
    } catch (err) {
      next(err);
    }
  });

  route.post('/downloadGPX', async (req, res, next) => {
    try {
      const { points, nogoGroupIds, regionIds, routeOptions } =
        validateRouteRequest(req);
      const alternativeIdx: 0 | 1 | 2 | 3 = req.body.alternativeIdx;

      if (
        alternativeIdx !== 0 &&
        alternativeIdx !== 1 &&
        alternativeIdx !== 2 &&
        alternativeIdx !== 3
      )
        throw new BadRequestError('alternativeIdx is not an accepted value');

      try {
        const gpx = await routerService.getGPX(
          points,
          nogoGroupIds.map(
            (nogoGroupId) => new mongoose.Types.ObjectId(nogoGroupId)
          ),
          regionIds.map((regionId) => new mongoose.Types.ObjectId(regionId)),
          routeOptions,
          alternativeIdx
        );

        return res.json({ gpx });
      } catch (error: any) {
        parseRoutingError(error.message);
      }
    } catch (err) {
      next(err);
    }
  });

  const validateRouteRequest = (req: Request) => {
    const points: GeoJSON.Position[] = req.body.points ?? [];
    const nogoGroupIds: string[] = req.body.nogoGroupIds ?? [];
    const regionIds: string[] = req.body.regionIds ?? [];
    const routeOptions: RouteOptions = req.body.routeOptions ?? {};

    const { error } = joi
      .object({
        points: joi.array().items(joi.geojson().position()).min(2).required(),
        nogoGroupIds: joi.array().items(joi.objectId()).required(),
        regionIds: joi.array().items(joi.objectId()).required(),
        routeOptions: joi
          .object({
            shortest: joi.boolean(),
            preferBikeFriendly: joi.boolean(),
            preferCycleRoutes: joi.boolean(),
            surfacePreference: joi
              .string()
              .valid('strictPaved', 'preferPaved', 'none', 'preferUnpaved'),
            showAlternateRoutes: joi.boolean(),
          })
          .required(),
      })
      .required()
      .validate({ points, nogoGroupIds, regionIds, routeOptions });

    if (error) throw new BadRequestError(error.message);

    return { points, nogoGroupIds, regionIds, routeOptions };
  };

  const parseRoutingError = (error: string) => {
    if (String(error).includes('position not mapped in existing datafile'))
      throw new BadRequestError(
        'One of your points is not close enough to a routable location. Please select another point.'
      );

    if (String(error).includes('target island detected'))
      throw new BadRequestError(
        'Nogos are blocking a route to one of your waypoints. Please select another point or disable "Avoid nogos".'
      );

    if (String(error).includes('operation killed by thread-priority-watchdog'))
      throw new ServiceUnavailableError(
        'Our servers are currently busy, please try again.'
      );

    if (String(error).includes('timeout after'))
      throw new BadGatewayError('Server timed out, please try again.');

    console.log(error); // Log unhandled BRouter errors to console
    throw new Error(error ?? 'BRouter error');
  };
};
