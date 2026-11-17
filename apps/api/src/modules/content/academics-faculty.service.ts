import { Prisma } from '@prisma/client';
import { z } from 'zod';
import {
  facultyMasterDefaults,
  facultyPageDefaults,
  type FacultyMasterKey,
  type FacultyPageKey,
} from '@vsmedu/contracts/academics-faculty';
import { prisma } from '../../lib/prisma.js';
import { HttpError } from '../../middleware/errors.js';
import { cleanSubtitle } from './home.service.js';
import { academicTemplateSection, academicTemplateItem } from '@vsmedu/contracts/academics';

type Client = Prisma.TransactionClient | typeof prisma;

const DB_PREFIX = 'academics-faculty.';

export const facultyDocuments: Record<string, unknown> = {
  ...Object.fromEntries(Object.entries(facultyPageDefaults).map(([key, value]) => [key, value])),
  ...Object.fromEntries(Object.entries(facultyMasterDefaults).map(([key, value]) => [`master-${key}`, value])),
};

const RICH_TEXT_KEYS = new Set(['subtitle', 'body', 'description']);

function mergeHeroForPublic(
  section: (typeof facultyPageDefaults)['hero'],
  masterHero: (typeof facultyMasterDefaults)['hero']
): Record<string, unknown> {
  const slides = masterHero?.items?.filter((s) => s.enabled) ?? masterHero?.items ?? [];
  const slide = slides[0] ?? masterHero?.items?.[0];
  if (!slide) return { ...section } as Record<string, unknown>;
  return {
    title: slide.title,
    subtitle: slide.subtitle,
    image: slide.image,
    imagePosition: slide.imagePosition,
    mobileImagePosition: slide.mobileImagePosition,
    breadcrumb: section.breadcrumb,
    linkText: section.linkText,
    linkHref: section.linkHref,
  };
}

function assertKnown(key: string) {
  if (!(key in facultyDocuments)) {
    throw new HttpError(404, 'FACULTY_SECTION_NOT_FOUND', `Unknown Faculty page section: ${key}`);
  }
}

function contentSchema(value: unknown, key = '', parent = '', documentKey = ''): z.ZodType {
  if (documentKey === 'templateSections' && key === 'sections' && Array.isArray(value)) return z.array(contentSchema(academicTemplateSection, '', key, documentKey)).max(100);
  if (documentKey === 'templateSections' && key === 'items' && Array.isArray(value)) return z.array(contentSchema(academicTemplateItem, '', key, documentKey)).max(100);
  if (Array.isArray(value)) return z.array(contentSchema(value[0], '', key, documentKey)).max(100);
  if (typeof value === 'boolean') return z.boolean();
  if (typeof value === 'number') return z.number().finite().min(0).max(20000);
  if (value && typeof value === 'object') {
    return z
      .object(Object.fromEntries(Object.entries(value).map(([k, v]) => [k, contentSchema(v, k, key || parent, documentKey)])))
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
  if (key === 'src') {
    result = result.refine(
      (v) =>
        typeof v === 'string' &&
        (!v || /^\/(?!\/)/.test(v) || v.startsWith('https://vsmedu.com/')),
      'Upload an image, use a local image path, or use an existing vsmedu.com upload URL'
    );
  }
  if (key === 'anchor') {
    result = result.refine((v) => typeof v === 'string' && /^[a-z0-9-]+$/.test(v), 'Use lowercase letters, numbers and hyphens only');
  }
  const profileRequired = documentKey === 'master-profiles' && parent === 'items' && ['name', 'expertise'].includes(key);
  if (['title', 'anchor', 'label'].includes(key) || profileRequired || key === 'src') {
    result = result.refine((v) => typeof v === 'string' && v.trim().length > 0, 'This field is required');
  }
  if (key === 'width' || key === 'height') result = z.number().int().min(1).max(20000);
  if (RICH_TEXT_KEYS.has(key)) result = result.transform((v) => cleanSubtitle(String(v)));
  return result;
}

function validate(key: string, content: unknown) {
  const result = contentSchema(facultyDocuments[key], '', '', key).safeParse(content);
  if (result.success) return result.data;
  throw new z.ZodError(result.error.issues.map((issue) => ({ ...issue, path: [key, ...issue.path] })));
}

async function findRow(client: Client, key: string) {
  return client.websiteSetting.findUnique({ where: { key: `${DB_PREFIX}${key}` } });
}

async function loadRows(publicOnly: boolean) {
  const rows = await prisma.websiteSetting.findMany({
    where: { key: { startsWith: DB_PREFIX }, ...(publicOnly ? { isPublic: true } : {}) },
  });
  const map = new Map<string, (typeof rows)[number]>();
  for (const row of rows) map.set(row.key.slice(DB_PREFIX.length), row);
  return map;
}

export async function readFacultyDocument(key: string) {
  assertKnown(key);
  const row = await findRow(prisma, key);
  return { content: row?.value ?? facultyDocuments[key], updatedAt: row?.updatedAt.toISOString() ?? null };
}

/** Public payload: sections + masters; disabled profiles are filtered out. */
export async function readFacultyPage() {
  const stored = await prisma.websiteSetting.findMany({ where: { key: { startsWith: DB_PREFIX }, isPublic: true } });
  const rows = new Map(stored.map(row => [row.key.slice(DB_PREFIX.length), row]));
  const sections = structuredClone(facultyPageDefaults) as Record<string, unknown>;
  const masters = structuredClone(facultyMasterDefaults);
  for (const [key, row] of rows) {
    if (key.startsWith('master-') && key.slice(7) in masters) {
      Object.assign(masters, { [key.slice(7) as FacultyMasterKey]: row.value });
    } else if (key in sections) {
      Object.assign(sections, { [key as FacultyPageKey]: row.value });
    }
  }
  sections.hero = mergeHeroForPublic(sections.hero as (typeof facultyPageDefaults)['hero'], masters.hero);
  const profiles = masters.profiles.items.filter((profile) => profile.enabled !== false);
  return { sections: sections as typeof facultyPageDefaults, masters: { hero: masters.hero, profiles: { items: profiles } } };
}

export async function readFacultyAllAdmin() {
  const rows = await loadRows(false);
  const result: Record<string, { content: unknown; updatedAt: string | null }> = {};
  for (const [key, defaultValue] of Object.entries(facultyDocuments)) {
    const row = rows.get(key);
    result[key] = { content: row?.value ?? defaultValue, updatedAt: row?.updatedAt.toISOString() ?? null };
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

  if (old) {
    const row = await tx.websiteSetting.updateMany({
      where: { id: old.id, updatedAt: old.updatedAt },
      data: { value, isPublic: true },
    });
    if (row.count === 0) throw conflict();
  } else {
    await tx.websiteSetting.create({ data: { key: `${DB_PREFIX}${key}`, value, isPublic: true } });
  }

  await tx.auditLog.create({
    data: { actorId, action, entityType: 'academics_faculty', entityId: key, requestId },
  });
  const saved = await tx.websiteSetting.findUniqueOrThrow({ where: { key: `${DB_PREFIX}${key}` } });
  return { content: saved.value, updatedAt: saved.updatedAt.toISOString() };
}

export async function updateFacultyDocument(key: string, input: unknown, actorId: number, requestId?: string) {
  assertKnown(key);
  const { content, updatedAt } = z
    .object({ content: z.unknown(), updatedAt: z.string().datetime().nullable() })
    .strict()
    .parse(input);
  const validated = validate(key, content);
  return prisma.$transaction((tx) => write(tx, key, validated, updatedAt, 'academics_faculty.update', actorId, requestId));
}

export async function updateFacultyBulk(input: unknown, actorId: number, requestId?: string) {
  const { sections } = z
    .object({
      sections: z.record(z.string(), z.object({ content: z.unknown(), updatedAt: z.string().datetime().nullable() }).strict()),
    })
    .strict()
    .parse(input);

  const validated = Object.entries(sections).map(([key, item]) => {
    assertKnown(key);
    return { key, content: validate(key, item.content), updatedAt: item.updatedAt };
  });

  return prisma.$transaction(async (tx) => {
    const updated: Record<string, { content: unknown; updatedAt: string }> = {};
    for (const { key, content, updatedAt } of validated) {
      updated[key] = await write(tx, key, content, updatedAt, 'academics_faculty.bulk_update', actorId, requestId);
    }
    return updated;
  });
}
