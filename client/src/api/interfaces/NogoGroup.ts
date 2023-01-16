import { ID, Name } from 'types';

export interface INogoGroupReturnDTO {
  _id: ID;
  name: string;
  user: {
    name: Name;
  };
  isPublic?: boolean;
}

export interface INogoGroupCreateDTO
  extends Omit<INogoGroupReturnDTO, '_id user'> {}

export interface INogoGroupUpdateDTO extends INogoGroupCreateDTO {}
