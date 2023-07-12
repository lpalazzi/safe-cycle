import { BaseDao } from './BaseDao';
import { IPasswordResetToken } from 'interfaces';
import { PasswordResetTokenModel } from 'models';

export class PasswordResetTokenDao extends BaseDao<IPasswordResetToken> {
  constructor() {
    super(PasswordResetTokenModel);
  }
}
