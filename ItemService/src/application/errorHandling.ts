import { Request, Response, NextFunction } from 'express';
import { AppError } from "../domain/errors/AppError";

export function errorHandler(err: Error, req: Request, res: Response, next: NextFunction) {
  console.error(`[Error] ${err.name}: ${err.message}`);

  if (err instanceof AppError) {
    res.status(err.code).json({
      name: err.name,
      message: err.message
    });
    return;
  }

  res.status(500).json({
    name: 'InternalServerError',
    message: 'Something went wrong'
  });
}