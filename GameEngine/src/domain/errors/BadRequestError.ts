import { HTTPError } from "./HTTPError";

export class BadRequestError extends HTTPError {
    constructor(message: string = 'Bad request') {
        super(message, 400);
        this.name = 'BadRequestError';
    }
}
