import { NotFoundError } from "./domain/errors/NotFoundError";
import { BadRequestError } from "./domain/errors/BadRequestError";

const handledErrors = [NotFoundError, BadRequestError];

export function errorHandler(err, req, res, next) {
  // The some function will check if the error is an instance of any handled error
  if (handledErrors.some((error) => err instanceof error)) {
    res.status(err.code);
    res.json({ name: err.name, message: err.message });
    return;
  }
  res.status(500)
  res.json({ name: 'InternalError', message: err.message });
}