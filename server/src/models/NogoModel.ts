import mongoose from 'mongoose';
import { INogo } from 'interfaces';
import { LineStringSchema } from './subschemas';

const NogoSchema = new mongoose.Schema<INogo>({
  nogoList: {
    type: mongoose.SchemaTypes.ObjectId,
    required: true,
    ref: 'NogoList',
  },
  lineString: {
    type: LineStringSchema,
    required: true,
  },
});

export const NogoModel = mongoose.model<INogo>('Nogo', NogoSchema);
