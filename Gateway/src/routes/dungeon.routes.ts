import { Router, Request, Response, NextFunction } from 'express';
import { SERVICES } from '../config/services';
import { proxyRequest } from '../utils/proxyRequest';

const router = Router();

router.get('/dungeons', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await proxyRequest(req, res, SERVICES.DUNGEON, '/dungeons');
  } catch (error) {
    next(error);
  }
});

router.get('/dungeons/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await proxyRequest(
      req,
      res,
      SERVICES.DUNGEON,
      `/dungeons/${req.params.id}`,
    );
  } catch (error) {
    next(error);
  }
});

router.post('/dungeons', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await proxyRequest(req, res, SERVICES.DUNGEON, '/dungeons');
  } catch (error) {
    next(error);
  }
});

export default router;
