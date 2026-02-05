import { NotFoundError } from "./domain/errors/NotFoundError";
import { BadRequestError } from "./domain/errors/BadRequestError";
import { logPublisher } from "./config/logPublisher";

const handledErrors = [NotFoundError, BadRequestError];

export async function errorHandler(err, req, res, next) {
  // The some function will check if the error is an instance of any handled error
  if (handledErrors.some((error) => err instanceof error)) {
    res.status(err.code);
    res.json({ name: err.name, message: err.message });
    if (logPublisher) {
      await logPublisher.logError('ERROR_HANDLED', { errorName: err.name, message: err.message });
    }
    return;
  }
  res.status(500)
  res.json({ name: 'InternalError', message: err.message });
  if (logPublisher) {
    await logPublisher.logError('ERROR_UNHANDLED', { errorName: err.name, message: err.message });
  }
}