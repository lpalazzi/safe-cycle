import mongoose from 'mongoose';
import { Name } from 'types';

export interface INogoList {
  _id: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId;
  name: string;
}

export interface INogoListCreateDTO extends Omit<INogoList, '_id' | 'user'> {}
export interface INogoListUpdateDTO extends INogoListCreateDTO {}

export interface INogoListReturnDTO extends Omit<INogoList, 'user'> {
  user: {
    name: Name;
  };
}
