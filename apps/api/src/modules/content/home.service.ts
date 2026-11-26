import { Prisma } from '@prisma/client';
import { z } from 'zod';
import { homeDefaults, homeMasterDefaults } from '@vsmedu/contracts/home';
import { academicsDefaults, academicsMasterDefaults } from '@vsmedu/contracts/academics';
import { prisma } from '../../lib/prisma.js';
import { HttpError } from '../../middleware/errors.js';
import sanitizeHtml from 'sanitize-html';
import { normalizeVideoLink } from './video-link.js';

function normalizeHero(value: unknown, actions = homeDefaults.hero) {
  const document = value as { items: Record<string, unknown>[] };
  return { items: document.items.map(item => ({ primaryText: actions.primaryText, primaryHref: actions.primaryHref, secondaryText: actions.secondaryText, secondaryHref: actions.secondaryHref, ...item, title: cleanSubtitle(String(item.title ?? '')), subtitle: cleanSubtitle(String(item.subtitle ?? '')) })) };
}

export function cleanSubtitle(value: string) {
  return sanitizeHtml(value, {
    allowedTags: ['p', 'div', 'h2', 'h3', 'h4', 'blockquote', 'br', 'strong', 'b', 'em', 'i', 'u', 's', 'ul', 'ol', 'li', 'a'],
    allowedAttributes: { a: ['href', 'title', 'rel', 'target'], p: ['style'], div: ['style'] },
    allowedStyles: { '*': { 'text-align': [/^(left|center|right|justify)$/] } },
    allowedSchemes: ['http', 'https', 'mailto', 'tel'],
    allowProtocolRelative: false,
    transformTags: {
      a: (_tagName, attributes) => ({
        tagName: 'a',
        attribs: attributes.target === '_blank'
          ? { ...attributes, target: '_blank', rel: 'noopener noreferrer' }
          : Object.fromEntries(Object.entries(attributes).filter(([key]) => key !== 'target')),
      }),
    },
  });
}

function sanitizeFacultyDetails(content: unknown) {
  for (const member of (content as { items: { profileHtml?: string; details: { value: string }[] }[] }).items) {
    for (const detail of member.details) detail.value = cleanSubtitle(detail.value);
    if (typeof member.profileHtml === 'string') member.profileHtml = cleanSubtitle(member.profileHtml);
  }
}

/** Events gallery slides: `caption` removed; migrate legacy DB rows (drop caption; optional http(s) caption → videoLink). */
function normalizeHomeEventsMaster(content: unknown): unknown {
  if (!content || typeof content !== 'object' || Array.isArray(content)) return content;
  const doc = content as { items?: unknown[] };
  if (!Array.isArray(doc.items)) return content;
  return {
    ...doc,
    items: doc.items.map((raw) => {
      if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return raw;
      const item = raw as Record<string, unknown>;
      const { caption, ...rest } = item;
      let videoLink = typeof rest.videoLink === 'string' ? rest.videoLink : '';
      if (!videoLink.trim() && typeof caption === 'string' && /^https?:\/\//i.test(caption.trim())) {
        videoLink = caption.trim();
      }
      return { ...rest, videoLink };
    }),
  };
}

/** Keep legacy testimonial records editable and expose the optional video URL field in CMS. */
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

export const homeDocuments: Record<string, unknown> = {
  ...Object.fromEntries(Object.entries(homeDefaults).map(([key, value]) => [key, value])),
  ...Object.fromEntries(Object.entries(homeMasterDefaults).map(([key, value]) => [`master-${key}`, value])),
  // Legacy program-video keys only; other AICTE PGDM sections live under academics.* and must not override Home sections.
  'program-videos': academicsDefaults['program-videos'],
  'master-program-videos': academicsMasterDefaults['program-videos'],
};

// Validate against the imported content structure; unknown fields cannot be persisted.
function contentSchema(value: unknown, key = '', parent = ''): z.ZodType {
  if (Array.isArray(value)) return z.array(contentSchema(value[0], '', key)).max(100);
  if (typeof value === 'boolean') return z.boolean();
  if (typeof value === 'number') return z.number().finite().min(0).max(20000);
  if (value && typeof value === 'object') return z.object({ ...Object.fromEntries(Object.entries(value).map(([k, v]) => [k, contentSchema(v, k, key)])), ...(parent === 'items' ? { pages: z.array(z.string().max(200)).max(8).optional(), profileHtml: z.string().max(30000).optional() } : {}) }).strict();
  let result: z.ZodType = z.string().max(30000);
  if (key === 'videoLink' || (/href|src|icon$/i.test(key) && key !== 'videoLink')) {
    result = z.string().max(2048).refine(v => !v || /^(\/(?!\/)|#|https:\/\/|http:\/\/|tel:\+?[\d -]+$)/.test(v) && !/[\\\u0000-\u001f]/.test(v), 'Use a site path, HTTP(S) URL or telephone link');
  }
  if (key === 'src' || key === 'icon') result = result.refine(v => typeof v === 'string' && (!v || /^\/(?!\/)/.test(v) || v.startsWith('https://vsmedu.com/wp-content/uploads/')), 'Upload an image, use a local image path, or use an existing vsmedu.com upload');
  if (['title', 'name', 'question'].includes(key) || key === 'src' && parent !== 'avatar' || key === 'icon') result = result.refine(v => typeof v === 'string' && v.trim().length > 0, 'This field is required');
  if (key === 'width' || key === 'height') result = z.number().int().min(1).max(20000);
  return result;
}

export async function readHomeDocument(key: string) {
  if (!(key in homeDocuments)) throw new HttpError(404, 'HOME_SECTION_NOT_FOUND', 'Unknown homepage section');
  const row = await prisma.websiteSetting.findUnique({ where: { key: `home.${key}` } });
  let content = row?.value ?? homeDocuments[key];
  if (key === 'program') content = { ...homeDefaults.program, ...(content as object) };
  if (key === 'master-hero') {
    const actions = await prisma.websiteSetting.findUnique({ where: { key: 'home.hero' } });
    content = normalizeHero(content, (actions?.value ?? homeDefaults.hero) as typeof homeDefaults.hero);
  }
  if (key === 'master-faculty') sanitizeFacultyDetails(content);
  if (key === 'master-events') {
    content = normalizeHomeEventsMaster(content);
  }
  if (key === 'master-testimonials') content = normalizeTestimonialsMaster(content);
  return { content, updatedAt: row?.updatedAt.toISOString() ?? null };
}

export async function readHome() {
  const rows = await prisma.websiteSetting.findMany({ where: { key: { startsWith: 'home.' }, isPublic: true } });
  const sections = structuredClone(homeDefaults);
  const masters = structuredClone(homeMasterDefaults);
  let hasFaqRecord = false;
  for (const row of rows) {
    const key = row.key.slice(5);
    if (key.startsWith('master-') && key.slice(7) in masters) {
      let masterValue = row.value;
      if (key === 'master-events') masterValue = normalizeHomeEventsMaster(masterValue) as typeof masters.events;
      if (key === 'master-testimonials') masterValue = normalizeTestimonialsMaster(masterValue) as typeof masters.testimonials;
      Object.assign(masters, { [key.slice(7)]: masterValue });
    } else if (key in sections) {
      Object.assign(sections, { [key]: key === 'program' ? { ...homeDefaults.program, ...(row.value as object) } : row.value });
      if (key === 'faq') hasFaqRecord = true;
    }
  }
  if (!hasFaqRecord) sections.faq = { ...homeDefaults.faq, items: [] };
  masters.hero = normalizeHero(masters.hero, sections.hero) as typeof masters.hero;
  sanitizeFacultyDetails(masters.faculty);
  return { sections, masters };
}

export async function updateHomeDocument(key: string, input: unknown, actorId: number, requestId?: string) {
  if (!(key in homeDocuments)) throw new HttpError(404, 'HOME_SECTION_NOT_FOUND', 'Unknown homepage section');
  const parsed = z.object({ content: z.unknown(), updatedAt: z.string().datetime().nullable() }).strict().parse(input);
  const normalized = key === 'master-internships' && parsed.content && typeof parsed.content === 'object' && Array.isArray((parsed.content as { items?: unknown }).items)
    ? { items: (parsed.content as { items: Record<string, unknown>[] }).items.map(item => ({ videoLink: '', ...item })) }
    : key === 'master-events'
    ? normalizeHomeEventsMaster(parsed.content)
    : key === 'master-testimonials' ? normalizeTestimonialsMaster(parsed.content) : parsed.content;
  const { content, updatedAt } = z
    .object({ content: contentSchema(homeDocuments[key]), updatedAt: z.string().datetime().nullable() })
    .strict()
    .parse({ content: normalized, updatedAt: parsed.updatedAt });
  if (key === 'master-hero') {
    const slides = (content as { items: { title: string; subtitle: string; primaryText: string; primaryHref: string; secondaryText: string; secondaryHref: string }[] }).items;
    for (const slide of slides) {
      slide.title = cleanSubtitle(slide.title);
      slide.subtitle = cleanSubtitle(slide.subtitle);
      if (slide.primaryText.trim() && !slide.primaryHref.trim() || slide.secondaryText.trim() && !slide.secondaryHref.trim()) throw new HttpError(400, 'BUTTON_LINK_REQUIRED', 'Enter a link for each button, or clear its text to hide it');
    }
  }
  if (key === 'master-faculty') sanitizeFacultyDetails(content);
  if (key === 'master-hero' && !(content as { items: { enabled: boolean }[] }).items.some(item => item.enabled)) throw new HttpError(400, 'HERO_REQUIRED', 'Keep at least one enabled hero slide');
  return prisma.$transaction(async tx => {
    const old = await tx.websiteSetting.findUnique({ where: { key: `home.${key}` } });
    if ((old?.updatedAt.toISOString() ?? null) !== updatedAt) throw new HttpError(409, 'CONTENT_CONFLICT', 'This content was updated elsewhere. Reload before saving.');
    const value = content as Prisma.InputJsonValue;
    const row = old
      ? await tx.websiteSetting.updateMany({ where: { id: old.id, updatedAt: old.updatedAt }, data: { value, isPublic: true } })
      : null;
    if (row?.count === 0) throw new HttpError(409, 'CONTENT_CONFLICT', 'This content was updated elsewhere. Reload before saving.');
    if (!old) await tx.websiteSetting.create({ data: { key: `home.${key}`, value, isPublic: true } });
    await tx.auditLog.create({ data: { actorId, action: 'home.update', entityType: 'home', entityId: key, requestId } });
    const saved = await tx.websiteSetting.findUniqueOrThrow({ where: { key: `home.${key}` } });
    return { content: saved.value, updatedAt: saved.updatedAt.toISOString() };
  });
}

export async function readHomeAllAdmin() {
  const rows = await prisma.websiteSetting.findMany({ where: { key: { startsWith: 'home.' } } });
  const rowMap = new Map(rows.map(r => [r.key.slice(5), r]));
  const result: Record<string, { content: unknown; updatedAt: string | null }> = {};
  for (const [key, defaultValue] of Object.entries(homeDefaults)) {
    const row = rowMap.get(key);
    result[key] = {
      content: key === 'program' ? { ...homeDefaults.program, ...((row?.value ?? {}) as object) } : row?.value ?? defaultValue,
      updatedAt: row?.updatedAt.toISOString() ?? null,
    };
  }
  return result;
}

export async function updateHomeBulk(input: unknown, actorId: number, requestId?: string) {
  const bodySchema = z.object({
    sections: z.record(
      z.string(),
      z.object({
        content: z.unknown(),
        updatedAt: z.string().datetime().nullable(),
      }).strict()
    ),
  }).strict();

  const { sections } = bodySchema.parse(input);
  const validated: Array<{ key: string; content: unknown; updatedAt: string | null }> = [];

  for (const [key, item] of Object.entries(sections)) {
    if (!(key in homeDocuments)) {
      throw new HttpError(404, 'HOME_SECTION_NOT_FOUND', `Unknown homepage section: ${key}`);
    }
    const toParse = key === 'master-events'
      ? normalizeHomeEventsMaster(item.content)
      : key === 'master-testimonials' ? normalizeTestimonialsMaster(item.content) : item.content;
    const validatedContent = contentSchema(homeDocuments[key]).parse(toParse);
    if (key === 'master-faculty') sanitizeFacultyDetails(validatedContent);
    validated.push({ key, content: validatedContent, updatedAt: item.updatedAt });
  }

  return prisma.$transaction(async tx => {
    const updated: Record<string, { content: unknown; updatedAt: string }> = {};

    for (const { key, content, updatedAt } of validated) {
      const old = await tx.websiteSetting.findUnique({ where: { key: `home.${key}` } });
      if ((old?.updatedAt.toISOString() ?? null) !== updatedAt) {
        throw new HttpError(409, 'CONTENT_CONFLICT', `Section "${key}" was updated elsewhere. Reload before saving.`);
      }
      const value = content as Prisma.InputJsonValue;
      if (old) {
        const row = await tx.websiteSetting.updateMany({
          where: { id: old.id, updatedAt: old.updatedAt },
          data: { value, isPublic: true },
        });
        if (row.count === 0) {
          throw new HttpError(409, 'CONTENT_CONFLICT', `Section "${key}" was updated elsewhere. Reload before saving.`);
        }
      } else {
        await tx.websiteSetting.create({ data: { key: `home.${key}`, value, isPublic: true } });
      }
      await tx.auditLog.create({ data: { actorId, action: 'home.bulk_update', entityType: 'home', entityId: key, requestId } });
      const saved = await tx.websiteSetting.findUniqueOrThrow({ where: { key: `home.${key}` } });
      updated[key] = { content: saved.value, updatedAt: saved.updatedAt.toISOString() };
    }

    return updated;
  });
}

export async function readGlobalSettings() {
  const row = await prisma.websiteSetting.findUnique({ where: { key: 'global.enquiry' } });
  if (row) {
    return {
      enquiry: {
        content: row.value,
        updatedAt: row.updatedAt.toISOString(),
      },
    };
  }
  const homeRow = await prisma.websiteSetting.findUnique({ where: { key: 'home.enquiry' } });
  return {
    enquiry: {
      content: homeRow?.value ?? homeDefaults.enquiry,
      updatedAt: homeRow?.updatedAt.toISOString() ?? null,
    },
  };
}

export async function updateGlobalSettings(input: unknown, actorId: number, requestId?: string) {
  const schema = z.object({
    enquiry: z.object({
      content: contentSchema(homeDefaults.enquiry),
      updatedAt: z.string().datetime().nullable(),
    }).strict(),
  }).strict();

  const { enquiry } = schema.parse(input);

  return prisma.$transaction(async tx => {
    const oldGlobal = await tx.websiteSetting.findUnique({ where: { key: 'global.enquiry' } });
    const oldHome = await tx.websiteSetting.findUnique({ where: { key: 'home.enquiry' } });
    const expectedTime = oldGlobal ? oldGlobal.updatedAt.toISOString() : (oldHome?.updatedAt.toISOString() ?? null);

    if (expectedTime !== enquiry.updatedAt) {
      throw new HttpError(409, 'CONTENT_CONFLICT', 'Global settings were updated elsewhere. Reload before saving.');
    }

    const value = enquiry.content as Prisma.InputJsonValue;

    if (oldGlobal) {
      await tx.websiteSetting.update({ where: { id: oldGlobal.id }, data: { value, isPublic: true } });
    } else {
      await tx.websiteSetting.create({ data: { key: 'global.enquiry', value, isPublic: true } });
    }

    if (oldHome) {
      await tx.websiteSetting.update({ where: { id: oldHome.id }, data: { value, isPublic: true } });
    } else {
      await tx.websiteSetting.create({ data: { key: 'home.enquiry', value, isPublic: true } });
    }

    await tx.auditLog.create({ data: { actorId, action: 'global.update', entityType: 'global', entityId: 'enquiry', requestId } });

    const saved = await tx.websiteSetting.findUniqueOrThrow({ where: { key: 'global.enquiry' } });
    return {
      enquiry: {
        content: saved.value,
        updatedAt: saved.updatedAt.toISOString(),
      },
    };
  });
}

export async function readPublicGlobalSettings() {
  const row = await prisma.websiteSetting.findUnique({ where: { key: 'global.enquiry', isPublic: true } });
  if (row) return { enquiry: row.value };
  const homeRow = await prisma.websiteSetting.findUnique({ where: { key: 'home.enquiry', isPublic: true } });
  return { enquiry: homeRow?.value ?? homeDefaults.enquiry };
}
