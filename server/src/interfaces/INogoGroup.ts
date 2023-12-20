import mongoose from 'mongoose';
import { Name } from 'types';

export interface INogoGroup {
  _id: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId;
  name: string;
}

export interface INogoGroupHydrated extends INogoGroup {
  nogoLength: Promise<number>;
}

export interface INogoGroupCreateDTO extends Omit<INogoGroup, '_id' | 'user'> {}
export interface INogoGroupUpdateDTO extends INogoGroupCreateDTO {}

export interface INogoGroupReturnDTO
  extends Omit<INogoGroupHydrated, 'user' | 'nogoLength'> {
  user: {
    _id: mongoose.Types.ObjectId;
    name: Name;
  };
  nogoLength: number;
}
