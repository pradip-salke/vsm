import type { Request, Response, RequestHandler } from 'express';
import multer from 'multer';
import { resolve, extname } from 'node:path';
import { randomUUID } from 'node:crypto';
import { z } from 'zod';
import { enquiriesService } from './enquiries.service.js';
import { homeMediaRoot } from '../content/home-media.js';
import { HttpError } from '../../middleware/errors.js';

// Resume file storage via multer
const resumeStorage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, homeMediaRoot);
  },
  filename: (_req, file, cb) => {
    const ext = extname(file.originalname).toLowerCase();
    const cleanName = file.originalname
      .replace(ext, '')
      .replace(/[^a-zA-Z0-9._-]/g, '_')
      .slice(0, 50);
    cb(null, `resume-${randomUUID()}-${cleanName}${ext}`);
  },
});

const allowedResumeExtensions = new Set(['.pdf', '.doc', '.docx']);
const allowedResumeMimes = new Set([
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/octet-stream',
]);

export const uploadResumeMiddleware = multer({
  storage: resumeStorage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB limit
  fileFilter: (_req, file, cb) => {
    const ext = extname(file.originalname).toLowerCase();
    if (allowedResumeExtensions.has(ext) || allowedResumeMimes.has(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new HttpError(400, 'INVALID_FILE_TYPE', 'Only PDF, DOC, and DOCX files are allowed for resumes.'));
    }
  },
}).single('resume');

// --- Schemas ---
const generalEnquirySchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(160),
  email: z.string().trim().email().max(254).optional().or(z.literal('')),
  phone: z.string().trim().min(7, 'Phone number is required').max(32),
  city: z.string().trim().max(120).optional(),
  message: z.string().trim().max(4000).optional(),
  source: z.string().trim().max(120).optional(),
});

const careerSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(160),
  email: z.string().trim().email('Valid email is required').max(254),
  phone: z.string().trim().min(10, 'Valid 10-digit phone number is required').max(32),
  position: z.string().trim().min(1, 'Position applied is required').max(120),
  designation: z.string().trim().min(1, 'Current designation is required').max(120),
});

const applicationSchema = z.object({
  firstName: z.string().trim().min(1, 'First name is required').max(120),
  middleName: z.string().trim().max(120).optional().nullable(),
  lastName: z.string().trim().min(1, 'Last name is required').max(120),
  email: z.string().trim().email('Valid email is required').max(254),
  phone: z.string().trim().min(7, 'Phone number is required').max(32),
  parentPhone: z.string().trim().max(32).optional().nullable(),
  dateOfBirth: z.string().optional().nullable(),
  address: z.string().max(1000).optional().nullable(),
  city: z.string().max(120).optional().nullable(),
  pinCode: z.string().max(20).optional().nullable(),
  country: z.string().max(100).optional().nullable(),
  nationality: z.string().max(80).optional().nullable(),
  gender: z.string().max(30).optional().nullable(),
  familyAnnualIncome: z.string().max(80).optional().nullable(),
  referral: z.string().max(100).optional().nullable(),
  referralOther: z.string().max(160).optional().nullable(),
  education: z.array(
    z.object({
      stage: z.string().min(1).max(30),
      institution: z.string().max(240).optional().nullable(),
      board: z.string().max(240).optional().nullable(),
      stream: z.string().max(160).optional().nullable(),
      passingYear: z.coerce.number().int().optional().nullable(),
      resultPercent: z.coerce.number().optional().nullable(),
    })
  ).optional(),
  examScores: z.array(
    z.object({
      examCode: z.string().min(1).max(40),
      score: z.coerce.number().optional().nullable(),
      rank: z.coerce.number().int().optional().nullable(),
      session: z.string().max(40).optional().nullable(),
    })
  ).optional(),
});

// --- Public Endpoints ---
export const submitGeneralEnquiry: RequestHandler = async (req, res) => {
  const parsed = generalEnquirySchema.parse(req.body);
  const enquiry = await enquiriesService.createGeneralEnquiry(parsed);
  res.status(201).json({ data: { id: enquiry.id, status: enquiry.status } });
};

export const submitCareerEnquiry: RequestHandler = async (req, res) => {
  const parsed = careerSchema.parse(req.body);
  let resumeUrl = '';
  let resumeName = '';

  if (req.file) {
    resumeUrl = `/cms-media/${req.file.filename}`;
    resumeName = req.file.originalname;
  } else if (req.body.resumeUrl) {
    resumeUrl = String(req.body.resumeUrl);
    resumeName = String(req.body.resumeName || 'Resume');
  } else {
    throw new HttpError(400, 'RESUME_REQUIRED', 'Resume document is required.');
  }

  const enquiry = await enquiriesService.createCareerEnquiry({
    ...parsed,
    resumeUrl,
    resumeName,
  });

  res.status(201).json({
    data: {
      id: enquiry.id,
      status: enquiry.status,
      message: 'Career application submitted successfully.',
    },
  });
};

export const submitApplication: RequestHandler = async (req, res) => {
  const parsed = applicationSchema.parse(req.body);
  const application = await enquiriesService.createApplication(parsed);

  res.status(201).json({
    data: {
      id: application.id,
      status: application.status,
      message: 'Application submitted successfully.',
    },
  });
};

// --- Admin Endpoints ---
export const getCareerEnquiries: RequestHandler = async (req, res) => {
  const result = await enquiriesService.listCareerEnquiries(req.query);
  res.json({ data: result });
};

export const getGeneralEnquiries: RequestHandler = async (req, res) => {
  const result = await enquiriesService.listGeneralEnquiries(req.query);
  res.json({ data: result });
};

export const getApplications: RequestHandler = async (req, res) => {
  const result = await enquiriesService.listApplications(req.query);
  res.json({ data: result });
};

export const setEnquiryStatus: RequestHandler = async (req, res) => {
  const id = Number(req.params.id);
  const status = z.enum(['NEW', 'IN_PROGRESS', 'RESOLVED', 'SPAM']).parse(req.body.status);
  const reviewerId = req.auth?.userId;
  const updated = await enquiriesService.updateEnquiryStatus(id, status, reviewerId);
  res.json({ data: updated });
};

export const setApplicationStatus: RequestHandler = async (req, res) => {
  const id = Number(req.params.id);
  const status = z.string().min(1).max(30).parse(req.body.status);
  const updated = await enquiriesService.updateApplicationStatus(id, status);
  res.json({ data: updated });
};

export const removeEnquiry: RequestHandler = async (req, res) => {
  const id = Number(req.params.id);
  await enquiriesService.deleteEnquiry(id);
  res.status(204).end();
};

export const removeApplication: RequestHandler = async (req, res) => {
  const id = Number(req.params.id);
  await enquiriesService.deleteApplication(id);
  res.status(204).end();
};

