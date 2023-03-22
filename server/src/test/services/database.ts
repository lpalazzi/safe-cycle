import mongoose from 'mongoose';
import config from '../../config';

export const useDB = () => {
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

  afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
  });
};
