import mongoose from 'mongoose';
import { INogo } from 'interfaces';
import { NogoModel } from 'models';

export const createTestNogo = async (
  nogoGroupId?: mongoose.Types.ObjectId,
  regionId?: mongoose.Types.ObjectId
) => {
  if (!nogoGroupId && !regionId) {
    nogoGroupId = new mongoose.Types.ObjectId();
  }
  const createdNogo: INogo = await NogoModel.create({
    _id: new mongoose.Types.ObjectId(),
    lineString: {
      type: 'LineString',
      coordinates: [
        [-83.017787, 42.320941, 182.25],
        [-83.01741949999999, 42.32108650000001, 182.75],
        [-83.017072, 42.321212, 183.25],
      ],
    } as GeoJSON.LineString,
    nogoGroup: nogoGroupId,
    region: regionId,
  });
  return createdNogo;
};
