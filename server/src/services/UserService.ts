import mongoose from 'mongoose';
import argon2 from 'argon2';
import joi from 'joi';
import { injectable } from 'tsyringe';
import { UserDao } from 'daos';
import {
  IUserLoginDTO,
  IUserChangePasswordDTO,
  IUserReturnDTO,
  IUserSignupDTO,
} from 'interfaces';
import { UserRole } from 'types';

@injectable()
export class UserService {
  constructor(private userDao: UserDao) {}

  async getAll() {
    return await this.userDao.get({});
  }

  async getById(userId: mongoose.Types.ObjectId) {
    return await this.userDao.getById(userId);
  }

  async getByEmail(email: string) {
    return await this.userDao.getOne({ email });
  }

  async isUserAdmin(userId: mongoose.Types.ObjectId) {
    const user = await this.userDao.getById(userId);
    return user?.role === 'admin';
  }

  async updateUserRole(userId: mongoose.Types.ObjectId, role: UserRole) {
    const updateResult = await this.userDao.updateById(userId, { role });
    return updateResult.acknowledged && updateResult.modifiedCount === 1;
  }

  async signup(
    userDTO: IUserSignupDTO
  ): Promise<{ user: IUserReturnDTO | null; error: string | null }> {
    try {
      await this.validateUserSignup(userDTO);
      const { password, ...userToCreate } = userDTO;
      const passwordHash = await argon2.hash(password);
      const user = await this.userDao.create({
        ...userToCreate,
        passwordHash,
      });

      return {
        user,
        error: null,
      };
    } catch (err: any) {
      return {
        user: null,
        error: err.message || 'Unhandled error',
      };
    }
  }

  async login(
    userLogin: IUserLoginDTO
  ): Promise<{ user: IUserReturnDTO | null; error: string | null }> {
    try {
      const { error } = joi
        .object({
          email: joi.string().required(),
          password: joi.string().required(),
        })
        .required()
        .validate(userLogin);

      if (error) {
        throw new Error(error.message);
      }

      const user = await this.getByEmail(userLogin.email);

      if (!user) {
        throw new Error(`User with email ${userLogin.email} not found`);
      }

      const passwordHash = await this.userDao.getHashById(user._id);

      if (!passwordHash) {
        throw new Error('User does not have a password');
      }

      const verified = await argon2.verify(passwordHash, userLogin.password);

      if (!verified) {
        throw new Error(`Incorrect password`);
      }

      return {
        user,
        error: null,
      };
    } catch (err: any) {
      return {
        user: null,
        error: err.message || 'Unhandled login error',
      };
    }
  }

  public async changePassword(
    userId: mongoose.Types.ObjectId,
    changePasswordDTO: IUserChangePasswordDTO
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const user = await this.userDao.getById(userId);
      if (!user) throw new Error(`No user found with id=${userId.toString()}`);

      const { error } = joi
        .object({
          currentPassword: joi.string().required(),
          newPassword: joi.string().min(8).max(64).required(),
        })
        .required()
        .validate(changePasswordDTO);
      if (error) throw new Error(error.message);

      const { currentPassword, newPassword } = changePasswordDTO;
      const currentPasswordHash = await this.userDao.getHashById(user._id);
      const correctCurrentPassword = await argon2.verify(
        currentPasswordHash ?? '',
        currentPassword
      );
      if (!correctCurrentPassword)
        throw new Error('The current password that was submitted is incorrect');

      const newPasswordHash = await argon2.hash(newPassword);
      await this.userDao.updateById(userId, {
        passwordHash: newPasswordHash,
      });

      return {
        success: true,
      };
    } catch (err: any) {
      return {
        success: false,
        error: err.message || 'Unhandled error when changing password',
      };
    }
  }

  private async validateUserSignup(userDTO: IUserSignupDTO) {
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
      .validate(userDTO);

    if (error) {
      throw new Error(error.message);
    }

    const userExistsWithEmail = await this.userDao.exists({
      email: userDTO.email,
    });
    if (userExistsWithEmail) {
      throw new Error('A user already exists with this email');
    }
  }
}
