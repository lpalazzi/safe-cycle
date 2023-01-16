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
  isPublic: {
    type: Boolean,
    required: false,
  },
});

export const NogoGroupModel = mongoose.model<INogoGroup>(
  'NogoGroup',
  NogoGroupSchema
);
