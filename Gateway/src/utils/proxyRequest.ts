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
        ...req.headers,
      },
      data: req.body,
      params: req.query,
    };

    const response = await axios(config);
    res.status(response.status).json(response.data);
  } catch (error) {
    throw error;
  }
};
