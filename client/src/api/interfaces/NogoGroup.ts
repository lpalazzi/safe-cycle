import { ID, Name } from 'types';

export interface INogoGroupReturnDTO {
  _id: ID;
  user: {
    _id: ID;
    name: Name;
  };
  name: string;
  nogoLength?: number;
}

export interface INogoGroupCreateDTO
  extends Omit<INogoGroupReturnDTO, '_id' | 'user' | 'nogoLength'> {}

export interface INogoGroupUpdateDTO extends INogoGroupCreateDTO {}
