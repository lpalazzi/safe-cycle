import joi from 'joi';
import geojson from './geojson';
import geocoding from './geocoding';
import objectid from './objectid';

declare module 'joi/lib' {
  export interface Root {
    objectId: () => AnySchema;
    geojson: () => {
      position: () => AnySchema;
      lineString: () => AnySchema;
      polygon: () => AnySchema;
    };
    geocoding: () => {
      position: () => AnySchema;
      viewbox: () => AnySchema;
    };
  }
}

export default () => {
  joi.objectId = objectid;
  joi.geojson = geojson;
  joi.geocoding = geocoding;
};
