/* eslint-disable @typescript-eslint/no-unused-vars */
import { ApiError } from '../Exceptions/ApiError.js'

export const errorMiddleware = (error, req, res, next) => {
  if (error instanceof ApiError) {
    res.status(error.status).send({
      message: error.message,
      errors: error.errors,
    });

    return;
  }

  res.status(500).send({
    errorMessage: error.message,
  });
};
