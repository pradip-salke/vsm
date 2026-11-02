import type { RequestHandler } from 'express';
import { z } from 'zod';
import { EnquiryRequestSchema } from '@vsmedu/contracts';
import { contentService } from './content.service.js';

const slugSchema = z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
const enquirySchema = EnquiryRequestSchema.extend({ city: z.string().trim().max(120).optional(), message: z.string().trim().max(4000).optional(), source: z.string().trim().max(120).optional(), email: z.email().max(254).optional().or(z.literal('')) });

export const getPage: RequestHandler = async (req, res) => res.json({ data: await contentService.getPage(slugSchema.parse(req.params.slug)) });
export const getProgrammes: RequestHandler = async (_req, res) => res.json({ data: await contentService.listProgrammes() });
export const submitEnquiry: RequestHandler = async (req, res) => {
  const enquiry = await contentService.createEnquiry(enquirySchema.parse(req.body));
  res.status(201).json({ data: { id: enquiry.id, status: enquiry.status } });
};
