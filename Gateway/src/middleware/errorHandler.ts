import { Request, Response, NextFunction } from 'express';

export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('Gateway Error:', err.message);

  if (err.response) {
    // Error from downstream service
    res.status(err.response.status).json({
      error:
        err.response.data.error || err.response.data.message || 'Service error',
      service: err.config?.baseURL,
    });
  } else if (err.code === 'ECONNREFUSED') {
    res.status(503).json({
      error: 'Service unavailable',
      message: 'Unable to connect to downstream service',
    });
  } else {
    res.status(500).json({
      error: 'Internal gateway error',
      message: err.message,
    });
  }
};
