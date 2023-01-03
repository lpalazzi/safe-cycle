import mongoose from 'mongoose';

export interface INogo {
  _id: mongoose.Types.ObjectId;
  nogoList: mongoose.Types.ObjectId;
  lineString: GeoJSON.LineString;
}

export interface INogoCreateDTO extends Omit<INogo, '_id'> {}

export interface INogoReturnDTO extends INogo {}