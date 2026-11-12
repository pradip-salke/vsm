import type { RequestHandler } from 'express';
import {
  readPlacementsDocument,
  readPlacementsList,
  readPlacementsPublic,
  updatePlacementsBulk,
  updatePlacementsDocument,
} from './placements.service.js';

const slugOf = (req: Parameters<RequestHandler>[0]) => String(req.params.page);

export const listPlacementsSections: RequestHandler = async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  res.json({ data: await readPlacementsList(slugOf(req)) });
};

export const savePlacementsSections: RequestHandler = async (req, res) => {
  res.json({ data: await updatePlacementsBulk(slugOf(req), req.body, req.auth!.userId, req.requestId) });
};

export const placementsMasterDocument: RequestHandler = async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  res.json({ data: await readPlacementsDocument(slugOf(req), `master-${String(req.params.masterKey)}`) });
};

export const savePlacementsMasterDocument: RequestHandler = async (req, res) => {
  res.json({ data: await updatePlacementsDocument(slugOf(req), `master-${String(req.params.masterKey)}`, req.body, req.auth!.userId, req.requestId) });
};

export const placementsDocument: RequestHandler = async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  res.json({ data: await readPlacementsDocument(slugOf(req), String(req.params.key)) });
};

export const savePlacementsDocument: RequestHandler = async (req, res) => {
  res.json({ data: await updatePlacementsDocument(slugOf(req), String(req.params.key), req.body, req.auth!.userId, req.requestId) });
};

export const publicPlacements: RequestHandler = async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  res.json({ data: await readPlacementsPublic(slugOf(req)) });
};
