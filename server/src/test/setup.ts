require('tsconfig-paths/register');
require('dotenv').config({ path: './src/test/test.env' });

import 'reflect-metadata';
import mongoose from 'mongoose';
import express from 'express';
import expressLoader from '../loaders/express';
import joi from '../loaders/joi';
import config from '../config';

beforeAll(async () => {
  try {
    await mongoose.connect(config.mongoUrl, {
      serverSelectionTimeoutMS: 5000,
    });
  } catch (error: any) {
    console.log('[database]\t ERROR: Could not connect to MongoDB');
    process.exit();
  }

  const app = express();
  await expressLoader(app);
  joi();
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
});
