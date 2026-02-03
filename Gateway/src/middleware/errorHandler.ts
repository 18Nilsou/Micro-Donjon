import { Request, Response, NextFunction } from 'express';

export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  if (err.response) {
    // Error from downstream service
    console.error('Service responded with status:', err.response.status);
    console.error('Service error data:', JSON.stringify(err.response.data, null, 2));
    console.error('Target URL:', err.config?.url);

    res.status(err.response.status).json({
      error: err.response.data.error || err.response.data.message || 'Service error',
      details: err.response.data,
      service: err.config?.url,
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
