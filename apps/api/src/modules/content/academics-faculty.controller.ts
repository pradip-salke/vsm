import type { RequestHandler } from 'express';
import {
  readFacultyAllAdmin,
  readFacultyDocument,
  readFacultyPage,
  updateFacultyBulk,
  updateFacultyDocument,
} from './academics-faculty.service.js';

export const publicFaculty: RequestHandler = async (_req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  res.json({ data: await readFacultyPage() });
};

export const listFacultySections: RequestHandler = async (_req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  res.json({ data: await readFacultyAllAdmin() });
};

export const saveFacultySections: RequestHandler = async (req, res) => {
  res.json({ data: await updateFacultyBulk(req.body, req.auth!.userId, req.requestId) });
};

export const facultyDocument: RequestHandler = async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  res.json({ data: await readFacultyDocument(String(req.params.key)) });
};

export const saveFacultyDocument: RequestHandler = async (req, res) => {
  res.json({ data: await updateFacultyDocument(String(req.params.key), req.body, req.auth!.userId, req.requestId) });
};

export const facultyMasterDocument: RequestHandler = async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  res.json({ data: await readFacultyDocument(`master-${String(req.params.masterKey)}`) });
};

export const saveFacultyMasterDocument: RequestHandler = async (req, res) => {
  res.json({
    data: await updateFacultyDocument(`master-${String(req.params.masterKey)}`, req.body, req.auth!.userId, req.requestId),
  });
};
