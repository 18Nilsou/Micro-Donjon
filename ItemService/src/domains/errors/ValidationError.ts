import { HTTPError } from "./HTTPError";

export class ValidationError extends HTTPError {
    constructor(message: string = 'Validation failed') {
        super(message, 400);
        this.name = 'ValidationError';
    }
}
