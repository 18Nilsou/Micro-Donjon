import { HTTPError } from "./domain/errors/HTTPError";

const handledErrors = [HTTPError];

export function errorHandler(err, req, res, next) {
  // Don't handle if response already sent
  if (res.headersSent) {
    return next(err);
  }

  // The some function will check if the error is an instance of any handled error
  if (handledErrors.some((error) => err instanceof error)) {
    return res.status(err.code).json({ name: err.name, message: err.message });
  }

  // Default error response
  return res.status(500).json({ name: 'InternalError', message: err.message });
}