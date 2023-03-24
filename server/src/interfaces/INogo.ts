import mongoose from 'mongoose';

export interface INogo {
  _id: mongoose.Types.ObjectId;
  lineString: GeoJSON.LineString;
  nogoGroup?: mongoose.Types.ObjectId;
  region?: mongoose.Types.ObjectId;
}

export interface INogoCreateDTO {
  points: [GeoJSON.Position, GeoJSON.Position];
  nogoGroup?: mongoose.Types.ObjectId;
  region?: mongoose.Types.ObjectId;
}

export interface INogoReturnDTO extends INogo {}
