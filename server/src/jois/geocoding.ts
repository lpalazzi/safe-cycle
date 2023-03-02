import joi from 'joi';

export const position = () =>
  joi.object({
    latitude: joi.number().required(),
    longitude: joi.number().required(),
  });

export const viewbox = () =>
  joi.object({
    southeast: position().required(),
    northwest: position().required(),
  });

export default () => {
  return {
    position,
    viewbox,
  };
};
