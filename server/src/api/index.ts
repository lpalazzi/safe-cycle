import express from 'express';
import * as controllers from './controllers';

const app = express.Router();

controllers.user(app);
controllers.nogo(app);
controllers.nogoList(app);
controllers.router(app);

export default app;
