import { Prisma } from '@prisma/client';
import { z } from 'zod';
import {
  academicsSpecialisationDefaults,
  academicsSpecialisationMasterDefaults,
  type SpecPageDefaults,
} from '@vsmedu/contracts/academics-specialisations';
import { prisma } from '../../lib/prisma.js';
import { HttpError } from '../../middleware/errors.js';
import { cleanSubtitle } from './home.service.js';
import { normalizeVideoLink } from './video-link.js';

type Client = Prisma.TransactionClient | typeof prisma;

const DB_PREFIX = 'academics-specs.';

type SpecSlug = keyof typeof academicsSpecialisationDefaults;

function allSlugs(): SpecSlug[] {
  return Object.keys(academicsSpecialisationDefaults) as SpecSlug[];
}

/** Every persisted document key: `${slug}.${section}` or `master-${slug}.hero` */
export const specDocuments: Record<string, unknown> = (() => {
  const out: Record<string, unknown> = {};
  for (const slug of allSlugs()) {
    const page = academicsSpecialisationDefaults[slug] as SpecPageDefaults;
    out[`${slug}.meta`] = page.meta;
    out[`${slug}.hero`] = page.hero;
    out[`${slug}.tabs`] = page.tabs;
    out[`${slug}.glance`] = page.glance;
    out[`${slug}.overview`] = page.overview;
    out[`${slug}.why`] = page.why;
    out[`${slug}.careers`] = page.careers;
    out[`${slug}.curriculum`] = page.curriculum;
    out[`${slug}.admission`] = page.admission;
    out[`${slug}.faq`] = page.faq;
    out[`${slug}.internships`] = page.internships;
    out[`${slug}.testimonials`] = page.testimonials;
    const masterHero = academicsSpecialisationMasterDefaults[slug as keyof typeof academicsSpecialisationMasterDefaults];
    if (!masterHero) {
      throw new Error(`Missing specialisation master defaults for slug: ${slug}`);
    }
    out[`master-${slug}.hero`] = masterHero.hero;
    out[`master-${slug}.internships`] = masterHero.internships;
    out[`master-${slug}.testimonials`] = masterHero.testimonials;
  }
  return out;
})();

const RICH_TEXT_KEYS = new Set(['subtitle', 'body', 'intro', 'description', 'answer']);

function normalizeDocument(key: string, content: unknown): unknown {
  if (!key.endsWith('.testimonials')) return content;
  if (!content || typeof content !== 'object' || Array.isArray(content)) return content;
  const doc = content as { items?: unknown[] };
  if (!Array.isArray(doc.items)) return content;
  return { ...doc, items: doc.items.map((raw) => {
    if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return raw;
    const item = raw as Record<string, unknown>;
    return { ...item, videoLink: normalizeVideoLink(item.videoLink) };
  }) };
}

function mergeHeroForPublic(meta: SpecPageDefaults['meta'], breadcrumbOnly: SpecPageDefaults['hero'], masterHero: { items: unknown[] }): Record<string, unknown> {
  const items = (masterHero?.items ?? []) as { enabled?: boolean }[];
  const slides = items.filter((s) => s.enabled) ?? items;
  const slide = slides[0] ?? items[0];
  if (!slide) return { ...breadcrumbOnly } as Record<string, unknown>;
  return {
    ...(slide as Record<string, unknown>),
    breadcrumb: breadcrumbOnly.breadcrumb,
    meta,
  };
}

function assertKnown(key: string) {
  if (!(key in specDocuments)) {
    throw new HttpError(404, 'SPECS_SECTION_NOT_FOUND', `Unknown specialisation CMS document: ${key}`);
  }
}

function contentSchema(value: unknown, key = '', parent = '', documentKey = ''): z.ZodType {
  const section = documentKey.includes('.') ? documentKey.split('.', 2)[1]! : '';
  if (Array.isArray(value)) return z.array(contentSchema(value[0], '', key, documentKey)).max(100);
  if (typeof value === 'boolean') return z.boolean();
  if (typeof value === 'number') return z.number().finite().min(0).max(20000);
  if (value && typeof value === 'object') {
    return z
      .object(Object.fromEntries(Object.entries(value).map(([k, v]) => [k, contentSchema(v, k, key, documentKey)])))
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

  if (documentKey.endsWith('.faq')) {
    if (parent === 'items' && key === 'question') {
      result = result.refine((v) => typeof v === 'string' && v.trim().length > 0, 'This field is required');
    } else if (parent === '' && ['title', 'eyebrow', 'description', 'buttonText', 'buttonHref'].includes(key)) {
      result = result.refine((v) => typeof v === 'string' && v.trim().length > 0, 'This field is required');
    }
  }

  if (section === 'meta' && parent === '' && ['slug', 'navTitle', 'pageTitle', 'heroTitle'].includes(key)) {
    result = result.refine((v) => typeof v === 'string' && v.trim().length > 0, 'This field is required');
  }
  if (section === 'meta' && parent === 'cardIcon' && key === 'src') {
    result = result.refine((v) => typeof v === 'string' && v.trim().length > 0, 'This field is required');
  }

  if (
    ['title', 'year', 'anchor', 'icon'].includes(key) ||
    (key === 'src' && parent !== 'avatar' && parent !== 'cardIcon')
  ) {
    result = result.refine((v) => typeof v === 'string' && v.trim().length > 0, 'This field is required');
  }
  if (key === 'width' || key === 'height') result = z.number().int().min(1).max(20000);
  if (RICH_TEXT_KEYS.has(key)) result = result.transform((v) => cleanSubtitle(String(v)));
  return result;
}

function validate(key: string, content: unknown) {
  const result = contentSchema(specDocuments[key], '', '', key).safeParse(content);
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

/** Admin: all spec documents (flat keys). */
export async function readSpecialisationsAllAdmin() {
  const rows = await loadRows();
  const result: Record<string, { content: unknown; updatedAt: string | null }> = {};
  for (const [key, defaultValue] of Object.entries(specDocuments)) {
    const row = rows.get(key);
    result[key] = { content: normalizeDocument(key, row?.value ?? defaultValue), updatedAt: row?.updatedAt.toISOString() ?? null };
  }
  return result;
}

/** Admin: one page slug — only documents for that slug (and its master-hero). */
export async function readSpecialisationAdmin(slug: string) {
  if (!allSlugs().includes(slug as SpecSlug)) {
    throw new HttpError(404, 'SPECS_SLUG_NOT_FOUND', `Unknown specialisation slug: ${slug}`);
  }
  const rows = await loadRows();
  const prefix = `${slug}.`;
  const masterPrefix = `master-${slug}.`;
  const result: Record<string, { content: unknown; updatedAt: string | null }> = {};
  for (const [key, defaultValue] of Object.entries(specDocuments)) {
    if (!key.startsWith(prefix) && !key.startsWith(masterPrefix)) continue;
    const row = rows.get(key);
    result[key] = { content: normalizeDocument(key, row?.value ?? defaultValue), updatedAt: row?.updatedAt.toISOString() ?? null };
  }
  return result;
}

/** Admin: one composite key e.g. `financial-management-specialisation.overview` */
export async function readSpecialisationDocument(key: string) {
  assertKnown(key);
  const row = await findRow(prisma, key);
  return { content: normalizeDocument(key, row?.value ?? specDocuments[key]), updatedAt: row?.updatedAt.toISOString() ?? null };
}

/** Grouped payload for one slug (optional future public API). */
export async function readSpecialisationPage(slug: string) {
  if (!allSlugs().includes(slug as SpecSlug)) {
    throw new HttpError(404, 'SPECS_SLUG_NOT_FOUND', `Unknown specialisation slug: ${slug}`);
  }
  const rows = await loadRows();
  const pick = (suffix: string) => rows.get(`${slug}.${suffix}`)?.value ?? specDocuments[`${slug}.${suffix}`];
  const masterHero = (rows.get(`master-${slug}.hero`)?.value ??
    specDocuments[`master-${slug}.hero`]) as { items: unknown[] };
  const internships = (rows.get(`master-${slug}.internships`)?.value ??
    specDocuments[`master-${slug}.internships`]) as { items: unknown[] };
  const testimonials = normalizeDocument(
    `master-${slug}.testimonials`,
    rows.get(`master-${slug}.testimonials`)?.value ?? specDocuments[`master-${slug}.testimonials`]
  ) as { items: unknown[] };
  const meta = pick('meta') as SpecPageDefaults['meta'];
  const heroBreadcrumb = pick('hero') as SpecPageDefaults['hero'];
  const mergedHero = mergeHeroForPublic(meta, heroBreadcrumb, masterHero);
  return {
    slug,
    meta,
    hero: mergedHero,
    tabs: pick('tabs'),
    glance: pick('glance'),
    overview: pick('overview'),
    why: pick('why'),
    careers: pick('careers'),
    curriculum: pick('curriculum'),
    admission: pick('admission'),
    faq: pick('faq'),
    internships: {
      ...(pick('internships') as { title: string }),
      items: internships.items,
    },
    testimonials: {
      ...(pick('testimonials') as { title: string; eyebrow: string }),
      items: testimonials.items,
    },
  };
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
    data: { actorId, action, entityType: 'academics_specs', entityId: key, requestId },
  });
  const saved = await tx.websiteSetting.findUniqueOrThrow({ where: { key: `${DB_PREFIX}${key}` } });
  return { content: saved.value, updatedAt: saved.updatedAt.toISOString() };
}

export async function updateSpecialisationDocument(key: string, input: unknown, actorId: number, requestId?: string) {
  assertKnown(key);
  const { content, updatedAt } = z
    .object({ content: z.unknown(), updatedAt: z.string().datetime().nullable() })
    .strict()
    .parse(input);
  const validated = validate(key, normalizeDocument(key, content));
  return prisma.$transaction((tx) =>
    write(tx, key, validated, updatedAt, 'academics_specs.update', actorId, requestId)
  );
}

export async function updateSpecialisationsBulk(input: unknown, actorId: number, requestId?: string) {
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
      updated[key] = await write(tx, key, content, updatedAt, 'academics_specs.bulk_update', actorId, requestId);
    }
    return updated;
  });
}
