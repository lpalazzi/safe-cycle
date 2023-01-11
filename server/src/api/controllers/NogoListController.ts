import express from 'express';
import mongoose from 'mongoose';
import { container } from 'tsyringe';
import { NogoListService } from 'services';
import { INogoListCreateDTO, INogoListUpdateDTO } from 'interfaces';
import {
  BadRequestError,
  InternalServerError,
  UnauthorizedError,
} from 'api/errors';
import { checkLoggedIn } from 'api/middlewares';

export const nogoList = (app: express.Router) => {
  const route = express.Router();
  app.use('/nogoList', route);
  const nogoListService = container.resolve(NogoListService);

  route.get('/getAll', async (req, res, next) => {
    try {
      const nogoLists = await nogoListService.getAll();
      return res.json({
        nogoLists,
      });
    } catch (err) {
      next(err);
    }
  });

  route.get('/getAllForUser', checkLoggedIn, async (req, res, next) => {
    try {
      const userId = new mongoose.Types.ObjectId(req.session.userId);
      const nogoLists = await nogoListService.getByUserId(userId);
      return res.json({
        nogoLists,
      });
    } catch (err) {
      next(err);
    }
  });

  route.post('/create', checkLoggedIn, async (req, res, next) => {
    try {
      const newNogoList: INogoListCreateDTO = req.body.nogoList;
      const userId = new mongoose.Types.ObjectId(req.session.userId);
      const { nogoList, error } = await nogoListService.create(
        newNogoList,
        userId
      );

      if (error) {
        throw new BadRequestError(error);
      } else if (!nogoList) {
        throw new InternalServerError('Nogo List could not be created');
      }

      return res.json({ nogoList });
    } catch (err) {
      next(err);
    }
  });

  route.post('/update/:id', checkLoggedIn, async (req, res, next) => {
    try {
      if (!mongoose.isValidObjectId(req.params.id)) {
        throw new BadRequestError(`${req.params.id} is not a valid ObjectId`);
      }
      const nogoListId = new mongoose.Types.ObjectId(req.params.id);
      const nogoListUpdate: INogoListUpdateDTO = req.body.nogoListUpdate;
      const userId = new mongoose.Types.ObjectId(req.session.userId);
      const userOwnsNogoList = await nogoListService.doesUserOwnNogoList(
        nogoListId,
        userId
      );
      if (!userOwnsNogoList) {
        throw new UnauthorizedError(
          'User is not authorized to modify this NOGO List'
        );
      }

      const { updatedNogoList, error } = await nogoListService.updateById(
        nogoListId,
        nogoListUpdate
      );
      if (error) {
        throw new InternalServerError(error);
      }

      return res.json({ updatedNogoList });
    } catch (err) {
      next(err);
    }
  });

  route.post('/delete/:id', checkLoggedIn, async (req, res, next) => {
    try {
      if (!mongoose.isValidObjectId(req.params.id)) {
        throw new BadRequestError(`${req.params.id} is not a valid ObjectId`);
      }
      const nogoListId = new mongoose.Types.ObjectId(req.params.id);
      const userId = new mongoose.Types.ObjectId(req.session.userId);
      const userOwnsNogoList = await nogoListService.doesUserOwnNogoList(
        nogoListId,
        userId
      );
      if (!userOwnsNogoList) {
        throw new UnauthorizedError(
          'User is not authorized to delete this NOGO List'
        );
      }

      const deleteResult = await nogoListService.deleteById(nogoListId);
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
