import type { RequestHandler } from 'express';
import { seoService } from './seo.service.js';

const noStore: RequestHandler = (_req, res, next) => {
  res.setHeader('Cache-Control', 'no-store');
  next();
};

export const seoNoStore = noStore;

export const seoOverview: RequestHandler = async (_req, res) => {
  res.json({ data: await seoService.overview() });
};

export const seoListPages: RequestHandler = async (_req, res) => {
  res.json({ data: await seoService.listPages() });
};

export const seoReadPage: RequestHandler = async (req, res) => {
  res.json({ data: await seoService.readPage(req.query.path) });
};

export const seoSavePage: RequestHandler = async (req, res) => {
  res.json({ data: await seoService.savePage(req.query.path, req.body, req.auth!.userId, req.requestId) });
};

export const seoResetPage: RequestHandler = async (req, res) => {
  res.json({ data: await seoService.resetPage(req.query.path, req.query.updatedAt, req.auth!.userId, req.requestId) });
};

export const seoReadGlobal: RequestHandler = async (_req, res) => {
  res.json({ data: await seoService.readGlobal() });
};

export const seoSaveGlobal: RequestHandler = async (req, res) => {
  res.json({ data: await seoService.saveGlobal(req.body, req.auth!.userId, req.requestId) });
};

export const seoReadTracking: RequestHandler = async (_req, res) => {
  res.json({ data: await seoService.readTracking() });
};

export const seoSaveTracking: RequestHandler = async (req, res) => {
  res.json({ data: await seoService.saveTracking(req.body, req.auth!.userId, req.requestId) });
};

export const seoReadRobots: RequestHandler = async (_req, res) => {
  res.json({ data: await seoService.readRobots() });
};

export const seoSaveRobots: RequestHandler = async (req, res) => {
  res.json({ data: await seoService.saveRobots(req.body, req.auth!.userId, req.requestId) });
};

export const seoAudit: RequestHandler = async (req, res) => {
  res.json({ data: await seoService.audit(req.query.paths) });
};

export const publicSeo: RequestHandler = async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  res.json({ data: await seoService.publicPage(req.query.path) });
};

export const publicRobotsTxt: RequestHandler = async (_req, res) => {
  res.setHeader('Cache-Control', 'public, max-age=300');
  res.type('text/plain; charset=utf-8').send(await seoService.robotsTxt());
};

export const publicSitemap: RequestHandler = async (req, res) => {
  const xml = await seoService.sitemapXml(String(req.params.file));
  res.setHeader('Cache-Control', 'public, max-age=300');
  res.type('application/xml; charset=utf-8').send(xml);
};
