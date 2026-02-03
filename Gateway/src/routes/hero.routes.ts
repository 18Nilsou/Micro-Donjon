import { Router, Request, Response, NextFunction } from 'express';
import { SERVICES } from '../config/services';
import { proxyRequest } from '../utils/proxyRequest';

const router = Router();

router.get('/heroes', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await proxyRequest(req, res, SERVICES.HERO, '/heroes');
  } catch (error) {
    next(error);
  }
});

router.post('/heroes', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await proxyRequest(req, res, SERVICES.HERO, '/heroes');
  } catch (error) {
    next(error);
  }
});

router.get('/heroes/classes', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await proxyRequest(req, res, SERVICES.HERO, '/heroes/classes');
  } catch (error) {
    next(error);
  }
});

router.get('/heroes/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await proxyRequest(req, res, SERVICES.HERO, `/heroes/${req.params.id}`);
  } catch (error) {
    next(error);
  }
});

router.post('/heroes', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await proxyRequest(req, res, SERVICES.HERO, '/heroes');
  } catch (error) {
    next(error);
  }
});

router.delete('/heroes/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await proxyRequest(req, res, SERVICES.HERO, `/heroes/${req.params.id}`);
  } catch (error) {
    next(error);
  }
});

router.put('/heroes/:id/health', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await proxyRequest(
      req,
      res,
      SERVICES.HERO,
      `/heroes/${req.params.id}/health`,
    );
  } catch (error) {
    next(error);
  }
});

router.put('/heroes/:id/health-max', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await proxyRequest(
      req,
      res,
      SERVICES.HERO,
      `/heroes/${req.params.id}/health-max`,
    );
  } catch (error) {
    next(error);
  }
});

router.put('/heroes/:id/level', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await proxyRequest(
      req,
      res,
      SERVICES.HERO,
      `/heroes/${req.params.id}/level`,
    );
  } catch (error) {
    next(error);
  }
});

router.put('/heroes/:id/attack', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await proxyRequest(
      req,
      res,
      SERVICES.HERO,
      `/heroes/${req.params.id}/attack`,
    );
  } catch (error) {
    next(error);
  }
});

router.post('/heroes/:id/inventory', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await proxyRequest(
      req,
      res,
      SERVICES.HERO,
      `/heroes/${req.params.id}/inventory`,
    );
  } catch (error) {
    next(error);
  }
});

router.get('/heroes/:id/inventory', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await proxyRequest(
      req,
      res,
      SERVICES.HERO,
      `/heroes/${req.params.id}/inventory`,
    );
  } catch (error) {
    next(error);
  }
});

export default router;
