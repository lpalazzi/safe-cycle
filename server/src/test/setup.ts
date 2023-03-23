import 'reflect-metadata';
import dotenv from 'dotenv';
dotenv.config({ path: './src/test/test.env' });
import joi from '../loaders/joi';
import mongoose from 'mongoose';
import config from '../config';

joi();

beforeAll(async () => {
  try {
    await mongoose.connect(config.mongoUrl, {
      serverSelectionTimeoutMS: 5000,
    });
  } catch (error: any) {
    console.log('[database]\t ERROR: Could not connect to MongoDB');
    process.exit();
  }
});

afterEach(async () => {
  await mongoose.connection.dropDatabase();
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
});
