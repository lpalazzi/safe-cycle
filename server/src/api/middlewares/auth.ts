import { UnauthorizedError, InternalServerError } from 'api/errors';
import express from 'express';
import mongoose from 'mongoose';

export const checkLoggedIn: express.RequestHandler = async (req, res, next) => {
  try {
    if (!req.session.userId) {
      throw new UnauthorizedError('User is not logged in');
    }
    if (!mongoose.isValidObjectId(req.session.userId)) {
      throw new InternalServerError('Stored userId is not a valid ObjectId');
    }
    next();
  } catch (err) {
    next(err);
  }
};
