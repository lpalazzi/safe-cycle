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

export const nogo = (app: express.Router) => {
  const route = express.Router();
  app.use('/nogo', route);
  const nogoService = container.resolve(NogoService);

  route.get('/getAllByList/:nogoListId', async (req, res, next) => {
    try {
      if (!mongoose.isValidObjectId(req.params.nogoListId)) {
        throw new BadRequestError(
          `${req.params.nogoListId} is not a valid ObjectId`
        );
      }
      const nogoListId = new mongoose.Types.ObjectId(req.params.nogoListId);
      const nogos = await nogoService.getAllByList(nogoListId);
      return res.json({ nogos });
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
        throw new InternalServerError('NOGO could not be created');
      }

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
          'User is not authorized to delete this NOGO'
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
