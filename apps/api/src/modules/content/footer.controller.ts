import type { RequestHandler } from 'express';
import {
  readFooterAdmin,
  updateFooterAdmin,
  readPublicFooter,
} from './footer.service.js';

export const getFooterAdmin: RequestHandler = async (_req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  res.json({ data: await readFooterAdmin() });
};

export const saveFooterAdmin: RequestHandler = async (req, res) => {
  res.json({
    data: await updateFooterAdmin(req.body, req.auth!.userId, req.requestId),
  });
};

export const getPublicFooter: RequestHandler = async (_req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  res.json({ data: await readPublicFooter() });
};

