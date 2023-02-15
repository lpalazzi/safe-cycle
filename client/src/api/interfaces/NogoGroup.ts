import { ID, Name } from 'types';

export interface INogoGroupReturnDTO {
  _id: ID;
  user: {
    _id: ID;
    name: Name;
  };
  name: string;
}

export interface INogoGroupCreateDTO
  extends Omit<INogoGroupReturnDTO, '_id' | 'user'> {}

export interface INogoGroupUpdateDTO extends INogoGroupCreateDTO {}
