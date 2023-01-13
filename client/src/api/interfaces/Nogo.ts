import { ID } from 'types';

export interface INogoReturnDTO {
  _id: ID;
  nogoGroup: ID;
  lineString: GeoJSON.LineString;
}

export interface INogoCreateDTO extends Omit<INogoReturnDTO, '_id'> {}
