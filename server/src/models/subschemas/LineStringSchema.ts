import mongoose from 'mongoose';

export const LineStringSchema = new mongoose.Schema<GeoJSON.LineString>(
  {
    type: {
      type: String,
      enum: ['LineString'],
      required: true,
    },
    coordinates: {
      type: [Number],
      required: true,
    },
  },
  { _id: false }
);
