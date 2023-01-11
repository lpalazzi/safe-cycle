import { ID, Name } from 'types';

interface NogoListParams {
  _id: ID;
  name: string;
  user: {
    name: Name;
  };
}

export class NogoList {
  public _id;
  public name;
  public creator;

  constructor(params: NogoListParams) {
    this._id = params._id;
    this.name = params.name;
    this.creator = params.user.name.first + ' ' + params.user.name.last;
  }
}
