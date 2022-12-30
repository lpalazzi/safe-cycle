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

export const NogoListModel = mongoose.model<INogoList>(
  'NogoList',
  NogoListSchema
);
