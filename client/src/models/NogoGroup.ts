import { ID, Name } from 'types';

interface NogoGroupParams {
  _id: ID;
  name: string;
  user: {
    name: Name;
  };
}

export class NogoGroup {
  public _id;
  public name;
  public creator;

  constructor(params: NogoGroupParams) {
    this._id = params._id;
    this.name = params.name;
    this.creator = params.user.name.first + ' ' + params.user.name.last;
  }
}
