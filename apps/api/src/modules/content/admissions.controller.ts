import type { RequestHandler } from 'express';
import {
  readAdmissionsDocument,
  readAdmissionsList,
  readAdmissionsPublic,
  updateAdmissionsBulk,
  updateAdmissionsDocument,
} from './admissions.service.js';

const slugOf = (req: Parameters<RequestHandler>[0]) => String(req.params.page);

export const listAdmissionsSections: RequestHandler = async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  res.json({ data: await readAdmissionsList(slugOf(req)) });
};

export const saveAdmissionsSections: RequestHandler = async (req, res) => {
  res.json({ data: await updateAdmissionsBulk(slugOf(req), req.body, req.auth!.userId, req.requestId) });
};

export const admissionsMasterDocument: RequestHandler = async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  res.json({ data: await readAdmissionsDocument(slugOf(req), `master-${String(req.params.masterKey)}`) });
};

export const saveAdmissionsMasterDocument: RequestHandler = async (req, res) => {
  res.json({ data: await updateAdmissionsDocument(slugOf(req), `master-${String(req.params.masterKey)}`, req.body, req.auth!.userId, req.requestId) });
};

export const admissionsDocument: RequestHandler = async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  res.json({ data: await readAdmissionsDocument(slugOf(req), String(req.params.key)) });
};

export const saveAdmissionsDocument: RequestHandler = async (req, res) => {
  res.json({ data: await updateAdmissionsDocument(slugOf(req), String(req.params.key), req.body, req.auth!.userId, req.requestId) });
};

export const publicAdmissions: RequestHandler = async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  res.json({ data: await readAdmissionsPublic(slugOf(req)) });
};
