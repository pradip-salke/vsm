import type { RequestHandler } from 'express';
import {
  readAima,
  readAimaDocument,
  readAimaAllAdmin,
  updateAimaDocument,
  updateAimaBulk,
} from './academics-aima.service.js';

export const saveAimaSections: RequestHandler = async (req, res) => {
  res.json({ data: await updateAimaBulk(req.body, req.auth!.userId, req.requestId) });
};

export const publicAima: RequestHandler = async (_req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  res.json({ data: await readAima() });
};

export const listAimaSections: RequestHandler = async (_req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  res.json({ data: await readAimaAllAdmin() });
};

export const aimaDocument: RequestHandler = async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  res.json({ data: await readAimaDocument(String(req.params.key)) });
};

export const saveAimaDocument: RequestHandler = async (req, res) => {
  res.json({
    data: await updateAimaDocument(String(req.params.key), req.body, req.auth!.userId, req.requestId),
  });
};

const masterKeyToDoc = (param: string) => `master-${param}`;

export const aimaMasterDocument: RequestHandler = async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  res.json({ data: await readAimaDocument(masterKeyToDoc(String(req.params.masterKey))) });
};

export const saveAimaMasterDocument: RequestHandler = async (req, res) => {
  res.json({
    data: await updateAimaDocument(
      masterKeyToDoc(String(req.params.masterKey)),
      req.body,
      req.auth!.userId,
      req.requestId
    ),
  });
};
