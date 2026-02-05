import { HTTPError } from "./HTTPError";

export class NotFoundError extends HTTPError {
  constructor(message: string = 'Resource not found') {
    super(message, 404);
    this.name = 'NotFoundError';
  }
}