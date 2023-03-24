import { ID } from 'types';

export interface INogoReturnDTO {
  _id: ID;
  lineString: GeoJSON.LineString;
  nogoGroup?: ID;
  region?: ID;
}

export interface INogoCreateDTO {
  points: [GeoJSON.Position, GeoJSON.Position];
  nogoGroup?: ID;
  region?: ID;
}
