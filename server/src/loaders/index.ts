import express from 'express';

import mongooseLoader from './mongoose';
import expressLoader from './express';
import joi from './joi';

export const load = async (expressApp: express.Express) => {
  await mongooseLoader();
  await expressLoader(expressApp);
  joi();
};
