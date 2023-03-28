import { ID, Name, UserRole, UserSettings } from 'types';

interface UserParams {
  _id: ID;
  email: string;
  name: Name;
  role?: UserRole;
  settings?: UserSettings;
}

export class User {
  public _id;
  public email;
  public name;
  public role;
  public settings;

  constructor(params: UserParams) {
    this._id = params._id;
    this.email = params.email;
    this.name = params.name;
    this.role = params.role;
    this.settings = params.settings;
  }

  public getFullName() {
    return this.name.first + ' ' + this.name.last;
  }

  public getInitials() {
    return this.name.first[0] + this.name.last[0];
  }
}
