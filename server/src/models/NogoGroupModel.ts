import mongoose from 'mongoose';
import { INogo, INogoGroupHydrated } from 'interfaces';
import { NogoModel } from 'models';
import { getLengthForLineString } from 'utils/geo';

const NogoGroupSchema = new mongoose.Schema<INogoGroupHydrated>(
  {
    user: {
      type: mongoose.SchemaTypes.ObjectId,
      required: true,
      ref: 'User',
    },
    name: {
      type: String,
      required: true,
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

NogoGroupSchema.virtual('nogoLength').get(async function () {
  try {
    const nogos: INogo[] = await NogoModel.find({ nogoGroup: this._id });
    const nogoLengths = nogos.map((nogo) =>
      getLengthForLineString(nogo.lineString)
    );
    return nogoLengths.reduce((partialSum, a) => partialSum + a, 0);
  } catch (error) {
    console.error(error);
    return 0;
  }
});

export const NogoGroupModel = mongoose.model<INogoGroupHydrated>(
  'NogoGroup',
  NogoGroupSchema
);
