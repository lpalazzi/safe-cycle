import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import https from 'https';
import fs from 'fs';
import 'reflect-metadata';
import config from 'config';
import * as loaders from './loaders';

async function start() {
  const app = express();
  await loaders.load(app);
  if (
    config.dev ||
    !(config.https.cert && config.https.key && config.https.ca)
  ) {
    app.listen(config.port, () => {
      console.log(
        `[server]\t Server is running at http://localhost:${config.port}`
      );
    });
  } else {
    https
      .createServer(
        {
          key: fs.readFileSync(config.https.key, 'utf-8'),
          cert: fs.readFileSync(config.https.cert, 'utf-8'),
          ca: fs.readFileSync(config.https.ca, 'utf-8'),
        },
        app
      )
      .listen(config.port, () => {
        console.log(
          `[server]\t Server is running at https://localhost:${config.port}`
        );
      });
  }
}

start();
