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
    _id: mongoose.Types.ObjectId;
    name: Name;
    role: UserRole;
  }[];
}

export interface IRegionCreateDTO
  extends Omit<IRegion, '_id' | 'contributors'> {}
