import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { randomUUID } from 'node:crypto';
import { rateLimit } from 'express-rate-limit';
import { env, trustedOrigins } from './config/env.js';
import { authRouter } from './routes/auth.js';
import { publicRouter } from './routes/public.js';
import { adminRouter } from './routes/admin.js';
import { errorHandler, notFound } from './middleware/errors.js';
import { homeMediaRoot } from './modules/content/home-media.js';

export function createApp() {
  const app = express();
  app.disable('x-powered-by');
  if (env.TRUST_PROXY) app.set('trust proxy', 1);
  app.use(helmet());
  app.use(cors({ origin: [...trustedOrigins], credentials: true, methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'], allowedHeaders: ['Content-Type', 'X-Request-Id', 'X-CSRF-Token', 'X-File-Name'] }));
  app.use('/cms-media', (_req, res, next) => { res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin'); next(); }, express.static(homeMediaRoot, { immutable: true, maxAge: '1y', dotfiles: 'deny', index: false }));
  app.use(express.json({ limit: '256kb' }));
  app.use((req, res, next) => { req.requestId = req.get('x-request-id')?.slice(0, 100) || randomUUID(); res.setHeader('X-Request-Id', req.requestId); next(); });
  app.use('/api/v1/auth/login', rateLimit({ windowMs: 15 * 60 * 1000, limit: 10, standardHeaders: 'draft-8', legacyHeaders: false }));
  app.use('/api/v1/public/enquiries', rateLimit({ windowMs: 15 * 60 * 1000, limit: 20, standardHeaders: 'draft-8', legacyHeaders: false }));
  app.get('/health/live', (_req, res) => res.json({ data: { status: 'ok' } }));
  app.get('/health/ready', async (req, res) => {
    try { const { prisma } = await import('./lib/prisma.js'); await prisma.$queryRaw`SELECT 1`; res.json({ data: { status: 'ready' } }); }
    catch { res.status(503).json({ error: { code: 'SERVICE_UNAVAILABLE', message: 'Database is unavailable', requestId: req.requestId } }); }
  });
  app.use('/api/v1/auth', authRouter);
  app.use('/api/v1/public', publicRouter);
  app.use('/api/v1/admin', adminRouter);
  app.use(notFound);
  app.use(errorHandler);
  return app;
}
