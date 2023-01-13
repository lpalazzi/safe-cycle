import { ID, Name } from 'types';

export interface INogoGroupReturnDTO {
  _id: ID;
  name: string;
  user: {
    name: Name;
  };
}

export interface INogoGroupCreateDTO {
  name: string;
}

export interface INogoGroupUpdateDTO extends INogoGroupCreateDTO {}
