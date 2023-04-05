import express from 'express';
import mongoose from 'mongoose';
import joi from 'joi';
import argon2 from 'argon2';
import { container } from 'tsyringe';
import {
  ModelNotFoundError,
  BadRequestError,
  InternalServerError,
  DataNotFoundError,
} from 'api/errors';
import { checkLoggedIn, checkAdmin } from 'api/middlewares';
import { UserService } from 'services';
import { UserRole, UserSettings } from 'types';
import {
  IUserChangePasswordDTO,
  IUserLoginDTO,
  IUserSignupDTO,
} from 'interfaces';

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
        if (!req.params.userId)
          throw new BadRequestError('userId not provided');
        if (!mongoose.isValidObjectId(req.params.userId))
          throw new BadRequestError('userId is not a valid ObjectId');
        const userId = new mongoose.Types.ObjectId(req.params.userId);
        const user = await userService.getById(userId);
        if (!user) throw new ModelNotFoundError('User not found');
        return res.json({ user });
      } catch (err) {
        next(err);
      }
    }
  );

  route.get('/getActiveUser', async (req, res, next) => {
    try {
      const userId = req.session?.userId;
      if (!userId || !mongoose.isValidObjectId(userId)) {
        return res.json({
          user: null,
        });
      }

      const user = await userService.getById(
        new mongoose.Types.ObjectId(userId)
      );
      if (!user) throw new ModelNotFoundError('User not found');

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
      const { error } = joi
        .object({
          email: joi.string().email().required(),
          password: joi.string().min(8).max(64).required(),
          name: joi
            .object({
              first: joi.string().required(),
              last: joi.string().required(),
            })
            .required(),
        })
        .required()
        .validate(userSignup);
      if (error) throw new BadRequestError(error.message);

      const userExistsWithEmail = await userService.existsByEmail(
        userSignup.email
      );
      if (userExistsWithEmail)
        throw new BadRequestError('A user already exists with this email');

      const { password, ...userToCreate } = userSignup;
      const passwordHash = await argon2.hash(password);
      const user = await userService.create({ ...userToCreate, passwordHash });
      if (!user) throw new InternalServerError('User could not be created');

      req.session.userId = user._id.toString();
      return res.json({ user });
    } catch (err) {
      next(err);
    }
  });

  route.post('/login', async (req, res, next) => {
    try {
      const userLogin: IUserLoginDTO = req.body.userLogin;
      const { error } = joi
        .object({
          email: joi.string().required(),
          password: joi.string().required(),
        })
        .required()
        .validate(userLogin);
      if (error) throw new BadRequestError(error.message);

      const user = await userService.getByEmail(userLogin.email);
      if (!user)
        throw new ModelNotFoundError(
          `User with email ${userLogin.email} not found`
        );
      const passwordHash = await userService.getHashById(user._id);
      if (!passwordHash)
        throw new DataNotFoundError('User does not have a password');
      const verified = await argon2.verify(passwordHash, userLogin.password);
      if (!verified) throw new BadRequestError('Incorrect password');

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
      const { error } = joi
        .object({
          currentPassword: joi.string().required(),
          newPassword: joi.string().min(8).max(64).required(),
        })
        .required()
        .validate(changePasswordDTO);
      if (error) throw new BadRequestError(error.message);
      const user = await userService.getById(userId);
      if (!user)
        throw new ModelNotFoundError(
          `No user found with id=${userId.toString()}`
        );
      const { currentPassword, newPassword } = changePasswordDTO;
      const currentPasswordHash = await userService.getHashById(user._id);
      const correctCurrentPassword = await argon2.verify(
        currentPasswordHash ?? '',
        currentPassword
      );
      if (!correctCurrentPassword)
        throw new BadRequestError('Incorrect current password');

      const newPasswordHash = await argon2.hash(newPassword);
      const success = await userService.changeUserPassword(
        user._id,
        newPasswordHash
      );
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
        if (!req.body.userId) throw new BadRequestError('userId not provided');
        if (!mongoose.isValidObjectId(req.body.userId))
          throw new BadRequestError('userId is not a valid ObjectId');

        const userId = new mongoose.Types.ObjectId(req.body.userId);
        const role: UserRole = req.body.role;
        if (![null, 'admin', 'verified contributor'].includes(role))
          throw new BadRequestError('Role must be a valid role');

        const success = await userService.updateUserRole(userId, role);
        return res.json({ success });
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
      return res.json({ success });
    } catch (err) {
      next(err);
    }
  });
};
