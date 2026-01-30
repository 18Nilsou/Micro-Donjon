import { Router, Request, Response } from 'express';
import axios from 'axios';
import { SERVICES } from '../config/services';

const router = Router();

router.get('/health', async (req: Request, res: Response) => {
    const healthChecks: Record<string, string> = {};

    for (const [serviceName, serviceUrl] of Object.entries(SERVICES)) {
        try {
            await axios.get(`${serviceUrl}/health`, { timeout: 2000 });
            healthChecks[serviceName] = 'up';
        } catch (error) {
            healthChecks[serviceName] = 'down';
        }
    }

    const allHealthy = Object.values(healthChecks).every(
        (status) => status === 'up',
    );

    res.status(allHealthy ? 200 : 503).json({
        status: allHealthy ? 'healthy' : 'degraded',
        timestamp: new Date().toISOString(),
        services: healthChecks,
    });
});

export default router;
