import mongoose from 'mongoose';
import config from '../config';

export default (name: string) => {
  beforeAll(async () => {
    try {
      await mongoose.connect(config.mongoUrl + '-' + name, {
        serverSelectionTimeoutMS: 5000,
      });
    } catch (error: any) {
      console.log(error);
      console.log('[database]\t ERROR: Could not connect to MongoDB');
      process.exit();
    }
  });

  afterEach(async () => {
    await mongoose.connection.dropDatabase();
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });
};
