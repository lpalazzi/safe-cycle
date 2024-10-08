import mongoose from 'mongoose';
import { IRegion } from 'interfaces';
import { PolygonSchema } from './subschemas';

const RegionSchema = new mongoose.Schema<IRegion>({
  name: {
    type: String,
    required: true,
  },
  polygon: {
    type: PolygonSchema,
    required: true,
  },
  contributors: {
    type: [mongoose.SchemaTypes.ObjectId],
    required: true,
    ref: 'User',
  },
  iso31662: {
    type: String,
    required: true,
  },
  shortName: {
    type: String,
  },
  nogoLength: {
    type: Number,
    default: 0,
  },
});

export const RegionModel = mongoose.model<IRegion>('Region', RegionSchema);
