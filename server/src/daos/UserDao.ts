import mongoose from 'mongoose';
import { IUser, IUserReturnDTO } from 'interfaces';
import { UserModel } from 'models';
import { BaseDao } from './BaseDao';

export class UserDao extends BaseDao<IUser, IUserReturnDTO> {
  constructor() {
    super(UserModel);
  }

  async getHashById(id: mongoose.Types.ObjectId) {
    const document = await this.model
      .findById(id)
      .select('passwordHash')
      .lean();
    return document?.passwordHash;
  }
}
