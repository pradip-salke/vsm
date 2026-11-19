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
export const generalEnquirySchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(160),
  email: z.string().trim().email('Valid email is required').max(254),
  phone: z.string().trim().min(7, 'Phone number is required').max(32),
  organization: z.string().trim().min(2, 'Organization is required').max(180),
  designation: z.string().trim().min(2, 'Designation is required').max(160),
  city: z.string().trim().max(120).optional(),
  message: z.string().trim().min(5, 'Message is required').max(4000),
  source: z.string().trim().max(120).optional(),
});

const careerSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(160),
  email: z.string().trim().email('Valid email is required').max(254),
  phone: z.string().trim().min(10, 'Valid 10-digit phone number is required').max(32),
  position: z.string().trim().min(1, 'Position applied is required').max(120),
  designation: z.string().trim().min(1, 'Current designation is required').max(120),
});

const phoneSchema = z.string().trim().min(7, 'Enter a valid phone number').max(32).refine((value) => {
  const digits = value.replace(/\D/g, '');
  return /^[+\d][\d\s()-]*$/.test(value) && digits.length >= 7 && digits.length <= 15;
}, 'Enter a valid phone number');

export const applicationSchema = z.object({
  firstName: z.string().trim().min(1, 'First name is required').max(120),
  middleName: z.string().trim().max(120).optional().nullable(),
  lastName: z.string().trim().min(1, 'Last name is required').max(120),
  email: z.string().trim().email('Valid email is required').max(254),
  phone: phoneSchema,
  parentPhone: phoneSchema,
  dateOfBirth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Enter a valid date of birth').refine((value) => {
    const date = new Date(`${value}T00:00:00.000Z`);
    return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value && date <= new Date();
  }, 'Enter a valid date of birth'),
  address: z.string().trim().min(1, 'Address is required').max(1000),
  city: z.string().trim().min(1, 'City is required').max(120),
  pinCode: z.string().trim().regex(/^\d{6}$/, 'Enter a valid 6-digit PIN code'),
  country: z.string().trim().min(1, 'Country is required').max(100),
  nationality: z.string().trim().min(1, 'Nationality is required').max(80),
  gender: z.enum(['Male', 'Female']),
  familyAnnualIncome: z.string().trim().min(1, 'Family annual income is required').max(80),
  referral: z.enum(['Website', 'Social Media', 'Advertisement', 'Friend', 'Phone / SMS / Email', 'Other']),
  referralOther: z.string().max(160).optional().nullable(),
  consent: z.boolean().refine((accepted) => accepted, 'You must accept the terms and privacy policy'),
  education: z.array(z.object({
    stage: z.enum(['10th', '12th', 'Graduation']),
    institution: z.string().trim().min(1, 'Institution is required').max(240),
    board: z.string().trim().max(240).optional().nullable(),
    stream: z.string().trim().min(1, 'Stream is required').max(160),
    passingYear: z.number().int().min(1950).max(new Date().getFullYear()),
    resultPercent: z.number().min(0).max(100),
  }).superRefine((entry, context) => {
    if (entry.stage !== 'Graduation' && !entry.board?.trim()) context.addIssue({ code: 'custom', path: ['board'], message: 'Board is required' });
  })).length(3, 'Enter 10th, 12th and Graduation details').refine((entries) => new Set(entries.map((entry) => entry.stage)).size === 3, 'Each education stage must be unique'),
  examScores: z.array(z.object({
    examCode: z.string().min(1).max(40),
    score: z.number().optional().nullable(),
    rank: z.number().int().optional().nullable(),
    session: z.string().max(40).optional().nullable(),
  })).optional(),
}).strict().superRefine((application, context) => {
  if (application.referral === 'Other' && !application.referralOther?.trim()) {
    context.addIssue({ code: 'custom', path: ['referralOther'], message: 'Please specify how you heard about VSM' });
  }
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

