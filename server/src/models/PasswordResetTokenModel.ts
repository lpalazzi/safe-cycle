import { IPasswordResetToken } from 'interfaces';
import mongoose from 'mongoose';

const PasswordResetTokenSchema = new mongoose.Schema<IPasswordResetToken>({
  hash: {
    type: String,
    required: true,
  },
  user: {
    type: mongoose.SchemaTypes.ObjectId,
    required: true,
    ref: 'User',
  },
});

export const PasswordResetTokenModel = mongoose.model<IPasswordResetToken>(
  'PasswordResetToken',
  PasswordResetTokenSchema
);
