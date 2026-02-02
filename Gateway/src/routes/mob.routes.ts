import { Router, Request, Response, NextFunction } from 'express';
import { SERVICES } from '../config/services';
import { proxyRequest } from '../utils/proxyRequest';

const router = Router();

router.get('/mobs', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await proxyRequest(req, res, SERVICES.MOB, '/mobs');
  } catch (error) {
    next(error);
  }
});

router.get('/mobs/type/:type', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await proxyRequest(req, res, SERVICES.MOB, `/mobs/${req.params.type}`);
  } catch (error) {
    next(error);
  }
});

router.get('/mobs/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await proxyRequest(req, res, SERVICES.MOB, `/mobs/${req.params.id}`);
  } catch (error) {
    next(error);
  }
});

export default router;
