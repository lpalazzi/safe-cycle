import mongoose from 'mongoose';

export interface INogoList {
  _id: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId;
  name: string;
}

export interface INogoListCreateDTO extends Omit<INogoList, '_id' | 'user'> {}

export interface INogoListReturnDTO extends Omit<INogoList, 'user'> {
  user: {
    fullName: string;
  };
}
