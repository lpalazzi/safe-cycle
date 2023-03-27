import mongoose from 'mongoose';
import { INogoGroup } from 'interfaces';
import { NogoGroupModel } from 'models';

export const createTestNogoGroup = async (userId?: mongoose.Types.ObjectId) => {
  const createdNogoGroup: INogoGroup = await NogoGroupModel.create({
    _id: new mongoose.Types.ObjectId(),
    user: userId ?? new mongoose.Types.ObjectId(),
    name: 'Test Group',
  });
  return createdNogoGroup;
};
