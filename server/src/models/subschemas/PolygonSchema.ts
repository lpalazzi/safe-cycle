import mongoose from 'mongoose';

export const PolygonSchema = new mongoose.Schema<GeoJSON.Polygon>(
  {
    type: {
      type: String,
      enum: ['Polygon'],
      required: true,
    },
    coordinates: {
      type: [[[Number]]],
      required: true,
    },
  },
  { _id: false }
);
