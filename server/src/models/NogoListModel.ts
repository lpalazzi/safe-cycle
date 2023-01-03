import mongoose from 'mongoose';
import { INogoList } from 'interfaces';

const NogoListSchema = new mongoose.Schema<INogoList>({
  user: {
    type: mongoose.SchemaTypes.ObjectId,
    required: true,
    ref: 'User',
  },
  name: {
    type: String,
    required: true,
  },
});

NogoListSchema.pre(['find', 'findOne'], function () {
  this.populate({
    path: 'user',
    select: 'fullName',
  });
});

export const NogoListModel = mongoose.model<INogoList>(
  'NogoList',
  NogoListSchema
);
