import { ID } from 'types';

export interface INogoReturnDTO {
  _id: ID;
  lineString: GeoJSON.LineString;
  nogoGroup?: ID;
  region?: ID;
}
