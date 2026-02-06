import { Router, Request, Response, NextFunction } from 'express';
import { SERVICES } from '../config/services';
import { proxyRequest } from '../utils/proxyRequest';

const router = Router();

router.post('/game/start', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await proxyRequest(req, res, SERVICES.GAME_ENGINE, '/game/start');
  } catch (error) {
    next(error);
  }
});

router.post('/game', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await proxyRequest(req, res, SERVICES.GAME_ENGINE, '/game');
  } catch (error) {
    next(error);
  }
});

router.get('/game', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await proxyRequest(req, res, SERVICES.GAME_ENGINE, '/game');
  } catch (error) {
    next(error);
  }
});

router.put('/game', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await proxyRequest(req, res, SERVICES.GAME_ENGINE, '/game');
  } catch (error) {
    next(error);
  }
});

router.delete('/game', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await proxyRequest(req, res, SERVICES.GAME_ENGINE, '/game');
  } catch (error) {
    next(error);
  }
});

// Hero routes (via Game Engine)
router.post('/hero/move', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await proxyRequest(
      req,
      res,
      SERVICES.GAME_ENGINE,
      `/hero/move`,
    );
  } catch (error) {
    next(error);
  }
});

// Fight routes
router.post('/fight/:id/attack', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await proxyRequest(req, res, SERVICES.GAME_ENGINE, `/fight/${req.params.id}/attack`);
  } catch (error) {
    next(error);
  }
});

router.post('/fight/:id/defend', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await proxyRequest(req, res, SERVICES.GAME_ENGINE, `/fight/${req.params.id}/defend`);
  } catch (error) {
    next(error);
  }
});

router.post('/fight/:id/flee', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await proxyRequest(req, res, SERVICES.GAME_ENGINE, `/fight/${req.params.id}/flee`);
  } catch (error) {
    next(error);
  }
});

router.post('/fight', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await proxyRequest(req, res, SERVICES.GAME_ENGINE, '/fight');
  } catch (error) {
    next(error);
  }
});

router.get('/fight', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await proxyRequest(req, res, SERVICES.GAME_ENGINE, '/fight');
  } catch (error) {
    next(error);
  }
});

router.put('/fight', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await proxyRequest(req, res, SERVICES.GAME_ENGINE, '/fight');
  } catch (error) {
    next(error);
  }
});

router.delete('/fight', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await proxyRequest(req, res, SERVICES.GAME_ENGINE, '/fight');
  } catch (error) {
    next(error);
  }
});

export default router;
