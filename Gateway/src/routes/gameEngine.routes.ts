import { Router, Request, Response, NextFunction } from 'express';
import { SERVICES } from '../config/services';
import { proxyRequest } from '../utils/proxyRequest';

const router = Router();

// Game routes
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

router.post('/game/start', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await proxyRequest(req, res, SERVICES.GAME_ENGINE, '/game/start');
  } catch (error) {
    next(error);
  }
});

// Hero routes (via Game Engine)
router.put('/hero/:heroId/move', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await proxyRequest(
      req,
      res,
      SERVICES.GAME_ENGINE,
      `/hero/${req.params.heroId}/move`,
    );
  } catch (error) {
    next(error);
  }
});

// Fight routes
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

// Dungeon routes (via Game Engine)
router.post('/dungeon', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await proxyRequest(req, res, SERVICES.GAME_ENGINE, '/dungeon');
  } catch (error) {
    next(error);
  }
});

router.get('/dungeon', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await proxyRequest(req, res, SERVICES.GAME_ENGINE, '/dungeon');
  } catch (error) {
    next(error);
  }
});

// Mob routes (via Game Engine)
router.get('/mob/:mobId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await proxyRequest(
      req,
      res,
      SERVICES.GAME_ENGINE,
      `/mob/${req.params.mobId}`,
    );
  } catch (error) {
    next(error);
  }
});

router.put('/mob/:mobId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await proxyRequest(
      req,
      res,
      SERVICES.GAME_ENGINE,
      `/mob/${req.params.mobId}`,
    );
  } catch (error) {
    next(error);
  }
});

router.delete('/mob/:mobId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await proxyRequest(
      req,
      res,
      SERVICES.GAME_ENGINE,
      `/mob/${req.params.mobId}`,
    );
  } catch (error) {
    next(error);
  }
});

router.get('/mob', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await proxyRequest(req, res, SERVICES.GAME_ENGINE, '/mob');
  } catch (error) {
    next(error);
  }
});

router.post('/mob', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await proxyRequest(req, res, SERVICES.GAME_ENGINE, '/mob');
  } catch (error) {
    next(error);
  }
});

router.delete('/mob', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await proxyRequest(req, res, SERVICES.GAME_ENGINE, '/mob');
  } catch (error) {
    next(error);
  }
});

// Item routes (via Game Engine)
router.get('/items', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await proxyRequest(req, res, SERVICES.GAME_ENGINE, '/items');
  } catch (error) {
    next(error);
  }
});

router.get('/items/:itemId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await proxyRequest(
      req,
      res,
      SERVICES.GAME_ENGINE,
      `/items/${req.params.itemId}`,
    );
  } catch (error) {
    next(error);
  }
});

export default router;
