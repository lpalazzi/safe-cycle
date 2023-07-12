import { ID, Name, UserRole, UserSettings } from 'types';

export interface IUserReturnDTO {
  _id: ID;
  email: string;
  name: Name;
  role?: UserRole;
  settings?: UserSettings;
}

export interface IUserSignupDTO {
  email: string;
  name: Name;
  password: string;
}

export interface IUserLoginDTO {
  email: string;
  password: string;
}

export interface IUserChangePasswordDTO {
  currentPassword: string;
  newPassword: string;
  bypassCurrentPassword?: boolean;
}
