import { Prisma } from '@prisma/client';
import { z } from 'zod';
import { aimaDefaults, aimaMasterDefaults, type AimaKey, type AimaMasterKey } from '@vsmedu/contracts/academics-aima';
import { prisma } from '../../lib/prisma.js';
import { HttpError } from '../../middleware/errors.js';
import { cleanSubtitle } from './home.service.js';
import { normalizeVideoLink } from './video-link.js';

type Client = Prisma.TransactionClient | typeof prisma;

const DB_PREFIX = 'academics-aima.';

export const aimaDocuments: Record<string, unknown> = {
  ...Object.fromEntries(Object.entries(aimaDefaults).map(([key, value]) => [key, value])),
  ...Object.fromEntries(Object.entries(aimaMasterDefaults).map(([key, value]) => [`master-${key}`, value])),
};

/** Same sanitization as AICTE academics: HTML-ish strings cleaned on write. */
const RICH_TEXT_KEYS = new Set(['subtitle', 'body', 'intro', 'description', 'answer', 'year1Intro', 'year2Intro']);

function normalizeTestimonialsMaster(content: unknown): unknown {
  if (!content || typeof content !== 'object' || Array.isArray(content)) return content;
  const doc = content as { items?: unknown[] };
  if (!Array.isArray(doc.items)) return content;
  return { ...doc, items: doc.items.map((raw) => {
    if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return raw;
    const item = raw as Record<string, unknown>;
    return { ...item, videoLink: normalizeVideoLink(item.videoLink) };
  }) };
}

function normalizeDocument(key: string, content: unknown): unknown {
  return key === 'master-testimonials' ? normalizeTestimonialsMaster(content) : content;
}

function mergeHeroForPublic(
  breadcrumbOnly: (typeof aimaDefaults)['hero'],
  masterHero: (typeof aimaMasterDefaults)['hero']
): Record<string, unknown> {
  const slides = masterHero?.items?.filter((s) => s.enabled) ?? masterHero?.items ?? [];
  const slide = slides[0] ?? masterHero?.items?.[0];
  if (!slide) return { ...breadcrumbOnly } as Record<string, unknown>;
  return {
    title: slide.title,
    subtitle: slide.subtitle,
    image: slide.image,
    imagePosition: slide.imagePosition,
    mobileImagePosition: slide.mobileImagePosition,
    primaryText: slide.primaryText,
    primaryHref: slide.primaryHref,
    secondaryText: slide.secondaryText,
    secondaryHref: slide.secondaryHref,
    breadcrumb: breadcrumbOnly.breadcrumb,
  };
}

function assertKnown(key: string) {
  if (!(key in aimaDocuments)) {
    throw new HttpError(404, 'AIMA_SECTION_NOT_FOUND', `Unknown AIMA PGDM page section: ${key}`);
  }
}

function lineCellRequired(key: string, documentKey: string, parent: string): boolean {
  if (documentKey === 'course-modules' && parent === 'year2Rows') {
    return key === 'label' || /^paper[1-5]$/.test(key);
  }
  if (documentKey === 'course-modules' && parent === 'year1Rows') {
    return key === 'left' || key === 'right';
  }
  return false;
}

function contentSchema(value: unknown, key = '', parent = '', documentKey = ''): z.ZodType {
  if (Array.isArray(value)) return z.array(contentSchema(value[0], '', key, documentKey)).max(100);
  if (typeof value === 'boolean') return z.boolean();
  if (typeof value === 'number') return z.number().finite().min(0).max(20000);
  if (value && typeof value === 'object') {
    return z
      .object({ ...Object.fromEntries(Object.entries(value).map(([k, v]) => [k, contentSchema(v, k, key, documentKey)])), ...(parent === 'items' && documentKey === 'master-internships' ? { pages: z.array(z.string().max(200)).max(8).optional(), videoLink: z.string().max(2048).default('') } : {}) })
      .strict();
  }
  let result: z.ZodType = z.string().max(30000);
  if (/href|src|icon$/i.test(key)) {
    result = z
      .string()
      .max(2048)
      .refine(
        (v) =>
          !v ||
          (/^(\/(?!\/)|#|https:\/\/|http:\/\/|tel:\+?[\d -]+$)/.test(v) && !/[\\\u0000-\u001f]/.test(v)),
        'Use a site path, HTTP(S) URL or telephone link'
      );
  }
  if (key === 'src' || key === 'icon') {
    result = result.refine(
      (v) =>
        typeof v === 'string' &&
        (!v ||
          /^\/(?!\/)/.test(v) ||
          v.startsWith('https://vsmedu.com/wp-content/uploads/') ||
          v.startsWith('https://vsmedu.com/')),
      'Upload an image, use a local image path, or use an existing vsmedu.com upload URL'
    );
  }
  if (key === 'anchor') {
    result = result.refine((v) => typeof v === 'string' && /^[a-z0-9-]+$/.test(v), 'Use lowercase letters, numbers and hyphens only');
  }
  if (documentKey === 'faq') {
    if (parent === 'items' && key === 'question') {
      result = result.refine((v) => typeof v === 'string' && v.trim().length > 0, 'This field is required');
    } else if (parent === '' && ['title', 'eyebrow', 'description', 'buttonText', 'buttonHref'].includes(key)) {
      result = result.refine((v) => typeof v === 'string' && v.trim().length > 0, 'This field is required');
    }
  }
  if (
    ['title', 'year', 'anchor', 'icon'].includes(key) ||
    lineCellRequired(key, documentKey, parent) ||
    (key === 'src' && parent !== 'avatar' && parent !== 'cardIcon')
  ) {
    result = result.refine((v) => typeof v === 'string' && v.trim().length > 0, 'This field is required');
  }
  if (key === 'width' || key === 'height') result = z.number().int().min(1).max(20000);
  if (RICH_TEXT_KEYS.has(key)) result = result.transform((v) => cleanSubtitle(String(v)));
  return result;
}

function validate(key: string, content: unknown) {
  const result = contentSchema(aimaDocuments[key], '', '', key).safeParse(content);
  if (result.success) return result.data;
  throw new z.ZodError(result.error.issues.map((issue) => ({ ...issue, path: [key, ...issue.path] })));
}

async function findRow(client: Client, key: string) {
  return client.websiteSetting.findUnique({ where: { key: `${DB_PREFIX}${key}` } });
}

async function loadRows() {
  const rows = await prisma.websiteSetting.findMany({
    where: { key: { startsWith: DB_PREFIX } },
  });
  const map = new Map<string, (typeof rows)[number]>();
  for (const row of rows) map.set(row.key.slice(DB_PREFIX.length), row);
  return map;
}

export async function readAimaDocument(key: string) {
  assertKnown(key);
  const row = await findRow(prisma, key);
  return { content: normalizeDocument(key, row?.value ?? aimaDocuments[key]), updatedAt: row?.updatedAt.toISOString() ?? null };
}

export async function readAima() {
  const rows = await loadRows();
  const sections = structuredClone(aimaDefaults) as Record<string, unknown>;
  const masters = structuredClone(aimaMasterDefaults);
  for (const [key, row] of rows) {
    if (key.startsWith('master-') && key.slice(7) in masters) {
      Object.assign(masters, { [key.slice(7) as AimaMasterKey]: normalizeDocument(key, row.value) });
    } else if (key in sections) {
      Object.assign(sections, { [key as AimaKey]: row.value });
    }
  }
  sections.hero = mergeHeroForPublic(
    sections.hero as (typeof aimaDefaults)['hero'],
    masters.hero as (typeof aimaMasterDefaults)['hero']
  );
  return { sections: sections as typeof aimaDefaults, masters };
}

export async function readAimaAllAdmin() {
  const rows = await loadRows();
  const result: Record<string, { content: unknown; updatedAt: string | null }> = {};
  for (const [key, defaultValue] of Object.entries(aimaDocuments)) {
    const row = rows.get(key);
    result[key] = { content: normalizeDocument(key, row?.value ?? defaultValue), updatedAt: row?.updatedAt.toISOString() ?? null };
  }
  return result;
}

async function write(
  tx: Prisma.TransactionClient,
  key: string,
  content: unknown,
  updatedAt: string | null,
  action: string,
  actorId: number,
  requestId?: string
) {
  const conflict = () => new HttpError(409, 'CONTENT_CONFLICT', `"${key}" was updated elsewhere. Reload before saving.`);
  const old = await findRow(tx, key);
  if ((old?.updatedAt.toISOString() ?? null) !== updatedAt) throw conflict();
  const value = content as Prisma.InputJsonValue;

  if (old?.key === `${DB_PREFIX}${key}`) {
    const row = await tx.websiteSetting.updateMany({
      where: { id: old.id, updatedAt: old.updatedAt },
      data: { value, isPublic: true },
    });
    if (row.count === 0) throw conflict();
  } else {
    await tx.websiteSetting.upsert({
      where: { key: `${DB_PREFIX}${key}` },
      update: { value, isPublic: true },
      create: { key: `${DB_PREFIX}${key}`, value, isPublic: true },
    });
  }

  await tx.auditLog.create({
    data: { actorId, action, entityType: 'academics_aima', entityId: key, requestId },
  });
  const saved = await tx.websiteSetting.findUniqueOrThrow({ where: { key: `${DB_PREFIX}${key}` } });
  return { content: saved.value, updatedAt: saved.updatedAt.toISOString() };
}

export async function updateAimaDocument(key: string, input: unknown, actorId: number, requestId?: string) {
  assertKnown(key);
  const { content, updatedAt } = z
    .object({ content: z.unknown(), updatedAt: z.string().datetime().nullable() })
    .strict()
    .parse(input);
  const validated = validate(key, normalizeDocument(key, content));
  return prisma.$transaction((tx) => write(tx, key, validated, updatedAt, 'academics_aima.update', actorId, requestId));
}

export async function updateAimaBulk(input: unknown, actorId: number, requestId?: string) {
  const { sections } = z
    .object({
      sections: z.record(z.string(), z.object({ content: z.unknown(), updatedAt: z.string().datetime().nullable() }).strict()),
    })
    .strict()
    .parse(input);

  const validated = Object.entries(sections).map(([key, item]) => {
    assertKnown(key);
    return { key, content: validate(key, normalizeDocument(key, item.content)), updatedAt: item.updatedAt };
  });

  return prisma.$transaction(async (tx) => {
    const updated: Record<string, { content: unknown; updatedAt: string }> = {};
    for (const { key, content, updatedAt } of validated) {
      updated[key] = await write(tx, key, content, updatedAt, 'academics_aima.bulk_update', actorId, requestId);
    }
    return updated;
  });
}
