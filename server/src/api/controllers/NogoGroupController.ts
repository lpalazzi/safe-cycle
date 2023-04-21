import express from 'express';
import mongoose from 'mongoose';
import joi from 'joi';
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

      const { error } = joi
        .object({
          name: joi.string().required(),
        })
        .required()
        .validate(newNogoGroup);

      if (error)
        throw new BadRequestError(
          error.message || 'Request was not formatted correctly'
        );

      const nameIsTaken = await nogoGroupService.existsWithName(
        newNogoGroup.name.trim(),
        userId
      );
      if (nameIsTaken)
        throw new BadRequestError(
          `Name \"${newNogoGroup.name}\" is already taken`
        );

      const nogoGroup = await nogoGroupService.create(newNogoGroup, userId);
      if (!nogoGroup)
        throw new InternalServerError('Nogo Group could not be created');

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

      const updateResult = await nogoGroupService.updateById(
        nogoGroupId,
        nogoGroupUpdate
      );

      if (!updateResult.acknowledged)
        throw new InternalServerError('Nogo Group was not modified');

      return res.json({ success: true });
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
