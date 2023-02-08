import mongoose from 'mongoose';
import { INogo } from 'interfaces';
import { LineStringSchema } from './subschemas';

const NogoSchema = new mongoose.Schema<INogo>({
  lineString: {
    type: LineStringSchema,
    required: true,
  },
  nogoGroup: {
    type: mongoose.SchemaTypes.ObjectId,
    ref: 'NogoGroup',
  },
  region: {
    type: mongoose.SchemaTypes.ObjectId,
    ref: 'Region',
  },
});

export const NogoModel = mongoose.model<INogo>('Nogo', NogoSchema);
