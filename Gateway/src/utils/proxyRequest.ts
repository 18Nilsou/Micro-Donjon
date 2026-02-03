import { Request, Response } from 'express';
import axios, { AxiosRequestConfig } from 'axios';

export const proxyRequest = async (
  req: Request,
  res: Response,
  serviceUrl: string,
  path: string
): Promise<void> => {
  try {
    const config: AxiosRequestConfig = {
      method: req.method,
      url: `${serviceUrl}${path}`,
      headers: {
        'Content-Type': 'application/json',
        ...(req.headers.authorization && { authorization: req.headers.authorization }),
      },
      data: req.body,
      params: req.query,
      validateStatus: () => true,
    };

    const response = await axios(config);

    if (response.data === '' || response.data === undefined || response.data === null) {
      res.status(response.status).send();
    } else {
      res.status(response.status).json(response.data);
    }
  } catch (error: any) {
    console.error('ProxyRequest error:', error.message);
    res.status(500).json({ error: 'Gateway proxy error', details: error.message });
  }
};
