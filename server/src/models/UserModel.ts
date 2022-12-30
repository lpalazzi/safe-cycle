import mongoose from 'mongoose';
import { IUser } from 'interfaces';

const UserSchema = new mongoose.Schema<IUser>({
  email: {
    type: String,
    required: true,
  },
  passwordHash: {
    type: String,
    required: true,
  },
  name: {
    first: String,
    last: String,
  },
});

UserSchema.virtual('fullName').get(function () {
  return (this.name?.first + ' ' + this.name?.last).trim();
});

export const UserModel = mongoose.model<IUser>('User', UserSchema);
