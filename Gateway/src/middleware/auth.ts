import { Request, Response, NextFunction } from 'express';

export interface AuthenticatedRequest extends Request {
  isAuthenticated?: boolean;
}

export const authMiddleware = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  // Skip auth for health and docs endpoints
  if (req.path === '/health' || req.path.startsWith('/docs')) {
    return next();
  }

  const authHeader = req.headers.authorization;
  const expectedToken = process.env.API_TOKEN || 'micro-donjon-frontend-token';

  if (!authHeader) {
    return res.status(401).json({
      error: 'Missing authorization header',
      message: 'API token required'
    });
  }

  const token = authHeader.replace('Bearer ', '');

  if (token !== expectedToken) {
    return res.status(401).json({
      error: 'Invalid API token',
      message: 'Unauthorized access'
    });
  }

  req.isAuthenticated = true;
  next();
};