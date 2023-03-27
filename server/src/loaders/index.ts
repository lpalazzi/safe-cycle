import express from 'express';

import mongooseLoader from './mongoose';
import expressLoader from './express';
import joi from './joi';
import sentryLoader from './sentry';
import config from 'config';

export const load = async (expressApp: express.Express) => {
  await mongooseLoader();
  if (config.useSentry) sentryLoader(expressApp);
  expressLoader(expressApp);
  joi();
};
