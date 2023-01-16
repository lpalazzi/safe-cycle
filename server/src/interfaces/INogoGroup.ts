import mongoose from 'mongoose';
import { Name } from 'types';

export interface INogoGroup {
  _id: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId;
  name: string;
  isPublic?: boolean;
}

export interface INogoGroupCreateDTO extends Omit<INogoGroup, '_id' | 'user'> {}
export interface INogoGroupUpdateDTO extends INogoGroupCreateDTO {}

export interface INogoGroupReturnDTO extends Omit<INogoGroup, 'user'> {
  user: {
    name: Name;
  };
}
