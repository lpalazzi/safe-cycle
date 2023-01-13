import { ID } from 'types';

interface NogoParams {
  _id: ID;
  nogoGroup: ID;
  lineString: GeoJSON.LineString;
}

export class Nogo {
  public _id;
  public nogoGroup;
  public lineString;

  constructor(params: NogoParams) {
    this._id = params._id;
    this.nogoGroup = params.nogoGroup;
    this.lineString = params.lineString;
  }
}
