import mongoose from 'mongoose';
import { Name, UserRole } from 'types';

export interface IRegion {
  _id: mongoose.Types.ObjectId;
  name: string;
  polygon: GeoJSON.Polygon;
  contributors: mongoose.Types.ObjectId[];
}

export interface IRegionReturnDTO extends Omit<IRegion, 'contributors'> {
  contributors: {
    name: Name;
    role: UserRole;
  }[];
}
