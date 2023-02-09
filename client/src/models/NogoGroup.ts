import { ID } from 'types';

interface NogoGroupParams {
  _id: ID;
  name: string;
}

export class NogoGroup {
  public _id;
  public name;

  constructor(params: NogoGroupParams) {
    this._id = params._id;
    this.name = params.name;
  }
}
