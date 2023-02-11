import { ID, Name, UserRole } from 'types';

export interface IRegionReturnDTO {
  _id: ID;
  name: string;
  polygon: GeoJSON.Polygon;
  contributors: {
    _id: ID;
    name: Name;
    role: UserRole;
  }[];
}

export interface IRegionCreateDTO
  extends Omit<IRegionReturnDTO, '_id' | 'contributors'> {}
