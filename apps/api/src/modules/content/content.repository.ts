import { prisma } from '../../lib/prisma.js';
import type { z } from 'zod';
import { EnquiryRequestSchema } from '@vsmedu/contracts';

type EnquiryInput = z.infer<typeof EnquiryRequestSchema> & { city?: string; message?: string; source?: string };

export const contentRepository = {
  findPublishedPage: (slug: string) => prisma.page.findFirst({ where: { slug, status: 'PUBLISHED', deletedAt: null }, include: { sections: { where: { enabled: true }, orderBy: { position: 'asc' } }, seo: true } }),
  listPublishedProgrammes: () => prisma.programme.findMany({ where: { status: 'PUBLISHED', deletedAt: null }, include: { category: true, specialisations: { include: { specialisation: true }, orderBy: { position: 'asc' } }, seo: true }, orderBy: { publishedAt: 'desc' }, take: 100 }),
  createEnquiry: (input: EnquiryInput) => prisma.enquiry.create({ data: { name: input.name, email: input.email || null, phone: input.phone, city: input.city, message: input.message, consent: true, consentVersion: 'v1', consentedAt: new Date(), source: input.source ?? 'website', status: 'NEW' } }),
};

