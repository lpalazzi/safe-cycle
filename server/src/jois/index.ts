import joi from 'joi';
import geojson from './geojson';
import objectid from './objectid';

declare module 'joi/lib' {
  export interface Root {
    objectId: () => AnySchema;
    geojson: () => {
      position: () => AnySchema;
      lineString: () => AnySchema;
      polygon: () => AnySchema;
    };
  }
}

export default () => {
  joi.objectId = objectid;
  joi.geojson = geojson;
};
