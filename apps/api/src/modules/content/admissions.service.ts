import { Prisma } from '@prisma/client';
import { z } from 'zod';
import { admissionsPages, type AdmissionsPageSlug } from '@vsmedu/contracts/admissions';
import { prisma } from '../../lib/prisma.js';
import { HttpError } from '../../middleware/errors.js';
import { cleanSubtitle } from './home.service.js';

type Doc = { content: unknown; updatedAt: string | null };

const RICH_TEXT_KEYS = new Set(['subtitle', 'body', 'lead', 'answer']);
const REQUIRED_KEYS = new Set(['title', 'question', 'label', 'detail', 'particular', 'columnLabel', 'columnValue', 'particularHeading', 'deductionHeading', 'refundHeading']);

function page(slug: string) {
  if (!(slug in admissionsPages)) throw new HttpError(404, 'ADMISSIONS_PAGE_NOT_FOUND', `Unknown Admissions page: ${slug}`);
  return admissionsPages[slug as AdmissionsPageSlug];
}

/** Every stored document of one page: section keys plus `master-<key>`. */
function documents(slug: string): Record<string, unknown> {
  const p = page(slug);
  return {
    ...p.sections,
    ...Object.fromEntries(Object.entries(p.masters).map(([key, value]) => [`master-${key}`, value])),
  };
}

const prefix = (slug: string) => `admissions.${slug}.`;

function assertKnown(slug: string, key: string) {
  if (!(key in documents(slug))) throw new HttpError(404, 'ADMISSIONS_SECTION_NOT_FOUND', `Unknown section "${key}" on Admissions page ${slug}`);
}

function contentSchema(value: unknown, key = '', parent = ''): z.ZodType {
  if (Array.isArray(value)) return z.array(contentSchema(value[0], '', key)).max(100);
  if (typeof value === 'boolean') return z.boolean();
  if (typeof value === 'number') return z.number().finite().min(0).max(20000);
  if (value && typeof value === 'object') {
    return z.object(Object.fromEntries(Object.entries(value).map(([k, v]) => [k, contentSchema(v, k, key)]))).strict();
  }
  let result: z.ZodType = z.string().max(30000);
  if (/href$|^src$/i.test(key)) {
    result = z
      .string()
      .max(2048)
      .refine(
        (v) => !v || (/^(\/(?!\/)|#|https?:\/\/|mailto:|tel:\+?[\d -]+$)/.test(v) && !/[\\\u0000-\u001f]/.test(v)),
        'Use a site path, HTTP(S) URL, mailto: or telephone link'
      );
  }
  if (key === 'src') {
    result = result.refine(
      (v) => typeof v === 'string' && (/^\/(?!\/)/.test(v) || v.startsWith('https://vsmedu.com/')),
      'Upload an image, or use a local image path or an existing vsmedu.com upload'
    );
  }
  if (REQUIRED_KEYS.has(key) || (key === 'text' && parent === 'items') || key === 'src') {
    result = result.refine((v) => typeof v === 'string' && v.trim().length > 0, 'This field is required');
  }
  if (key === 'width' || key === 'height') return z.number().int().min(1).max(20000);
  if (RICH_TEXT_KEYS.has(key)) result = result.transform((v) => cleanSubtitle(String(v)));
  return result;
}

function validate(slug: string, key: string, content: unknown) {
  const result = contentSchema(documents(slug)[key]).safeParse(content);
  if (result.success) return result.data;
  throw new z.ZodError(result.error.issues.map((issue) => ({ ...issue, path: [key, ...issue.path] })));
}

async function loadRows(slug: string) {
  const rows = await prisma.websiteSetting.findMany({ where: { key: { startsWith: prefix(slug) } } });
  return new Map(rows.map((row) => [row.key.slice(prefix(slug).length), row]));
}

export async function readAdmissionsList(slug: string) {
  const defaults = documents(slug);
  const rows = await loadRows(slug);
  const result: Record<string, Doc> = {};
  for (const [key, value] of Object.entries(defaults)) {
    const row = rows.get(key);
    result[key] = { content: row?.value ?? value, updatedAt: row?.updatedAt.toISOString() ?? null };
  }
  return result;
}

export async function readAdmissionsDocument(slug: string, key: string): Promise<Doc> {
  assertKnown(slug, key);
  const row = await prisma.websiteSetting.findUnique({ where: { key: `${prefix(slug)}${key}` } });
  return { content: row?.value ?? documents(slug)[key], updatedAt: row?.updatedAt.toISOString() ?? null };
}

/** Public payload: sections plus masters, with the first enabled banner slide merged into `hero`. */
export async function readAdmissionsPublic(slug: string) {
  const list = await readAdmissionsList(slug);
  if (list.faq) {
    const faqRow = await prisma.websiteSetting.findUnique({ where: { key: `${prefix(slug)}faq` } });
    if (!faqRow) {
      const faq = list.faq.content as Record<string, unknown>;
      list.faq = { ...list.faq, content: { ...faq, items: [] } };
    }
  }
  const sections: Record<string, unknown> = {};
  const masters: Record<string, unknown> = {};
  for (const [key, doc] of Object.entries(list)) {
    if (key.startsWith('master-')) masters[key.slice(7)] = doc.content;
    else sections[key] = doc.content;
  }
  const slides = ((masters.hero as { items?: { enabled?: boolean }[] })?.items ?? []).filter((s) => s.enabled);
  if (slides[0]) sections.hero = { ...slides[0], ...(sections.hero as object) };
  return { path: page(slug).path, sections, masters };
}

async function write(tx: Prisma.TransactionClient, slug: string, key: string, content: unknown, updatedAt: string | null, action: string, actorId: number, requestId?: string) {
  const dbKey = `${prefix(slug)}${key}`;
  const conflict = () => new HttpError(409, 'CONTENT_CONFLICT', `"${key}" was updated elsewhere. Reload before saving.`);
  const old = await tx.websiteSetting.findUnique({ where: { key: dbKey } });
  if ((old?.updatedAt.toISOString() ?? null) !== updatedAt) throw conflict();
  const value = content as Prisma.InputJsonValue;
  if (old) {
    const row = await tx.websiteSetting.updateMany({ where: { id: old.id, updatedAt: old.updatedAt }, data: { value, isPublic: true } });
    if (row.count === 0) throw conflict();
  } else {
    await tx.websiteSetting.create({ data: { key: dbKey, value, isPublic: true } });
  }
  await tx.auditLog.create({ data: { actorId, action, entityType: 'admissions', entityId: `${slug}.${key}`, requestId } });
  const saved = await tx.websiteSetting.findUniqueOrThrow({ where: { key: dbKey } });
  return { content: saved.value, updatedAt: saved.updatedAt.toISOString() };
}

const DocInput = z.object({ content: z.unknown(), updatedAt: z.string().datetime().nullable() }).strict();

export async function updateAdmissionsDocument(slug: string, key: string, input: unknown, actorId: number, requestId?: string) {
  assertKnown(slug, key);
  const { content, updatedAt } = DocInput.parse(input);
  const validated = validate(slug, key, content);
  return prisma.$transaction((tx) => write(tx, slug, key, validated, updatedAt, 'admissions.update', actorId, requestId));
}

export async function updateAdmissionsBulk(slug: string, input: unknown, actorId: number, requestId?: string) {
  page(slug);
  const { sections } = z.object({ sections: z.record(z.string(), DocInput) }).strict().parse(input);
  const validated = Object.entries(sections).map(([key, item]) => {
    assertKnown(slug, key);
    return { key, content: validate(slug, key, item.content), updatedAt: item.updatedAt };
  });
  return prisma.$transaction(async (tx) => {
    const updated: Record<string, { content: unknown; updatedAt: string }> = {};
    for (const { key, content, updatedAt } of validated) {
      updated[key] = await write(tx, slug, key, content, updatedAt, 'admissions.bulk_update', actorId, requestId);
    }
    return updated;
  });
}
