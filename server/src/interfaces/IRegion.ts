import mongoose from 'mongoose';
import { Name, UserRole } from 'types';

export interface IRegion {
  _id: mongoose.Types.ObjectId;
  name: string;
  iso31662: string;
  polygon: GeoJSON.Polygon;
  contributors: mongoose.Types.ObjectId[];
  shortName?: string;
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
