import { ID, Name } from 'types';

export interface INogoListReturnDTO {
  _id: ID;
  name: string;
  user: {
    name: Name;
  };
}

export interface INogoListCreateDTO {
  name: string;
}

export interface INogoListUpdateDTO extends INogoListCreateDTO {}
