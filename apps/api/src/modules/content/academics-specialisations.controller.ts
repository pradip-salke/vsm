import type { RequestHandler } from 'express';
import {
  readSpecialisationPage,
  readSpecialisationsAllAdmin,
  readSpecialisationAdmin,
  readSpecialisationDocument,
  updateSpecialisationDocument,
  updateSpecialisationsBulk,
} from './academics-specialisations.service.js';

export const saveSpecSections: RequestHandler = async (req, res) => {
  res.json({ data: await updateSpecialisationsBulk(req.body, req.auth!.userId, req.requestId) });
};

export const listSpecSections: RequestHandler = async (_req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  res.json({ data: await readSpecialisationsAllAdmin() });
};

export const listSpecSlugSections: RequestHandler = async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  res.json({ data: await readSpecialisationAdmin(String(req.params.slug)) });
};

export const saveSpecSlugSections: RequestHandler = async (req, res) => {
  res.json({ data: await updateSpecialisationsBulk(req.body, req.auth!.userId, req.requestId) });
};

export const specDocument: RequestHandler = async (req, res) => {
  const key = `${String(req.params.slug)}.${String(req.params.section)}`;
  res.setHeader('Cache-Control', 'no-store');
  res.json({ data: await readSpecialisationDocument(key) });
};

export const saveSpecDocument: RequestHandler = async (req, res) => {
  const key = `${String(req.params.slug)}.${String(req.params.section)}`;
  res.json({
    data: await updateSpecialisationDocument(key, req.body, req.auth!.userId, req.requestId),
  });
};

export const specMasterDocument: RequestHandler = async (req, res) => {
  const key = `master-${String(req.params.slug)}.${String(req.params.masterKey)}`;
  res.setHeader('Cache-Control', 'no-store');
  res.json({ data: await readSpecialisationDocument(key) });
};

export const saveSpecMasterDocument: RequestHandler = async (req, res) => {
  const key = `master-${String(req.params.slug)}.${String(req.params.masterKey)}`;
  res.json({
    data: await updateSpecialisationDocument(key, req.body, req.auth!.userId, req.requestId),
  });
};

export const publicSpecPage: RequestHandler = async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  res.json({ data: await readSpecialisationPage(String(req.params.slug)) });
};
