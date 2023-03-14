import express from 'express';
import * as controllers from './controllers';

const app = express.Router();

controllers.user(app);
controllers.nogo(app);
controllers.nogoGroup(app);
controllers.region(app);
controllers.router(app);
controllers.geocoding(app);
controllers.email(app);

export default app;
