import { Prisma } from '@prisma/client';
import { z } from 'zod';
import { prisma } from '../../lib/prisma.js';
import { HttpError } from '../../middleware/errors.js';
import { readHome } from './home.service.js';
import { readAcademics } from './academics.service.js';
import { readAima } from './academics-aima.service.js';
import { readSpecialisationPage } from './academics-specialisations.service.js';
import { academicsSpecialisationIndex } from '@vsmedu/contracts/academics-specialisations';

const validScopes = new Set(['home', 'aicte', 'aima', ...academicsSpecialisationIndex.map(item => item.slug)]);
const imageSchema = z.object({ src: z.string().max(2048), alt: z.string().max(1000), width: z.number().int().positive(), height: z.number().int().positive() });
const itemSchema = z.object({ name: z.string().max(1000), batch: z.string().max(1000), quote: z.string().max(30000), videoLink: z.string().max(2048), image: imageSchema, avatar: imageSchema.optional(), enabled: z.boolean(), pages: z.array(z.string().refine(page => validScopes.has(page), 'Unknown page')).max(validScopes.size).refine(pages => new Set(pages).size === pages.length, 'Select each page only once').optional() }).passthrough();
const bodySchema = z.object({ content: z.object({ items: z.array(itemSchema).max(100) }), updatedAt: z.string().datetime().nullable() }).strict();

function key(scope: string, kind: string) {
  if (!validScopes.has(scope) || !['video', 'written'].includes(kind)) throw new HttpError(404, 'TESTIMONIAL_MASTER_NOT_FOUND', 'Unknown testimonial master');
  return `testimonial-master.${scope}.${kind}`;
}

async function legacy(scope: string) {
  if (scope === 'home') return (await readHome()).masters.testimonials.items;
  if (scope === 'aicte') return (await readAcademics()).masters.testimonials.items;
  if (scope === 'aima') return (await readAima()).masters.testimonials.items;
  return (await readSpecialisationPage(scope)).testimonials.items;
}

export async function readTestimonialMaster(scope: string, kind: string) {
  const record = await prisma.websiteSetting.findUnique({ where: { key: key(scope, kind) } });
  if (record) return { content: record.value, updatedAt: record.updatedAt.toISOString() };
  const items = await legacy(scope) as { videoLink?: string; quote?: string }[];
  return { content: { items: items.filter(item => kind === 'video' ? Boolean(item.videoLink?.trim()) : Boolean(item.quote?.trim())) }, updatedAt: null };
}

export async function saveTestimonialMaster(scope: string, kind: string, input: unknown, actorId: number, requestId?: string) {
  const recordKey = key(scope, kind);
  const parsed = bodySchema.parse(input);
  return prisma.$transaction(async tx => {
    const old = await tx.websiteSetting.findUnique({ where: { key: recordKey } });
    if ((old?.updatedAt.toISOString() ?? null) !== parsed.updatedAt) throw new HttpError(409, 'CONTENT_CONFLICT', 'This content was updated elsewhere. Reload before saving.');
    const value = parsed.content as Prisma.InputJsonValue;
    if (old) {
      const changed = await tx.websiteSetting.updateMany({ where: { id: old.id, updatedAt: old.updatedAt }, data: { value, isPublic: true } });
      if (changed.count !== 1) throw new HttpError(409, 'CONTENT_CONFLICT', 'This content was updated elsewhere. Reload before saving.');
    } else await tx.websiteSetting.create({ data: { key: recordKey, value, isPublic: true } });
    await tx.auditLog.create({ data: { actorId, action: 'testimonials.update', entityType: 'testimonials', entityId: `${scope}.${kind}`, requestId } });
    const saved = await tx.websiteSetting.findUniqueOrThrow({ where: { key: recordKey } });
    return { content: saved.value, updatedAt: saved.updatedAt.toISOString() };
  });
}
