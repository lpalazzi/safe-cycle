import express from 'express';
import mongoose from 'mongoose';
import { container } from 'tsyringe';
import { NogoService } from 'services';
import { INogoCreateDTO } from 'interfaces';
import { checkLoggedIn } from 'api/middlewares';
import {
  BadRequestError,
  InternalServerError,
  UnauthorizedError,
} from 'api/errors';

export const nogos = (app: express.Router) => {
  const route = express.Router();
  app.use('/nogo', route);
  const nogoService = container.resolve(NogoService);

  route.get('/getAllByList', async (req, res, next) => {
    try {
      const nogoListId = new mongoose.Types.ObjectId(req.body.nogoListId);
      const nogos = await nogoService.getAllByList(nogoListId);
      return res.json({ nogos });
    } catch (err) {
      next(err);
    }
  });

  route.delete('/deleteByIds', checkLoggedIn, async (req, res, next) => {
    try {
      const nogoIds = req.body.nogoIds;
      const userId = new mongoose.Types.ObjectId(req.session.userId);

      if (!nogoIds || !(nogoIds instanceof Array<string>)) {
        throw new BadRequestError(
          'Request incorrectly formatted: nogoIds must be an array of strings'
        );
      }
      const nogoObjIds = nogoIds.map(
        (nogoId) => new mongoose.Types.ObjectId(nogoId)
      );

      const userCanDelete = nogoObjIds.every((nogoId) => {
        return nogoService.canUserUpdateNogo(nogoId, userId);
      });
      if (!userCanDelete) {
        throw new UnauthorizedError(
          'User is not authorized to delete these Nogos'
        );
      }

      const deleteResult = await nogoService.deleteByIds(nogoObjIds);
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

  route.post('/create', checkLoggedIn, async (req, res, next) => {
    try {
      const newNogo: INogoCreateDTO = req.body.nogo;
      const { nogo, error } = await nogoService.create(newNogo);

      if (error) {
        throw new BadRequestError(error);
      } else if (!nogo) {
        throw new InternalServerError('Nogo could not be created');
      }

      return res.json({ nogo });
    } catch (err) {
      next(err);
    }
  });
};
