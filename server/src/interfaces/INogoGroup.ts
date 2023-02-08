import mongoose from 'mongoose';

export interface INogoGroup {
  _id: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId;
  name: string;
}

export interface INogoGroupCreateDTO extends Omit<INogoGroup, '_id' | 'user'> {}
export interface INogoGroupUpdateDTO extends INogoGroupCreateDTO {}

export interface INogoGroupReturnDTO extends INogoGroup {}
