import express from 'express';
import { users, nogoLists } from './controllers';

const app = express.Router();

users(app);
nogoLists(app);

export default app;
