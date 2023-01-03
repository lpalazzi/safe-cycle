import express from 'express';
import * as controllers from './controllers';

const app = express.Router();

controllers.users(app);
controllers.nogoLists(app);

export default app;
