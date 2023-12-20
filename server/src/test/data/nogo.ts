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
        [-83.04013328903238, 42.319205900958735],
        [-83.01940470272079, 42.28702254580895],
        [-83.01823687002806, 42.28515821936787],
        [-83.01835979978517, 42.28456707995184],
        [-83.01922030808508, 42.283293837755195],
        [-83.01965056223503, 42.2825662592324],
        [-83.01872858905656, 42.280383473253124],
        [-83.01098401435682, 42.26846776696701],
        [-83.00057820851652, 42.25235749245175],
      ],
    } as GeoJSON.LineString,
    nogoGroup: nogoGroupId,
    region: regionId,
  });
  return createdNogo;
};
