import { Router, Request, Response, NextFunction } from 'express';
import { SERVICES } from '../config/services';
import { proxyRequest } from '../utils/proxyRequest';

const router = Router();

router.get('/logs', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await proxyRequest(req, res, SERVICES.LOG, '/logs');
  } catch (error) {
    next(error);
  }
});

router.get('/logs/stats', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await proxyRequest(req, res, SERVICES.LOG, '/logs/stats');
  } catch (error) {
    next(error);
  }
});

router.get('/logs/:service/:entityId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await proxyRequest(
      req,
      res,
      SERVICES.LOG,
      `/logs/${req.params.service}/${req.params.entityId}`,
    );
  } catch (error) {
    next(error);
  }
});

export default router;
