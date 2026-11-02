import type { RequestHandler } from 'express';
import { z } from 'zod';
import { adminService } from './admin.service.js';

const PageInput = z.object({ title: z.string().trim().min(1).max(240), slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/), templateKey: z.string().min(1).max(80), status: z.enum(['DRAFT', 'PUBLISHED']).default('DRAFT') });
const PageQuery = z.object({ limit: z.coerce.number().int().min(1).max(100).default(20), cursor: z.coerce.number().int().positive().optional() });

export const dashboard: RequestHandler = async (_req, res) => res.json({ data: await adminService.getDashboard() });
export const createPage: RequestHandler = async (req, res) => {
  const page = await adminService.createPage({ ...PageInput.parse(req.body), authorId: req.auth!.userId, requestId: req.requestId });
  res.status(201).json({ data: page });
};
export const listPages: RequestHandler = async (req, res) => {
  const query = PageQuery.parse(req.query);
  const items = await adminService.listPages(query);
  res.json({ data: items, meta: { nextCursor: items.length === query.limit ? items.at(-1)?.id : null } });
};
