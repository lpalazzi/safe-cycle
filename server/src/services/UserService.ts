import mongoose from 'mongoose';
import { injectable } from 'tsyringe';
import { UserDao } from 'daos';
import { IUser } from 'interfaces';
import { NoID, UserRole, UserSettings } from 'types';

@injectable()
export class UserService {
  constructor(private userDao: UserDao) {}

  async getAll() {
    return await this.userDao.get({});
  }

  async getById(userId: mongoose.Types.ObjectId) {
    return await this.userDao.getById(userId);
  }

  async existsByEmail(email: string) {
    return await this.userDao.exists({ email });
  }

  async getByEmail(email: string) {
    return await this.userDao.getOne({ email });
  }

  async getHashById(userId: mongoose.Types.ObjectId) {
    return await this.userDao.getHashById(userId);
  }

  async create(user: NoID<IUser>) {
    return this.userDao.create(user);
  }

  async isUserAdmin(userId: mongoose.Types.ObjectId) {
    const user = await this.userDao.getById(userId);
    return user?.role === 'admin';
  }

  async updateUserRole(userId: mongoose.Types.ObjectId, role: UserRole) {
    const updateResult = await this.userDao.updateById(userId, { role });
    return updateResult.acknowledged && updateResult.modifiedCount === 1;
  }

  async updateUserSettings(
    userId: mongoose.Types.ObjectId,
    userSettings: Partial<UserSettings>
  ) {
    const user = await this.userDao.getById(userId);
    const currentSettings = user?.settings || {};
    const updateResult = await this.userDao.updateById(userId, {
      settings: { ...currentSettings, ...userSettings },
    });
    return updateResult.acknowledged && updateResult.modifiedCount === 1;
  }

  async changeUserPassword(
    userId: mongoose.Types.ObjectId,
    newPasswordHash: string
  ) {
    const updateResult = await this.userDao.updateById(userId, {
      passwordHash: newPasswordHash,
    });
    return updateResult.acknowledged && updateResult.modifiedCount === 1;
  }
}
