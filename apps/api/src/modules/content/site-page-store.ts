import type { RequestHandler } from 'express';
import { Prisma } from '@prisma/client';
import { z } from 'zod';
import type { SitePageDefinition } from '@vsmedu/contracts/site-pages';
import { prisma } from '../../lib/prisma.js';
import { HttpError } from '../../middleware/errors.js';
import { cleanSubtitle } from './home.service.js';

type Doc = { content: unknown; updatedAt: string | null };

const DEFAULT_REQUIRED = ['title', 'name', 'label', 'question'];
const DocInput = z.object({ content: z.unknown(), updatedAt: z.string().datetime().nullable() }).strict();

/**
 * Page-wise CMS store: every page of `registry` is stored independently under `<group>.<page>.<section>`,
 * masters under `<group>.<page>.master-<key>`.
 */
export function createSitePageStore(options: {
  group: string;
  label: string;
  registry: Record<string, SitePageDefinition>;
  richKeys: string[];
  requiredKeys?: string[];
}) {
  const { group, label, registry } = options;
  const richKeys = new Set(options.richKeys);
  const requiredKeys = new Set([...DEFAULT_REQUIRED, ...(options.requiredKeys ?? [])]);
  const prefix = (slug: string) => `${group}.${slug}.`;

  function page(slug: string) {
    if (!Object.hasOwn(registry, slug)) throw new HttpError(404, 'PAGE_NOT_FOUND', `Unknown ${label} page: ${slug}`);
    return registry[slug]!;
  }

  function documents(slug: string): Record<string, unknown> {
    const p = page(slug);
    return { ...p.sections, ...Object.fromEntries(Object.entries(p.masters).map(([key, value]) => [`master-${key}`, value])) };
  }

  function assertKnown(slug: string, key: string) {
    if (!Object.hasOwn(documents(slug), key)) throw new HttpError(404, 'SECTION_NOT_FOUND', `Unknown section "${key}" on ${label} page ${slug}`);
  }

  function schemaTemplate(slug: string, key: string) {
    const itemTemplate = page(slug).itemTemplates?.[key];
    return itemTemplate ? { items: [itemTemplate] } : documents(slug)[key];
  }

  function contentSchema(value: unknown, key = '', parent = ''): z.ZodType {
    if (Array.isArray(value)) return z.array(contentSchema(value[0] ?? '', '', key)).max(200);
    if (typeof value === 'boolean') return z.boolean();
    if (typeof value === 'number') {
      if (key === 'width' || key === 'height') return z.number().int().min(1).max(20000);
      return z.number().finite().min(0).max(20000);
    }
    if (value && typeof value === 'object') {
      return z.object({ ...Object.fromEntries(Object.entries(value).map(([k, v]) => [k, contentSchema(v, k, key)])), ...(parent === 'profiles' ? { enabled: z.boolean().optional() } : {}) }).strict();
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
        (v) => typeof v === 'string' && (!v.trim() || /^\/(?!\/)/.test(v) || v.startsWith('https://vsmedu.com/')),
        'Upload an image, or use a local image path or an existing vsmedu.com upload'
      );
    }
    if (requiredKeys.has(key) || key === 'src' || (key === 'text' && parent === 'cards')) {
      const message = key === 'src' ? 'An image is required — upload one before saving' : 'This field is required';
      result = result.refine((v) => typeof v === 'string' && v.trim().length > 0, message);
    }
    if (richKeys.has(key)) result = result.transform((v) => cleanSubtitle(String(v)));
    return result;
  }

  function validate(slug: string, key: string, content: unknown) {
    const result = contentSchema(schemaTemplate(slug, key)).safeParse(content);
    if (result.success) return result.data;
    throw new z.ZodError(result.error.issues.map((issue) => ({ ...issue, path: [key, ...issue.path] })));
  }

  async function list(slug: string) {
    const defaults = documents(slug);
    const rows = await prisma.websiteSetting.findMany({ where: { key: { startsWith: prefix(slug) } } });
    const byKey = new Map(rows.map((row) => [row.key.slice(prefix(slug).length), row]));
    const result: Record<string, Doc> = {};
    for (const [key, value] of Object.entries(defaults)) {
      const row = byKey.get(key);
      result[key] = { content: row?.value ?? value, updatedAt: row?.updatedAt.toISOString() ?? null };
    }
    return result;
  }

  async function read(slug: string, key: string): Promise<Doc> {
    assertKnown(slug, key);
    const row = await prisma.websiteSetting.findUnique({ where: { key: `${prefix(slug)}${key}` } });
    return { content: row?.value ?? documents(slug)[key], updatedAt: row?.updatedAt.toISOString() ?? null };
  }

  /** Public payload: sections plus enabled master items; the first enabled banner slide is merged into `hero`. */
  async function readPublic(slug: string) {
    const docs = await list(slug);
    const sections: Record<string, unknown> = {};
    const masters: Record<string, unknown> = {};
    for (const [key, doc] of Object.entries(docs)) {
      if (!key.startsWith('master-')) {
        sections[key] = doc.content;
        continue;
      }
      const items = ((doc.content as { items?: { enabled?: boolean }[] }).items ?? []).filter((item) => item.enabled !== false);
      masters[key.slice(7)] = { ...(doc.content as object), items };
    }
    const slide = (masters.hero as { items: object[] } | undefined)?.items[0];
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

  async function update(slug: string, key: string, input: unknown, actorId: number, requestId?: string) {
    assertKnown(slug, key);
    const { content, updatedAt } = DocInput.parse(input);
    const validated = validate(slug, key, content);
    return prisma.$transaction((tx) => write(tx, slug, key, validated, updatedAt, `${group}.update`, actorId, requestId));
  }

  async function bulk(slug: string, input: unknown, actorId: number, requestId?: string) {
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

  async function seed() {
    let created = 0;
    for (const slug of Object.keys(registry)) {
      for (const [key, value] of Object.entries(documents(slug))) {
        const dbKey = `${prefix(slug)}${key}`;
        if (await prisma.websiteSetting.findUnique({ where: { key: dbKey } })) continue;
        await prisma.websiteSetting.create({ data: { key: dbKey, value: value as Prisma.InputJsonValue, isPublic: true } });
        created++;
      }
    }
    return created;
  }

  const slugOf = (req: Parameters<RequestHandler>[0]) => String(req.params.page);
  const noStore = (res: Parameters<RequestHandler>[1]) => res.setHeader('Cache-Control', 'no-store');
  const handlers = {
    list: (async (req, res) => {
      noStore(res);
      res.json({ data: await list(slugOf(req)) });
    }) as RequestHandler,
    bulk: (async (req, res) => {
      res.json({ data: await bulk(slugOf(req), req.body, req.auth!.userId, req.requestId) });
    }) as RequestHandler,
    readMaster: (async (req, res) => {
      noStore(res);
      res.json({ data: await read(slugOf(req), `master-${String(req.params.masterKey)}`) });
    }) as RequestHandler,
    saveMaster: (async (req, res) => {
      res.json({ data: await update(slugOf(req), `master-${String(req.params.masterKey)}`, req.body, req.auth!.userId, req.requestId) });
    }) as RequestHandler,
    read: (async (req, res) => {
      noStore(res);
      res.json({ data: await read(slugOf(req), String(req.params.key)) });
    }) as RequestHandler,
    save: (async (req, res) => {
      res.json({ data: await update(slugOf(req), String(req.params.key), req.body, req.auth!.userId, req.requestId) });
    }) as RequestHandler,
    publicPage: (async (req, res) => {
      noStore(res);
      res.json({ data: await readPublic(slugOf(req)) });
    }) as RequestHandler,
  };

  return { list, read, readPublic, update, bulk, seed, handlers };
}
