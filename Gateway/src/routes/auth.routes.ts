import { Router, Request, Response } from 'express';
import axios from 'axios';
import { SERVICES } from '../config/services';

const router = Router();

// Register
router.post('/auth/register', async (req: Request, res: Response) => {
  try {
    const response = await axios.post(`${SERVICES.AUTH}/auth/register`, req.body);
    res.status(response.status).json(response.data);
  } catch (error: any) {
    const status = error.response?.status || 500;
    const data = error.response?.data || { error: 'Auth service unavailable' };
    res.status(status).json(data);
  }
});

// Login
router.post('/auth/login', async (req: Request, res: Response) => {
  try {
    const response = await axios.post(`${SERVICES.AUTH}/auth/login`, req.body);
    res.status(response.status).json(response.data);
  } catch (error: any) {
    const status = error.response?.status || 500;
    const data = error.response?.data || { error: 'Auth service unavailable' };
    res.status(status).json(data);
  }
});

// Get current user
router.get('/auth/me', async (req: Request, res: Response) => {
  try {
    const response = await axios.get(`${SERVICES.AUTH}/auth/me`, {
      headers: { Authorization: req.headers.authorization }
    });
    res.status(response.status).json(response.data);
  } catch (error: any) {
    const status = error.response?.status || 500;
    const data = error.response?.data || { error: 'Auth service unavailable' };
    res.status(status).json(data);
  }
});

// Verify token
router.get('/auth/verify', async (req: Request, res: Response) => {
  try {
    const response = await axios.get(`${SERVICES.AUTH}/auth/verify`, {
      headers: { Authorization: req.headers.authorization }
    });
    res.status(response.status).json(response.data);
  } catch (error: any) {
    const status = error.response?.status || 500;
    const data = error.response?.data || { error: 'Auth service unavailable' };
    res.status(status).json(data);
  }
});

// Link hero to user
router.put('/auth/hero', async (req: Request, res: Response) => {
  try {
    const response = await axios.put(`${SERVICES.AUTH}/auth/hero`, req.body, {
      headers: { Authorization: req.headers.authorization }
    });
    res.status(response.status).json(response.data);
  } catch (error: any) {
    const status = error.response?.status || 500;
    const data = error.response?.data || { error: 'Auth service unavailable' };
    res.status(status).json(data);
  }
});

// Unlink hero from user
router.delete('/auth/hero', async (req: Request, res: Response) => {
  try {
    const response = await axios.delete(`${SERVICES.AUTH}/auth/hero`, {
      headers: { Authorization: req.headers.authorization }
    });
    res.status(response.status).json(response.data);
  } catch (error: any) {
    const status = error.response?.status || 500;
    const data = error.response?.data || { error: 'Auth service unavailable' };
    res.status(status).json(data);
  }
});

export default router;
