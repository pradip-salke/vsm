import { Prisma } from '@prisma/client';
import { z } from 'zod';
import { placementsPages, type PlacementsPageSlug } from '@vsmedu/contracts/placements';
import { prisma } from '../../lib/prisma.js';
import { HttpError } from '../../middleware/errors.js';
import { cleanSubtitle } from './home.service.js';

type Doc = { content: unknown; updatedAt: string | null };

const RICH_TEXT_KEYS = new Set(['subtitle', 'body']);
const REQUIRED_KEYS = new Set([
  'title',
  'label',
  'value',
  'specialisation',
  'stream',
  'specialisationHeading',
  'percentageHeading',
  'countHeading',
  'streamHeading',
  'averageHeading',
  'highestHeading',
]);

function page(slug: string) {
  if (!(slug in placementsPages)) throw new HttpError(404, 'PLACEMENTS_PAGE_NOT_FOUND', `Unknown Placements page: ${slug}`);
  return placementsPages[slug as PlacementsPageSlug];
}

/** Every stored document of one page: section keys plus `master-<key>`. */
function documents(slug: string): Record<string, unknown> {
  const p = page(slug);
  return {
    ...p.sections,
    ...Object.fromEntries(Object.entries(p.masters).map(([key, value]) => [`master-${key}`, value])),
  };
}

const prefix = (slug: string) => `placements.${slug}.`;

function withoutAlumniCard(slug: string, key: string, content: unknown) {
  if (slug !== 'placements' || key !== 'cards' || !content || typeof content !== 'object' || !('items' in content)) return content;
  const cards = content as { items?: unknown[] };
  if (!Array.isArray(cards.items)) return content;
  return {
    ...cards,
    items: cards.items.filter((item) => {
      if (!item || typeof item !== 'object') return true;
      const card = item as { title?: unknown; href?: unknown };
      return card.href !== '/placements/alumni/' && !(typeof card.title === 'string' && card.title.trim().toLowerCase() === 'alumni');
    }),
  };
}

function assertKnown(slug: string, key: string) {
  if (!(key in documents(slug))) throw new HttpError(404, 'PLACEMENTS_SECTION_NOT_FOUND', `Unknown section "${key}" on Placements page ${slug}`);
}

function contentSchema(value: unknown, documentKey: string, key = '', parent = ''): z.ZodType {
  if (Array.isArray(value)) return z.array(contentSchema(value[0], documentKey, '', key)).max(200);
  if (typeof value === 'boolean') return z.boolean();
  if (typeof value === 'number') return z.number().finite().min(0).max(20000);
  if (value && typeof value === 'object') {
    return z
      .object(Object.fromEntries(Object.entries(value).map(([k, v]) => [k, contentSchema(v, documentKey, k, key || parent)])))
      .strict();
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
  const masterItem = documentKey.startsWith('master-') && parent === 'items';
  const imageAltRequired = masterItem && documentKey !== 'master-hero' && key === 'alt';
  if (REQUIRED_KEYS.has(key) || key === 'src' || imageAltRequired) {
    result = result.refine((v) => typeof v === 'string' && v.trim().length > 0, 'This field is required');
  }
  if (key === 'width' || key === 'height') return z.number().int().min(1).max(20000);
  if (RICH_TEXT_KEYS.has(key)) result = result.transform((v) => cleanSubtitle(String(v)));
  return result;
}

function validate(slug: string, key: string, content: unknown) {
  const result = contentSchema(documents(slug)[key], key).safeParse(content);
  if (result.success) return result.data;
  throw new z.ZodError(result.error.issues.map((issue) => ({ ...issue, path: [key, ...issue.path] })));
}

async function loadRows(slug: string) {
  const rows = await prisma.websiteSetting.findMany({ where: { key: { startsWith: prefix(slug) } } });
  return new Map(rows.map((row) => [row.key.slice(prefix(slug).length), row]));
}

export async function readPlacementsList(slug: string) {
  const defaults = documents(slug);
  const rows = await loadRows(slug);
  const result: Record<string, Doc> = {};
  for (const [key, value] of Object.entries(defaults)) {
    const row = rows.get(key);
    result[key] = { content: withoutAlumniCard(slug, key, row?.value ?? value), updatedAt: row?.updatedAt.toISOString() ?? null };
  }
  return result;
}

export async function readPlacementsDocument(slug: string, key: string): Promise<Doc> {
  assertKnown(slug, key);
  const row = await prisma.websiteSetting.findUnique({ where: { key: `${prefix(slug)}${key}` } });
  return { content: withoutAlumniCard(slug, key, row?.value ?? documents(slug)[key]), updatedAt: row?.updatedAt.toISOString() ?? null };
}

/** Public payload: sections plus masters (enabled items only), with the first enabled banner slide merged into `hero`. */
export async function readPlacementsPublic(slug: string) {
  const list = await readPlacementsList(slug);
  const sections: Record<string, unknown> = {};
  const masters: Record<string, { items: { enabled?: boolean }[] }> = {};
  for (const [key, doc] of Object.entries(list)) {
    if (key.startsWith('master-')) {
      const items = ((doc.content as { items?: { enabled?: boolean }[] })?.items ?? []).filter((item) => item.enabled !== false);
      masters[key.slice(7)] = { items };
    } else {
      sections[key] = doc.content;
    }
  }
  const slide = masters.hero?.items[0];
  if (slide) sections.hero = { ...slide, ...(sections.hero as object) };
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
  await tx.auditLog.create({ data: { actorId, action, entityType: 'placements', entityId: `${slug}.${key}`, requestId } });
  const saved = await tx.websiteSetting.findUniqueOrThrow({ where: { key: dbKey } });
  return { content: saved.value, updatedAt: saved.updatedAt.toISOString() };
}

const DocInput = z.object({ content: z.unknown(), updatedAt: z.string().datetime().nullable() }).strict();

export async function updatePlacementsDocument(slug: string, key: string, input: unknown, actorId: number, requestId?: string) {
  assertKnown(slug, key);
  const { content, updatedAt } = DocInput.parse(input);
  const validated = validate(slug, key, withoutAlumniCard(slug, key, content));
  return prisma.$transaction((tx) => write(tx, slug, key, validated, updatedAt, 'placements.update', actorId, requestId));
}

export async function updatePlacementsBulk(slug: string, input: unknown, actorId: number, requestId?: string) {
  page(slug);
  const { sections } = z.object({ sections: z.record(z.string(), DocInput) }).strict().parse(input);
  const validated = Object.entries(sections).map(([key, item]) => {
    assertKnown(slug, key);
    return { key, content: validate(slug, key, withoutAlumniCard(slug, key, item.content)), updatedAt: item.updatedAt };
  });
  return prisma.$transaction(async (tx) => {
    const updated: Record<string, { content: unknown; updatedAt: string }> = {};
    for (const { key, content, updatedAt } of validated) {
      updated[key] = await write(tx, slug, key, content, updatedAt, 'placements.bulk_update', actorId, requestId);
    }
    return updated;
  });
}
