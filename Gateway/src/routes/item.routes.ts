import { Router, Request, Response, NextFunction } from 'express';
import { SERVICES } from '../config/services';
import { proxyRequest } from '../utils/proxyRequest';

const router = Router();

router.get('/items', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await proxyRequest(req, res, SERVICES.ITEM, '/items');
  } catch (error) {
    next(error);
  }
});

router.get('/items/random', async (req: Request, res: Response, next: NextFunction) => {
  console.log("GATEWAY - item.routes.ts - /items/random called");
  try {
    await proxyRequest(req, res, SERVICES.ITEM, '/items/random');
  } catch (error) {
    next(error);
  }
});

router.get('/items/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await proxyRequest(req, res, SERVICES.ITEM, `/items/${req.params.id}`);
  } catch (error) {
    next(error);
  }
});

export default router;
