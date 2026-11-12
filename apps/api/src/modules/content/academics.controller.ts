import type { RequestHandler } from 'express';
import {
  readAcademics,
  readPublicProgramVideos,
  readAcademicsDocument,
  updateAcademicsDocument,
  readAcademicsAllAdmin,
  updateAcademicsBulk,
} from './academics.service.js';

export const saveAcademicsSections: RequestHandler = async (req, res) => {
  res.json({ data: await updateAcademicsBulk(req.body, req.auth!.userId, req.requestId) });
};

export const publicAcademics: RequestHandler = async (_req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  res.json({ data: await readAcademics() });
};

export const publicProgramVideos: RequestHandler = async (_req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  res.json({ data: await readPublicProgramVideos() });
};

export const listAcademicsSections: RequestHandler = async (_req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  res.json({ data: await readAcademicsAllAdmin() });
};

export const academicsDocument: RequestHandler = async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  res.json({ data: await readAcademicsDocument(String(req.params.key)) });
};

export const saveAcademicsDocument: RequestHandler = async (req, res) => {
  res.json({
    data: await updateAcademicsDocument(
      String(req.params.key),
      req.body,
      req.auth!.userId,
      req.requestId
    ),
  });
};
