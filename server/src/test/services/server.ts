import express from 'express';
import { Server } from 'http';
import expressLoader from '../../loaders/express';
import config from '../../config';

export const useServer = () => {
  let server: Server;

  beforeAll(async () => {
    const app = express();
    await expressLoader(app);
    server = app.listen(config.port);
  });

  afterAll(async () => {
    await server.close();
    // let serverClosed = false;
    // await server.close(() => {
    //   serverClosed = true;
    // });
    // while (!serverClosed) {}
  });
};
