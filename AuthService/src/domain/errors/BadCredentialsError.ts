export class BadCredentialsError extends Error {
  constructor(message: string = 'Invalid username or password') {
    super(message);
    this.name = 'BadCredentialsError';
  }
}