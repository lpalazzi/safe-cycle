import mongoose from 'mongoose';
import { Name } from 'types';

export interface INogoGroup {
  _id: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId;
  name: string;
  nogoLength?: number;
}

export interface INogoGroupCreateDTO
  extends Omit<INogoGroup, '_id' | 'user' | 'nogoLength'> {}
export interface INogoGroupUpdateDTO extends INogoGroupCreateDTO {}

export interface INogoGroupReturnDTO extends Omit<INogoGroup, 'user'> {
  user: {
    _id: mongoose.Types.ObjectId;
    name: Name;
  };
}
