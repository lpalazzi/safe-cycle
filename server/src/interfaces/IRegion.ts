import mongoose from 'mongoose';

export interface IRegion {
  _id: mongoose.Types.ObjectId;
  name: string;
  polygon: GeoJSON.Polygon;
}
