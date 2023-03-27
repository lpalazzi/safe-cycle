import express from 'express';
import * as Sentry from '@sentry/node';

export const sentryCapture: express.ErrorRequestHandler = (
  err,
  req,
  res,
  next
) => {
  Sentry.withScope(() => {
    Sentry.setUser({ id: req.session.userId });
    Sentry.Handlers.errorHandler()(err, req, res, next);
  });
};
