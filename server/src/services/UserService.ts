import mongoose from 'mongoose';
import { injectable, inject } from 'tsyringe';
import argon2 from 'argon2';
import { IUser } from 'interfaces';
import { UserDao, PasswordResetTokenDao } from 'daos';
import { EmailService } from 'services';
import { NoID, UserRole, UserSettings } from 'types';

@injectable()
export class UserService {
  constructor(
    private userDao: UserDao,
    private passwordResetTokenDao: PasswordResetTokenDao,
    @inject('EmailService') private emailService: EmailService
  ) {}

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

  async createPasswordResetToken(userEmail: string) {
    const user = await this.getByEmail(userEmail);
    if (!user) return;

    const token = Math.random().toString(36).substring(2);
    const hash = await argon2.hash(token);
    const existingToken = await this.passwordResetTokenDao.getOne({
      user: user._id,
    });

    if (existingToken)
      this.passwordResetTokenDao.updateById(existingToken._id, { hash });
    else this.passwordResetTokenDao.create({ hash, user: user._id });

    this.emailService.sendEmail({
      from: 'contact@safecycle.xyz',
      replyTo: '',
      to: [user.email],
      subject: 'SafeCycle password reset',
      message: `Your password reset code is ${token}. This code can only be used once.`,
    });
  }

  async verifyPasswordResetToken(
    userId: mongoose.Types.ObjectId,
    token: string
  ) {
    const user = await this.userDao.getById(userId);
    if (!user) return false;

    const existingToken = await this.passwordResetTokenDao.getOne({
      user: user._id,
    });
    if (!existingToken) return false;

    return argon2.verify(existingToken.hash, token);
  }

  async deletePasswordResetTokenForUser(userId: mongoose.Types.ObjectId) {
    return this.passwordResetTokenDao.deleteMany({ user: userId });
  }
}
