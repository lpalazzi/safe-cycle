import express from 'express';
import axios from 'axios';
import joi from 'joi';
import { container } from 'tsyringe';
import { BingMapsService, NominatimService } from 'services';
import { Position, Viewbox } from 'types';
import { BadRequestError, GatewayTimeoutError } from 'api/errors';
import { IGeocodeSearchResult, IReverseGeocodeResult } from 'interfaces';
import { asyncCallWithTimeout } from 'utils/async';

export const geocoding = (app: express.Router) => {
  const route = express.Router();
  app.use('/geocoding', route);
  const bingMapsService = container.resolve(BingMapsService);
  const nominatimService = container.resolve(NominatimService);

  route.get('/search/:query', async (req, res, next) => {
    try {
      const query = req.params.query;
      const viewboxStr = req.query.viewbox as string; // format: se_lat,se_lng,nw_lat,nw_lng
      const userLocationStr = req.query.userLocation as string | undefined; // format: lat,lng

      const [viewbox_se_lat, viewbox_se_lng, viewbox_nw_lat, viewbox_nw_lng] =
        viewboxStr.split(',');

      const viewbox: Viewbox = {
        southeast: {
          latitude: Number(viewbox_se_lat),
          longitude: Number(viewbox_se_lng),
        },
        northwest: {
          latitude: Number(viewbox_nw_lat),
          longitude: Number(viewbox_nw_lng),
        },
      };

      let userLocation: Position | undefined = undefined;
      if (userLocationStr) {
        userLocation = {
          latitude: Number(userLocationStr.split(',')[0]),
          longitude: Number(userLocationStr.split(',')[1]),
        };
      }

      const { error } = joi
        .object({
          query: joi.string().required(),
          viewbox: joi.geocoding().viewbox().required(),
          userLocation: joi.geocoding().position(),
        })
        .required()
        .validate({ query, viewbox, userLocation });

      if (error) throw new BadRequestError(error.message);

      const searchResults: IGeocodeSearchResult[] = [];

      const bingSearchResults = await bingMapsService.autosuggest(
        query,
        viewbox,
        userLocation
      );

      if (!bingSearchResults) {
        const nominatimSearchResults = await nominatimService.search(
          query,
          viewbox
        );
        searchResults.push(...nominatimSearchResults);
      } else {
        searchResults.push(...bingSearchResults);
      }

      return res.json({ searchResults });
    } catch (err) {
      next(err);
    }
  });

  route.get('/geocode/:query', async (req, res, next) => {
    try {
      const query = req.params.query;
      const { error } = joi.string().required().validate(query);
      if (error) throw new BadRequestError(error.message);
      const position = await bingMapsService.geocode(query);
      return res.json({ position });
    } catch (err) {
      next(err);
    }
  });

  route.get('/reverse/:lat/:lng/:zoom', async (req, res, next) => {
    try {
      const lat = req.params.lat;
      const lng = req.params.lng;
      const position: Position = {
        latitude: Number(lat),
        longitude: Number(lng),
      };
      const zoom = +req.params.zoom;
      if (zoom < 0 || zoom > 18)
        throw new BadRequestError('zoom must be an integer from 0-18');
      const { error } = joi
        .geocoding()
        .position()
        .required()
        .validate(position);
      if (error) throw new BadRequestError(error.message);
      try {
        const result = await asyncCallWithTimeout<IReverseGeocodeResult>(
          nominatimService.reverse(position, zoom),
          5000
        );
        return res.json({ result });
      } catch (error: any) {
        if (error.message === 'Async call timeout limit reached')
          throw new GatewayTimeoutError('Reverse geo search timed out');
        console.log(error.message); // log unhandled error message
        throw error;
      }
    } catch (err) {
      next(err);
    }
  });

  route.post('/bulkReverse', async (req, res, next) => {
    try {
      const positions: Position[] = req.body.positions;
      const zoom: number = req.body.zoom;
      const { error } = joi
        .object({
          positions: joi.array().items(joi.geocoding().position()).required(),
          zoom: joi.number().integer().min(0).max(18).required(),
        })
        .required()
        .validate({ positions, zoom });
      if (error) throw new BadRequestError(error.message);
      const results = await nominatimService.bulkReverse(positions, zoom);
      return res.json({ results });
    } catch (err) {
      next(err);
    }
  });

  route.get('/approxGeolocation', async (req, res, next) => {
    try {
      const data = await axios
        .get<{ lat: number; lon: number }>('http://ip-api.com/json')
        .catch((error) => {
          throw new Error(
            error.response?.data ?? error.message ?? 'Nominatim error'
          );
        });
      return res.json({
        lat: data.data.lat,
        lon: data.data.lon,
      });
    } catch (err) {
      next(err);
    }
  });
};
