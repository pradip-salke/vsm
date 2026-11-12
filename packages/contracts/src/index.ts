import { z } from 'zod';

export const LoginRequestSchema = z.object({ email: z.email().max(254), password: z.string().min(1).max(256) });
export const PageStatusSchema = z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']);
export const EnquiryRequestSchema = z.object({ name: z.string().trim().min(2).max(160), email: z.email().max(254).optional(), phone: z.string().trim().min(7).max(32), consent: z.literal(true) });
export type LoginRequest = z.infer<typeof LoginRequestSchema>;
export type EnquiryRequest = z.infer<typeof EnquiryRequestSchema>;
export * from './home.js';
export * from './academic-faq.js';
export * from './footer.js';
export * from './academics.js';
export * from './academics-aima.js';
export * from './academics-specialisations.js';
export * from './admissions.js';
export * from './site-pages.js';
export * from './about-pages.js';
export * from './career-page.js';
export * from './blogs.js';
