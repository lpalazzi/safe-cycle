import express from 'express';
import mongoose from 'mongoose';
import joi from 'joi';
import { container } from 'tsyringe';
import { UserService } from 'services';
import {
  ModelNotFoundError,
  BadRequestError,
  InternalServerError,
} from 'api/errors';
import { UserRole, UserSettings } from 'types';
import {
  IUserChangePasswordDTO,
  IUserLoginDTO,
  IUserSignupDTO,
} from 'interfaces';
import { checkLoggedIn, checkAdmin } from 'api/middlewares';

export const user = (app: express.Router) => {
  const route = express.Router();
  app.use('/user', route);
  const userService = container.resolve(UserService);

  route.get('/getAll', checkLoggedIn, checkAdmin, async (req, res, next) => {
    try {
      const users = await userService.getAll();
      return res.json({
        users,
      });
    } catch (err) {
      next(err);
    }
  });

  route.get(
    '/getById/:userId',
    checkLoggedIn,
    checkAdmin,
    async (req, res, next) => {
      try {
        if (!req.params.userId) {
          throw new BadRequestError('userId not provided');
        }
        if (!mongoose.isValidObjectId(req.params.userId)) {
          throw new BadRequestError('userId is not a valid ObjectId');
        }
        const userId = new mongoose.Types.ObjectId(req.params.userId);
        const user = await userService.getById(userId);
        if (!user) throw new InternalServerError('User not found');
        return res.json({ user });
      } catch (err) {
        next(err);
      }
    }
  );

  route.get('/getActiveUser', async (req, res, next) => {
    try {
      const userId = req.session?.userId;

      if (!userId) {
        return res.json({
          user: null,
        });
      }

      if (!mongoose.isValidObjectId(req.session.userId)) {
        throw new InternalServerError('Stored userId is not a valid ObjectId');
      }

      const user = await userService.getById(
        new mongoose.Types.ObjectId(userId)
      );

      if (!user) {
        throw new ModelNotFoundError('User not found');
      }

      return res.json({
        user,
      });
    } catch (err) {
      next(err);
    }
  });

  route.post('/signup', async (req, res, next) => {
    try {
      const userSignup: IUserSignupDTO = req.body.userSignup;
      const { user, error } = await userService.signup(userSignup);

      if (error) {
        throw new BadRequestError(error);
      } else if (!user) {
        throw new InternalServerError('User could not be created');
      }

      req.session.userId = user._id.toString();
      return res.json({ user });
    } catch (err) {
      next(err);
    }
  });

  route.post('/login', async (req, res, next) => {
    try {
      const userLogin: IUserLoginDTO = req.body.userLogin;
      const { user, error } = await userService.login(userLogin);

      if (error) {
        throw new BadRequestError(error);
      } else if (!user) {
        throw new InternalServerError('Could not sign in user');
      }

      req.session.userId = user._id.toString();
      return res.json({ user });
    } catch (err) {
      next(err);
    }
  });

  route.post('/logout', async (req, res, next) => {
    try {
      req.session.destroy(() => {
        return res.json({
          success: true,
        });
      });
    } catch (err) {
      next(err);
    }
  });

  route.post('/changePassword', checkLoggedIn, async (req, res, next) => {
    try {
      const userId = new mongoose.Types.ObjectId(req.session.userId);
      const changePasswordDTO: IUserChangePasswordDTO =
        req.body.changePasswordDTO;

      const { success, error } = await userService.changePassword(
        userId,
        changePasswordDTO
      );

      if (error) throw new BadRequestError(error);

      return res.json({ success });
    } catch (err) {
      next(err);
    }
  });

  route.post(
    '/updateUserRole',
    checkLoggedIn,
    checkAdmin,
    async (req, res, next) => {
      try {
        if (!req.body.userId) {
          throw new BadRequestError('userId not provided');
        }
        if (!mongoose.isValidObjectId(req.body.userId)) {
          throw new BadRequestError('userId is not a valid ObjectId');
        }
        const userId = new mongoose.Types.ObjectId(req.body.userId);
        const role: UserRole = req.body.role;
        if (![null, 'admin', 'verified contributor'].includes(role))
          throw new BadRequestError('Role must be a valid role');

        const success = await userService.updateUserRole(userId, role);
        if (!success) {
          throw new InternalServerError(
            'Role could not be updated for this user'
          );
        }
        return res.json({
          success: true,
        });
      } catch (err) {
        next(err);
      }
    }
  );

  route.post('/updateUserSettings', checkLoggedIn, async (req, res, next) => {
    try {
      const userId = new mongoose.Types.ObjectId(req.session.userId);
      const userSettings: Partial<UserSettings> = req.body.userSettings;
      if (!userSettings)
        throw new BadRequestError('No settings update provided');
      const { error } = joi
        .object({
          privateNogosEnabled: joi.boolean(),
        })
        .required()
        .validate(userSettings);
      if (error)
        throw new BadRequestError('Validation error: ' + error.message);

      const success = await userService.updateUserSettings(
        userId,
        userSettings
      );
      if (!success) {
        throw new InternalServerError('User settings could not be updated');
      }
      return res.json({
        success: true,
      });
    } catch (err) {
      next(err);
    }
  });
};
