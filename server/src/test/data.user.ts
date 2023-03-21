import mongoose from 'mongoose';
import { IUser } from 'interfaces';
import { UserModel } from 'models';
import { UserRole } from 'types';

export const getTestUser = async (role?: UserRole) => {
  var userObj: IUser;
  switch (role) {
    case 'admin':
      userObj = {
        _id: new mongoose.Types.ObjectId('641373a4a54c0b9443fc240f'),
        email: 'admin@email.com',
        passwordHash: 'admin-pw-hash',
        name: {
          first: 'Admin',
          last: 'User',
        },
        role: 'admin',
      };
      break;
    case 'verified contributor':
      userObj = {
        _id: new mongoose.Types.ObjectId('641377dff3db31e4a7e41758'),
        email: 'verified@email.com',
        passwordHash: 'verified-contributor-pw-hash',
        name: {
          first: 'Verified',
          last: 'Contributor',
        },
        role: 'verified contributor',
      };
      break;
    default:
      userObj = {
        _id: new mongoose.Types.ObjectId('6413781dc533d1d592d66c23'),
        email: 'test_user@email.com',
        passwordHash: 'test-user-pw-hash',
        name: {
          first: 'Test',
          last: 'User',
        },
      };
      break;
  }

  const existingUser: IUser | null = await UserModel.findById(userObj._id);
  if (existingUser) return existingUser;
  const createdUser: IUser = await UserModel.create(userObj);
  return createdUser;
};
