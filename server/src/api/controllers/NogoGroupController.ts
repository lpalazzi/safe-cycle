import express from 'express';
import mongoose from 'mongoose';
import { container } from 'tsyringe';
import { NogoGroupService } from 'services';
import { INogoGroupCreateDTO, INogoGroupUpdateDTO } from 'interfaces';
import { checkAdmin, checkLoggedIn } from 'api/middlewares';
import {
  BadRequestError,
  InternalServerError,
  UnauthorizedError,
} from 'api/errors';

export const nogoGroup = (app: express.Router) => {
  const route = express.Router();
  app.use('/nogoGroup', route);
  const nogoGroupService = container.resolve(NogoGroupService);

  route.get('/getAll', checkLoggedIn, checkAdmin, async (req, res, next) => {
    try {
      const nogoGroups = await nogoGroupService.getAll();
      return res.json({
        nogoGroups,
      });
    } catch (err) {
      next(err);
    }
  });

  route.get('/getAllForUser', checkLoggedIn, async (req, res, next) => {
    try {
      const userId = new mongoose.Types.ObjectId(req.session.userId);
      const nogoGroups = await nogoGroupService.getByUserId(userId);
      return res.json({
        nogoGroups,
      });
    } catch (err) {
      next(err);
    }
  });

  route.post('/create', checkLoggedIn, async (req, res, next) => {
    try {
      const newNogoGroup: INogoGroupCreateDTO = req.body.nogoGroup;
      const userId = new mongoose.Types.ObjectId(req.session.userId);
      const { nogoGroup, error } = await nogoGroupService.create(
        newNogoGroup,
        userId
      );

      if (error) {
        throw new BadRequestError(error);
      } else if (!nogoGroup) {
        throw new InternalServerError('Nogo Group could not be created');
      }

      return res.json({ nogoGroup });
    } catch (err) {
      next(err);
    }
  });

  route.post('/update/:id', checkLoggedIn, async (req, res, next) => {
    try {
      if (!mongoose.isValidObjectId(req.params.id)) {
        throw new BadRequestError(`${req.params.id} is not a valid ObjectId`);
      }
      const nogoGroupId = new mongoose.Types.ObjectId(req.params.id);
      const nogoGroupUpdate: INogoGroupUpdateDTO = req.body.nogoGroupUpdate;
      const userId = new mongoose.Types.ObjectId(req.session.userId);
      const userOwnsNogoGroup = await nogoGroupService.doesUserOwnNogoGroup(
        userId,
        nogoGroupId
      );
      if (!userOwnsNogoGroup) {
        throw new UnauthorizedError(
          'User is not authorized to modify this Nogo Group'
        );
      }

      const { updatedNogoGroup, error } = await nogoGroupService.updateById(
        nogoGroupId,
        nogoGroupUpdate
      );
      if (error) {
        throw new InternalServerError(error);
      }

      return res.json({ updatedNogoGroup });
    } catch (err) {
      next(err);
    }
  });

  route.delete('/delete/:id', checkLoggedIn, async (req, res, next) => {
    try {
      if (!mongoose.isValidObjectId(req.params.id)) {
        throw new BadRequestError(`${req.params.id} is not a valid ObjectId`);
      }
      const nogoGroupId = new mongoose.Types.ObjectId(req.params.id);
      const userId = new mongoose.Types.ObjectId(req.session.userId);
      const userOwnsNogoGroup = await nogoGroupService.doesUserOwnNogoGroup(
        userId,
        nogoGroupId
      );
      if (!userOwnsNogoGroup) {
        throw new UnauthorizedError(
          'User is not authorized to delete this Nogo Group'
        );
      }

      const deleteResult = await nogoGroupService.deleteById(nogoGroupId);
      if (!deleteResult.nogoGroupDeleted) {
        throw new InternalServerError('Delete request was not completed');
      }

      return res.json({ deleteResult });
    } catch (err) {
      next(err);
    }
  });
};
