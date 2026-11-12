import type { RequestHandler } from 'express';
import {
  readHome,
  readHomeDocument,
  updateHomeDocument,
  readHomeAllAdmin,
  updateHomeBulk,
  readGlobalSettings,
  updateGlobalSettings,
  readPublicGlobalSettings,
} from './home.service.js';

export const publicHome: RequestHandler = async (_req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  res.json({ data: await readHome() });
};

export const publicGlobalSettings: RequestHandler = async (_req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  res.json({ data: await readPublicGlobalSettings() });
};

export const listHomeSections: RequestHandler = async (_req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  res.json({ data: await readHomeAllAdmin() });
};

export const saveHomeSections: RequestHandler = async (req, res) => {
  res.json({ data: await updateHomeBulk(req.body, req.auth!.userId, req.requestId) });
};

export const homeDocument: RequestHandler = async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  res.json({ data: await readHomeDocument(String(req.params.key)) });
};

export const saveHomeDocument: RequestHandler = async (req, res) => {
  res.json({ data: await updateHomeDocument(String(req.params.key), req.body, req.auth!.userId, req.requestId) });
};

export const getGlobalSettings: RequestHandler = async (_req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  res.json({ data: await readGlobalSettings() });
};

export const saveGlobalSettings: RequestHandler = async (req, res) => {
  res.json({ data: await updateGlobalSettings(req.body, req.auth!.userId, req.requestId) });
};
