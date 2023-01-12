import { ID } from 'types';

interface NogoParams {
  _id: ID;
  nogoList: ID;
  lineString: GeoJSON.LineString;
}

export class Nogo {
  public _id;
  public nogoList;
  public lineString;

  constructor(params: NogoParams) {
    this._id = params._id;
    this.nogoList = params.nogoList;
    this.lineString = params.lineString;
  }
}
