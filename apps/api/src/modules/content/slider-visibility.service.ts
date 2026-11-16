import { Prisma } from '@prisma/client';
import { z } from 'zod';
import { academicsSpecialisationIndex } from '@vsmedu/contracts/academics-specialisations';
import { prisma } from '../../lib/prisma.js';
import { HttpError } from '../../middleware/errors.js';

const scopes = ['home', 'aicte', 'aima', ...academicsSpecialisationIndex.map(item => item.slug)];
const masters = ['faculty', 'recruiters', 'internships', 'testimonials'] as const;
const schema = z.object({ pages: z.array(z.enum(scopes as [string, ...string[]])).max(scopes.length), updatedAt: z.string().datetime().nullable() }).strict();

function key(master: string) {
  if (!masters.includes(master as typeof masters[number])) throw new HttpError(404, 'SLIDER_NOT_FOUND', 'Unknown slider');
  return `slider-visibility.${master}`;
}

export async function readSliderVisibility(master: string) {
  const row = await prisma.websiteSetting.findUnique({ where: { key: key(master) } });
  return { pages: row ? (row.value as { pages: string[] }).pages : master === 'faculty' ? ['home', 'aicte'] : scopes, updatedAt: row?.updatedAt.toISOString() ?? null };
}

export async function saveSliderVisibility(master: string, input: unknown, actorId: number, requestId?: string) {
  const recordKey = key(master);
  const data = schema.parse(input);
  if (new Set(data.pages).size !== data.pages.length) throw new HttpError(400, 'DUPLICATE_PAGE', 'Select each page only once');
  return prisma.$transaction(async tx => {
    const old = await tx.websiteSetting.findUnique({ where: { key: recordKey } });
    if ((old?.updatedAt.toISOString() ?? null) !== data.updatedAt) throw new HttpError(409, 'CONTENT_CONFLICT', 'Visibility was updated elsewhere. Reload before saving.');
    const value = { pages: data.pages } as Prisma.InputJsonValue;
    if (old) {
      const changed = await tx.websiteSetting.updateMany({ where: { id: old.id, updatedAt: old.updatedAt }, data: { value, isPublic: true } });
      if (!changed.count) throw new HttpError(409, 'CONTENT_CONFLICT', 'Visibility was updated elsewhere. Reload before saving.');
    } else await tx.websiteSetting.create({ data: { key: recordKey, value, isPublic: true } });
    await tx.auditLog.create({ data: { actorId, action: 'slider.visibility.update', entityType: 'slider', entityId: master, requestId } });
    const saved = await tx.websiteSetting.findUniqueOrThrow({ where: { key: recordKey } });
    return { pages: data.pages, updatedAt: saved.updatedAt.toISOString() };
  });
}
