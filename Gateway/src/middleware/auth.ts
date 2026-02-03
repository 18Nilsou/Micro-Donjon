import { Request, Response, NextFunction } from 'express';
import axios from 'axios';
import { SERVICES } from '../config/services';

export interface AuthenticatedRequest extends Request {
  isAuthenticated?: boolean;
  user?: {
    id: string;
    username: string;
    email: string;
    hero_id: string | null;
  };
}

// Routes that don't require authentication
const PUBLIC_ROUTES = [
  '/auth/register',
  '/auth/login',
  '/auth/verify',
  '/health',
  '/docs'
];

export const authMiddleware = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  // Check if route is public
  const isPublicRoute = PUBLIC_ROUTES.some(route => req.path.startsWith(route));
  
  if (isPublicRoute) {
    return next();
  }

  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({
      error: 'Missing authorization header',
      message: 'JWT token required'
    });
  }

  // Check if it's a Bearer token (JWT)
  if (!authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      error: 'Invalid authorization format',
      message: 'Use Bearer token format'
    });
  }

  try {
    // Verify token with Auth Service
    const response = await axios.get(`${SERVICES.AUTH}/auth/verify`, {
      headers: { Authorization: authHeader }
    });

    if (response.data.valid) {
      req.isAuthenticated = true;
      req.user = response.data.user;
      next();
    } else {
      return res.status(401).json({
        error: 'Invalid token',
        message: 'Token is invalid or expired'
      });
    }
  } catch (error: any) {
    console.error('Auth verification error:', error.message);
    return res.status(401).json({
      error: 'Authentication failed',
      message: 'Could not verify token'
    });
  }
};
