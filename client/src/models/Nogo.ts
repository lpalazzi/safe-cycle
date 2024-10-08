import { ID } from 'types';
import { getLengthForLineString } from 'utils/geojson';

interface NogoParams {
  _id: ID;
  lineString: GeoJSON.LineString;
  nogoGroup?: ID;
  region?: ID;
}

export class Nogo {
  public _id;
  public lineString;
  public nogoGroup;
  public region;

  constructor(params: NogoParams) {
    this._id = params._id;
    this.lineString = params.lineString;
    this.nogoGroup = params.nogoGroup;
    this.region = params.region;
  }

  public getLength() {
    return getLengthForLineString(this.lineString);
  }
}
