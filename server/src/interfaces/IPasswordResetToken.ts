import mongoose from 'mongoose';

export interface IPasswordResetToken {
  _id: mongoose.Types.ObjectId;
  hash: string;
  user: mongoose.Types.ObjectId;
}
