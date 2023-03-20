require('tsconfig-paths/register');
require('dotenv').config({ path: './../.env' });

import 'reflect-metadata';
import mongoose from 'mongoose';
import express from 'express';
import expressLoader from '../loaders/express';
import joi from '../loaders/joi';
import config from '../config';

beforeAll(async () => {
  try {
    await mongoose.connect(config.mongoUrl + '-test', {
      serverSelectionTimeoutMS: 5000,
    });
  } catch (error: any) {
    console.log('[database]\t ERROR: Could not connect to MongoDB');
    process.exit();
  }

  const app = express();
  await expressLoader(app, true);
  joi();
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
});
