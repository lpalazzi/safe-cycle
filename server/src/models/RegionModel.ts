import mongoose from 'mongoose';
import { INogo, IRegionHydrated } from 'interfaces';
import { PolygonSchema } from './subschemas';
import { NogoModel } from 'models';
import { getLengthForLineString } from 'utils/geo';

const RegionSchema = new mongoose.Schema<IRegionHydrated>(
  {
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
  },
  {
    virtuals: true,
    toObject: {
      virtuals: true,
    },
    toJSON: {
      virtuals: true,
    },
  }
);

RegionSchema.virtual('nogoLength').get(async function () {
  try {
    const nogos: INogo[] = await NogoModel.find({ region: this._id });
    const nogoLengths = nogos.map((nogo) =>
      getLengthForLineString(nogo.lineString)
    );
    return nogoLengths.reduce((partialSum, a) => partialSum + a, 0);
  } catch (error) {
    console.error(error);
    return 0;
  }
});

export const RegionModel = mongoose.model<IRegionHydrated>(
  'Region',
  RegionSchema
);
