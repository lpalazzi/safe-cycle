import express from 'express';
import mongoose from 'mongoose';
import { container } from 'tsyringe';
import { NogoListService } from 'services';
import { INogoListCreateDTO } from 'interfaces';
import { BadRequestError, InternalServerError } from 'api/errors';
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
};
