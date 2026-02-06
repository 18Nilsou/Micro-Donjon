import { HTTPError } from "./HTTPError";

export class InternalServerError extends HTTPError {
    constructor(message: string = 'Internal server error') {
        super(message, 500);
        this.name = 'InternalServerError';
    }
}
