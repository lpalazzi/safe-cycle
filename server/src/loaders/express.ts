import express from 'express';
import session from 'express-session';
import cookieParser from 'cookie-parser';
import mongoose from 'mongoose';
import MongoStore from 'connect-mongo';

import config from 'config';
import controllers from 'api';
import { errorResponder, sentryCapture } from 'api/middlewares';

declare module 'express-session' {
  interface SessionData {
    userId: string | undefined;
  }
}

export default (app: express.Express) => {
  if (config.test) {
    app.set('trust proxy', 1);
  }

  app.use(express.urlencoded({ extended: false }));
  app.use(express.json());
  app.use(cookieParser());
  app.use(express.static('public'));

  app.use(
    session({
      secret: config.sessionSecret,
      resave: false,
      saveUninitialized: false,
      cookie: {
        secure: config.test ? false : true,
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
      },
      store: MongoStore.create({
        client: mongoose.connection.getClient() as any,
      }),
    })
  );

  app.use(controllers);
  if (config.sentryDsn) app.use(sentryCapture);
  app.use(errorResponder);
};
