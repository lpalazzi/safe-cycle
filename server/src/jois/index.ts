import joi from 'joi';

declare module 'joi/lib' {
  export interface Root {
    objectId: () => AnySchema;
    geojson: {
      position: () => AnySchema;
      lineString: () => AnySchema;
    };
  }
}

export default () => {
  joi.objectId = require('joi-objectid')(joi);
  joi.geojson = require('./geojson');
};
