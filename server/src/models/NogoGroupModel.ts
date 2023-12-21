import mongoose from 'mongoose';
import { INogoGroup } from 'interfaces';

const NogoGroupSchema = new mongoose.Schema<INogoGroup>({
  user: {
    type: mongoose.SchemaTypes.ObjectId,
    required: true,
    ref: 'User',
  },
  name: {
    type: String,
    required: true,
  },
  nogoLength: {
    type: Number,
    default: 0,
  },
});

export const NogoGroupModel = mongoose.model<INogoGroup>(
  'NogoGroup',
  NogoGroupSchema
);
