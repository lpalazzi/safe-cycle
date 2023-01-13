import mongoose from 'mongoose';
import { INogo } from 'interfaces';
import { LineStringSchema } from './subschemas';

const NogoSchema = new mongoose.Schema<INogo>({
  nogoGroup: {
    type: mongoose.SchemaTypes.ObjectId,
    required: true,
    ref: 'NogoGroup',
  },
  lineString: {
    type: LineStringSchema,
    required: true,
  },
});

export const NogoModel = mongoose.model<INogo>('Nogo', NogoSchema);
