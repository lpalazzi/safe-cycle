import { ID } from 'types';

export interface INogoGroupReturnDTO {
  _id: ID;
  user: ID;
  name: string;
}

export interface INogoGroupCreateDTO
  extends Omit<INogoGroupReturnDTO, '_id' | 'user'> {}

export interface INogoGroupUpdateDTO extends INogoGroupCreateDTO {}
