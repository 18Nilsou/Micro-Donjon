export abstract class AppError extends Error {
  readonly code: number;

  constructor(message: string, code: number) {
    super(message);
    this.code = code;
    // Nécessaire car on étend une classe native
    Object.setPrototypeOf(this, new.target.prototype);
    this.name = this.constructor.name;
  }
}