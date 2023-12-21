import { NogoApi } from 'api';
import { ID, Name } from 'types';

interface NogoGroupParams {
  _id: ID;
  user: {
    _id: ID;
    name: Name;
  };
  name: string;
  nogoLength?: number;
}

export class NogoGroup {
  public _id;
  public name;
  public isRegion = false;
  public nogoLength;
  private user;

  constructor(params: NogoGroupParams) {
    this._id = params._id;
    this.name = params.name;
    this.user = params.user;
    this.nogoLength = params.nogoLength || 0;
  }

  public getOwner() {
    return this.user.name.first + ' ' + this.user.name.last;
  }

  public async getAllNogos() {
    return NogoApi.getAllByGroup(this._id, false);
  }
}
