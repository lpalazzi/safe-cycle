import joi from 'joi';
import mongoose from 'mongoose';

export default () => joi.custom((value) => mongoose.isValidObjectId(value));
