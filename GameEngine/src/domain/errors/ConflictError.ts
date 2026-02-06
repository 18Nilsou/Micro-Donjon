import { HTTPError } from "./HTTPError";

export class ConflictError extends HTTPError {
    constructor(message: string = 'Conflict') {
        super(message, 409);
        this.name = 'ConflictError';
    }
}
