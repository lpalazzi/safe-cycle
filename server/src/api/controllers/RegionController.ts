import express from 'express';
import { container } from 'tsyringe';
import { RegionService } from 'services';
import { IRegionCreateDTO } from 'interfaces';
import { BadRequestError, InternalServerError } from 'api/errors';
import { checkAdmin, checkLoggedIn } from 'api/middlewares';

export const region = (app: express.Router) => {
  const route = express.Router();
  app.use('/region', route);
  const regionService = container.resolve(RegionService);

  route.get('/getAll', async (req, res, next) => {
    try {
      const regions = await regionService.getAll();
      return res.json({
        regions,
      });
    } catch (err) {
      next(err);
    }
  });

  route.post('/create', checkLoggedIn, checkAdmin, async (req, res, next) => {
    try {
      const newRegion: IRegionCreateDTO = req.body.region;
      const { region, error } = await regionService.create(newRegion);

      if (error) {
        throw new BadRequestError(error);
      } else if (!region) {
        throw new InternalServerError('Region could not be created');
      }

      return res.json({ region });
    } catch (err) {
      next(err);
    }
  });
};
