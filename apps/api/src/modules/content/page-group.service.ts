import { Prisma } from '@prisma/client';
import { z } from 'zod';
import { prisma } from '../../lib/prisma.js';
import { HttpError } from '../../middleware/errors.js';
import { cleanSubtitle } from './home.service.js';

type Doc = { content: unknown; updatedAt: string | null };
type PageDefinition = { path: string; sections: Record<string, unknown>; masters: Record<string, { items: unknown[] }> };

export type PageGroupOptions = {
  /** DB key prefix and audit entity type, e.g. `events` → `events.<page>.<section>`. */
  group: string;
  /** Human label used in error messages, e.g. `Events`. */
  label: string;
  pages: Record<string, PageDefinition>;
  richTextKeys: string[];
  requiredKeys: string[];
  /** Item fields that must be non-empty, per master document (e.g. `{ 'master-speakers': ['name'] }`). */
  requiredItemKeys?: Record<string, string[]>;
};

/**
 * Page-wise CMS storage for a group of website pages. Each page's sections and masters are stored
 * as separate `website_setting` rows, validated against the page's own defaults.
 */
export function createPageGroupService(options: PageGroupOptions) {
  const { group, label } = options;
  const code = group.toUpperCase().replace(/[^A-Z0-9]+/g, '_');
  const richText = new Set(options.richTextKeys);
  const required = new Set(options.requiredKeys);

  function page(slug: string) {
    if (!Object.prototype.hasOwnProperty.call(options.pages, slug)) {
      throw new HttpError(404, `${code}_PAGE_NOT_FOUND`, `Unknown ${label} page: ${slug}`);
    }
    return options.pages[slug]!;
  }

  function documents(slug: string): Record<string, unknown> {
    const p = page(slug);
    return {
      ...p.sections,
      ...Object.fromEntries(Object.entries(p.masters).map(([key, value]) => [`master-${key}`, value])),
    };
  }

  // Preserve saved values while exposing newly added default fields to older CMS records.
  function withDefaults(defaultValue: unknown, savedValue: unknown): unknown {
    if (
      defaultValue && savedValue &&
      typeof defaultValue === 'object' && !Array.isArray(defaultValue) &&
      typeof savedValue === 'object' && !Array.isArray(savedValue)
    ) {
      const defaults = defaultValue as Record<string, unknown>;
      const saved = savedValue as Record<string, unknown>;
      return Object.fromEntries(Object.keys({ ...defaults, ...saved }).map((key) => [
        key,
        key in saved ? withDefaults(defaults[key], saved[key]) : defaults[key],
      ]));
    }
    return savedValue;
  }

  const prefix = (slug: string) => `${group}.${slug}.`;

  function assertKnown(slug: string, key: string) {
    if (!(key in documents(slug))) throw new HttpError(404, `${code}_SECTION_NOT_FOUND`, `Unknown section "${key}" on ${label} page ${slug}`);
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
    if (/href$|url$|^src$/i.test(key)) {
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
    const isMasterItem = documentKey.startsWith('master-') && parent === 'items';
    const itemRequired = isMasterItem && (options.requiredItemKeys?.[documentKey] ?? []).includes(key);
    const altRequired = key === 'alt' && documentKey.startsWith('master-') && documentKey !== 'master-hero';
    if (required.has(key) || key === 'src' || itemRequired || altRequired) {
      result = result.refine((v) => typeof v === 'string' && v.trim().length > 0, 'This field is required');
    }
    if (key === 'width' || key === 'height') return z.number().int().min(1).max(20000);
    if (richText.has(key)) result = result.transform((v) => cleanSubtitle(String(v)));
    return result;
  }

  function validate(slug: string, key: string, content: unknown) {
    const result = contentSchema(documents(slug)[key], key).safeParse(content);
    if (result.success) return result.data;
    throw new z.ZodError(result.error.issues.map((issue) => ({ ...issue, path: [key, ...issue.path] })));
  }

  async function readList(slug: string) {
    const defaults = documents(slug);
    const rows = await prisma.websiteSetting.findMany({ where: { key: { startsWith: prefix(slug) } } });
    const byKey = new Map(rows.map((row) => [row.key.slice(prefix(slug).length), row]));
    const result: Record<string, Doc> = {};
    for (const [key, value] of Object.entries(defaults)) {
      const row = byKey.get(key);
      result[key] = { content: row ? withDefaults(value, row.value) : value, updatedAt: row?.updatedAt.toISOString() ?? null };
    }
    return result;
  }

  async function readDocument(slug: string, key: string): Promise<Doc> {
    assertKnown(slug, key);
    const row = await prisma.websiteSetting.findUnique({ where: { key: `${prefix(slug)}${key}` } });
    const defaults = documents(slug)[key];
    return { content: row ? withDefaults(defaults, row.value) : defaults, updatedAt: row?.updatedAt.toISOString() ?? null };
  }

  /** Public payload: sections plus masters (enabled items only), first enabled banner slide merged into `hero`. */
  async function readPublic(slug: string) {
    const list = await readList(slug);
    if (list.faq) {
      const faqRow = await prisma.websiteSetting.findUnique({ where: { key: `${prefix(slug)}faq` } });
      if (!faqRow) {
        const faq = list.faq.content as Record<string, unknown>;
        list.faq = { ...list.faq, content: { ...faq, items: [] } };
      }
    }
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
    await tx.auditLog.create({ data: { actorId, action, entityType: group, entityId: `${slug}.${key}`, requestId } });
    const saved = await tx.websiteSetting.findUniqueOrThrow({ where: { key: dbKey } });
    return { content: saved.value, updatedAt: saved.updatedAt.toISOString() };
  }

  const DocInput = z.object({ content: z.unknown(), updatedAt: z.string().datetime().nullable() }).strict();

  async function updateDocument(slug: string, key: string, input: unknown, actorId: number, requestId?: string) {
    assertKnown(slug, key);
    const { content, updatedAt } = DocInput.parse(input);
    const validated = validate(slug, key, content);
    return prisma.$transaction((tx) => write(tx, slug, key, validated, updatedAt, `${group}.update`, actorId, requestId));
  }

  async function updateBulk(slug: string, input: unknown, actorId: number, requestId?: string) {
    page(slug);
    const { sections } = z.object({ sections: z.record(z.string(), DocInput) }).strict().parse(input);
    const validated = Object.entries(sections).map(([key, item]) => {
      assertKnown(slug, key);
      return { key, content: validate(slug, key, item.content), updatedAt: item.updatedAt };
    });
    return prisma.$transaction(async (tx) => {
      const updated: Record<string, { content: unknown; updatedAt: string }> = {};
      for (const { key, content, updatedAt } of validated) {
        updated[key] = await write(tx, slug, key, content, updatedAt, `${group}.bulk_update`, actorId, requestId);
      }
      return updated;
    });
  }

  return { readList, readDocument, readPublic, updateDocument, updateBulk };
}
