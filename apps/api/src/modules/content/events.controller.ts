import type { RequestHandler } from 'express';
import { eventsPages } from '@vsmedu/contracts/events';
import { createPageGroupService } from './page-group.service.js';

const events = createPageGroupService({
  group: 'events',
  label: 'Events',
  pages: eventsPages,
  richTextKeys: ['description'],
  requiredKeys: ['title', 'label'],
  requiredItemKeys: { 'master-speakers': ['name'], 'master-videos': ['videoUrl'] },
});

const slugOf = (req: Parameters<RequestHandler>[0]) => String(req.params.page);

export const listEventsSections: RequestHandler = async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  res.json({ data: await events.readList(slugOf(req)) });
};

export const saveEventsSections: RequestHandler = async (req, res) => {
  res.json({ data: await events.updateBulk(slugOf(req), req.body, req.auth!.userId, req.requestId) });
};

export const eventsMasterDocument: RequestHandler = async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  res.json({ data: await events.readDocument(slugOf(req), `master-${String(req.params.masterKey)}`) });
};

export const saveEventsMasterDocument: RequestHandler = async (req, res) => {
  res.json({ data: await events.updateDocument(slugOf(req), `master-${String(req.params.masterKey)}`, req.body, req.auth!.userId, req.requestId) });
};

export const eventsDocument: RequestHandler = async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  res.json({ data: await events.readDocument(slugOf(req), String(req.params.key)) });
};

export const saveEventsDocument: RequestHandler = async (req, res) => {
  res.json({ data: await events.updateDocument(slugOf(req), String(req.params.key), req.body, req.auth!.userId, req.requestId) });
};

export const publicEvents: RequestHandler = async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  res.json({ data: await events.readPublic(slugOf(req)) });
};
