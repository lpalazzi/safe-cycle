import express from 'express';
import mongoose from 'mongoose';
import { container } from 'tsyringe';
import { NogoGroupService, NogoService, RouterService } from 'services';
import { INogoCreateDTO } from 'interfaces';
import { checkLoggedIn } from 'api/middlewares';
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
  const routerService = container.resolve(RouterService);

  route.get('/getAllByList/:nogoGroupId', async (req, res, next) => {
    try {
      if (!mongoose.isValidObjectId(req.params.nogoGroupId)) {
        throw new BadRequestError(
          `${req.params.nogoGroupId} is not a valid ObjectId`
        );
      }
      const nogoGroupId = new mongoose.Types.ObjectId(req.params.nogoGroupId);
      const nogos = await nogoService.getAllByList(nogoGroupId);
      return res.json({ nogos });
    } catch (err) {
      next(err);
    }
  });

  route.post('/create', checkLoggedIn, async (req, res, next) => {
    try {
      const points: GeoJSON.Position[] = req.body.points ?? [];
      const nogoGroupId: string = req.body.nogoGroupId;

      if (points.length < 2)
        throw new BadRequestError('Route request must have at least 2 points');
      if (!mongoose.isValidObjectId(nogoGroupId))
        throw new BadRequestError(
          `nogoGroupId=${nogoGroupId} is not a valid ObjectId`
        );
      if (
        !nogoGroupService.doesUserOwnNogoGroup(
          new mongoose.Types.ObjectId(nogoGroupId),
          new mongoose.Types.ObjectId(req.session.userId)
        )
      )
        throw new UnauthorizedError('User does not have access to Nogo Group');

      const routeData = await routerService.getRouteForNewNogo(points);
      const route = routeData.route;
      const newNogo: INogoCreateDTO = {
        lineString: route,
        nogoGroup: new mongoose.Types.ObjectId(nogoGroupId),
      };
      const { nogo, error } = await nogoService.create(newNogo);

      if (error) throw new InternalServerError(error);
      if (!nogo) throw new InternalServerError('Nogo could not be created');

      return res.json({ nogo });
    } catch (err) {
      next(err);
    }
  });

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
          'User is not authorized to delete this Nogo'
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
