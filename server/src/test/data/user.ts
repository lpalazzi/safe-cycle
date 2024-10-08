import mongoose from 'mongoose';
import argon2 from 'argon2';
import { IUser } from 'interfaces';
import { UserModel } from 'models';
import { NoID, UserRole } from 'types';

export const createTestUser = async (role?: UserRole) => {
  var userObj: IUser;
  const passwordHash = await argon2.hash('password');
  const id = new mongoose.Types.ObjectId();

  switch (role) {
    case 'admin':
      userObj = {
        _id: id,
        email: `${id}@admin.com`,
        passwordHash: passwordHash,
        name: {
          first: 'Admin',
          last: 'User',
        },
        role: 'admin',
      };
      break;
    case 'verified contributor':
      userObj = {
        _id: id,
        email: `${id}@verified.com`,
        passwordHash: passwordHash,
        name: {
          first: 'Verified',
          last: 'Contributor',
        },
        role: 'verified contributor',
      };
      break;
    default:
      userObj = {
        _id: id,
        email: `${id}@testuser.com`,
        passwordHash: passwordHash,
        name: {
          first: 'Test',
          last: 'User',
        },
      };
      break;
  }

  const createdUser: IUser = await UserModel.create(userObj);
  return createdUser;
};

export const createMultipleTestUsers = async (number: number) => {
  const userObjs: NoID<IUser>[] = Array.apply(null, Array(number)).map(() => ({
    email: `${number}@email.com`,
    passwordHash: 'password_hash',
    name: {
      first: 'User',
      last: number.toString(),
    },
  }));
  const createdUsers: IUser[] = await UserModel.create(...userObjs);
  return createdUsers;
};
