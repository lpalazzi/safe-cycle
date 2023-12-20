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

export interface IRegionHydrated extends IRegion {
  nogoLength: Promise<number>;
}

export interface IRegionReturnDTO
  extends Omit<IRegionHydrated, 'contributors' | 'nogoLength'> {
  contributors: {
    _id: mongoose.Types.ObjectId;
    name: Name;
    role: UserRole;
  }[];
  nogoLength: number;
}

export interface IRegionCreateDTO
  extends Omit<IRegion, '_id' | 'contributors' | 'nogoLength'> {}
