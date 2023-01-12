import joi from 'joi';

export const position = () => joi.array().items(joi.number()).min(2).max(3);

export const lineString = () =>
  joi.object({
    type: joi.string().equal('LineString').required(),
    coordinates: joi.array().items(position()).required(),
  });

export default () => {
  return {
    position,
    lineString,
  };
};
