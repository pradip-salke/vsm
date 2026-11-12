import { Prisma } from '@prisma/client';
import { z } from 'zod';
import {
  academicsCaptionRequired,
  academicsDefaults,
  academicsMasterDefaults,
  type AcademicsKey,
  type AcademicsMasterKey,
} from '@vsmedu/contracts/academics';
import { prisma } from '../../lib/prisma.js';
import { HttpError } from '../../middleware/errors.js';
import { cleanSubtitle } from './home.service.js';
import { normalizeVideoLink } from './video-link.js';

type Client = Prisma.TransactionClient | typeof prisma;

export const academicsDocuments: Record<string, unknown> = {
  ...Object.fromEntries(Object.entries(academicsDefaults).map(([key, value]) => [key, value])),
  ...Object.fromEntries(
    Object.entries(academicsMasterDefaults).map(([key, value]) => [`master-${key}`, value])
  ),
};

// Program videos were first stored under home.* keys; they are still read as a fallback and kept in sync.
const LEGACY_HOME_KEYS = new Set(['program-videos', 'master-program-videos']);
const RICH_TEXT_KEYS = new Set(['subtitle', 'body']);

/** Public payload: one banner slide (master-hero) merged into legacy `hero` shape for API consumers. */
const LEGACY_ABOUT_LINK = {
  label: 'PGDM program',
  href: 'https://collegedunia.com/college/63393-valia-school-of-management-vsm-mumbai',
} as const;

function escapeHtmlText(text: string): string {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

/** Migrate stored `about` from paragraphs + {link} to a single HTML `body`. */
function normalizeEligibilitySection(raw: unknown): unknown {
  const defaults = academicsDefaults.eligibility;
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return defaults;
  const o = raw as Record<string, unknown>;
  const defaultIcon = defaults.criteria[0]!.icon;
  /** Legacy: section-level icon + string[] criteria */
  const legacySectionIcon =
    o.icon && typeof o.icon === 'object' && !Array.isArray(o.icon)
      ? ({ ...defaultIcon, ...(o.icon as Record<string, unknown>) } as (typeof defaults.criteria)[0]['icon'])
      : null;
  const critRaw = o.criteria;
  let criteria: (typeof defaults.criteria)[number][] = structuredClone(defaults.criteria);
  if (Array.isArray(critRaw) && critRaw.length > 0) {
    const first = critRaw[0];
    if (typeof first === 'string') {
      criteria = critRaw.map((line) => {
        const text = String(line ?? '');
        const base = legacySectionIcon ?? defaultIcon;
        const icon = {
          src: String(base.src),
          alt: String(base.alt ?? ''),
          width: Number(base.width) > 0 ? Number(base.width) : defaultIcon.width,
          height: Number(base.height) > 0 ? Number(base.height) : defaultIcon.height,
        };
        return { text, icon };
      });
    } else {
      criteria = critRaw.map((row, i) => {
        if (row && typeof row === 'object' && !Array.isArray(row)) {
          const r = row as Record<string, unknown>;
          const text = typeof r.text === 'string' ? r.text : String(r.text ?? '');
          const icIn = r.icon;
          let icon: (typeof defaults.criteria)[0]['icon'] = { ...defaultIcon };
          if (icIn && typeof icIn === 'object' && !Array.isArray(icIn)) {
            const merged = { ...defaultIcon, ...(icIn as Record<string, unknown>) };
            icon = {
              src: String(merged.src ?? defaultIcon.src),
              alt: String(merged.alt ?? defaultIcon.alt),
              width: Number(merged.width) > 0 ? Number(merged.width) : defaultIcon.width,
              height: Number(merged.height) > 0 ? Number(merged.height) : defaultIcon.height,
            };
          } else if (legacySectionIcon) {
            icon = {
              src: String(legacySectionIcon.src),
              alt: String(legacySectionIcon.alt ?? defaultIcon.alt),
              width: Number(legacySectionIcon.width) > 0 ? Number(legacySectionIcon.width) : defaultIcon.width,
              height: Number(legacySectionIcon.height) > 0 ? Number(legacySectionIcon.height) : defaultIcon.height,
            };
          } else if (typeof icIn === 'string' && icIn) {
            icon = { ...defaultIcon, src: icIn };
          }
          return { text, icon };
        }
        return defaults.criteria[i] ?? { text: '', icon: { ...defaultIcon } };
      });
    }
  }
  const { icon: _removed, ...rest } = o;
  return {
    ...defaults,
    ...rest,
    criteria,
  };
}

function normalizeAboutSection(raw: unknown): unknown {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return raw;
  const o = { ...(raw as Record<string, unknown>) };
  const paragraphs = o.paragraphs;
  const bodyStr = typeof o.body === 'string' ? o.body.trim() : '';
  if (Array.isArray(paragraphs) && paragraphs.length > 0 && !bodyStr) {
    const linkLabel = String(o.linkLabel ?? LEGACY_ABOUT_LINK.label);
    const linkHref = String(o.linkHref ?? LEGACY_ABOUT_LINK.href);
    const safeLabel = escapeHtmlText(linkLabel);
    const safeHref = escapeHtmlText(linkHref);
    o.body = paragraphs
      .map((p) => {
        const s = String(p ?? '');
        const parts = s.split('{link}');
        const before = parts[0] ?? '';
        const after = parts[1];
        const inner =
          after !== undefined
            ? `${escapeHtmlText(before)}<a href="${safeHref}" target="_blank" rel="noopener noreferrer">${safeLabel}</a>${escapeHtmlText(after)}`
            : escapeHtmlText(s);
        return `<p>${inner}</p>`;
      })
      .join('');
  }
  if (typeof o.body !== 'string') o.body = '';
  delete o.paragraphs;
  delete o.linkLabel;
  delete o.linkHref;
  return o;
}

/** AICTE Upcoming Events: `caption` removed; migrate legacy rows (optional http(s) caption → videoLink). */
function normalizeAcademicsEventsMaster(content: unknown): unknown {
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

/** Keep existing Academic testimonial records compatible with the editable video URL field. */
function normalizeAcademicsTestimonialsMaster(content: unknown): unknown {
  if (!content || typeof content !== 'object' || Array.isArray(content)) return content;
  const doc = content as { items?: unknown[] };
  if (!Array.isArray(doc.items)) return content;
  return { ...doc, items: doc.items.map((raw) => {
    if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return raw;
    const item = raw as Record<string, unknown>;
    return { ...item, videoLink: normalizeVideoLink(item.videoLink) };
  }) };
}

/** Ensure existing Program Video CMS records expose the optional YouTube/direct video URL field. */
function normalizeAcademicsProgramVideosMaster(content: unknown): unknown {
  if (!content || typeof content !== 'object' || Array.isArray(content)) return content;
  const doc = content as { items?: unknown[] };
  if (!Array.isArray(doc.items)) return content;
  return {
    ...doc,
    items: doc.items.map((raw) => {
      if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return raw;
      const item = raw as Record<string, unknown>;
      return { ...item, videoLink: typeof item.videoLink === 'string' ? item.videoLink : '' };
    }),
  };
}

function normalizeAcademicsGalleryMaster(content: unknown): unknown {
  if (!content || typeof content !== 'object' || Array.isArray(content)) return content;
  const doc = content as { items?: unknown[] };
  if (!Array.isArray(doc.items)) return content;
  return { ...doc, items: doc.items.map((item) => item && typeof item === 'object' && !Array.isArray(item) ? { ...item, videoLink: typeof (item as Record<string, unknown>).videoLink === 'string' ? (item as Record<string, unknown>).videoLink : '' } : item) };
}

function mergeHeroForPublic(
  breadcrumbOnly: (typeof academicsDefaults)['hero'],
  masterHero: (typeof academicsMasterDefaults)['hero']
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
  if (!(key in academicsDocuments)) {
    throw new HttpError(404, 'ACADEMICS_SECTION_NOT_FOUND', `Unknown AICTE PGDM page section: ${key}`);
  }
}

// Validate against the imported content structure; unknown fields cannot be persisted.
function contentSchema(value: unknown, key = '', parent = '', documentKey = ''): z.ZodType {
  if (Array.isArray(value)) return z.array(contentSchema(value[0], '', key, documentKey)).max(100);
  if (typeof value === 'boolean') return z.boolean();
  if (typeof value === 'number') return z.number().finite().min(0).max(20000);
  if (value && typeof value === 'object') {
    return z
      .object(Object.fromEntries(Object.entries(value).map(([k, v]) => [k, contentSchema(v, k, key, documentKey)])))
      .strict();
  }
  let result: z.ZodType = z.string().max(30000);
  if (key === 'videoLink' || (/href|src|icon$/i.test(key) && key !== 'videoLink')) {
    result = z
      .string()
      .max(2048)
      .refine(
        (v) =>
          !v ||
          /^(\/(?!\/)|#|https:\/\/|http:\/\/|tel:\+?[\d -]+$)/.test(v) && !/[\\\u0000-\u001f]/.test(v),
        'Use a site path, HTTP(S) URL or telephone link'
      );
  }
  if (key === 'src' || key === 'icon') {
    result = result.refine(
      (v) =>
        typeof v === 'string' &&
        (!v || /^\/(?!\/)/.test(v) || v.startsWith('https://vsmedu.com/wp-content/uploads/')),
      'Upload an image, use a local image path, or use an existing vsmedu.com upload'
    );
  }
  if (key === 'anchor') {
    result = result.refine((v) => typeof v === 'string' && /^[a-z0-9-]+$/.test(v), 'Use lowercase letters, numbers and hyphens only (e.g. about-program)');
  }
  /** AICTE page FAQ (`academics.faq`): align string requirements with Home CMS FAQ (separate `academics.*` storage). */
  if (documentKey === 'faq') {
    if (parent === 'items' && key === 'question') {
      result = result.refine((v) => typeof v === 'string' && v.trim().length > 0, 'This field is required');
    } else if (parent === '' && ['title', 'eyebrow', 'description', 'buttonText', 'buttonHref'].includes(key)) {
      result = result.refine((v) => typeof v === 'string' && v.trim().length > 0, 'This field is required');
    }
  }
  const captionRequired = key === 'caption' && academicsCaptionRequired.some((master) => documentKey === `master-${master}`);
  if (['title', 'year', 'anchor', 'icon'].includes(key) || captionRequired || (key === 'src' && parent !== 'avatar')) {
    result = result.refine((v) => typeof v === 'string' && v.trim().length > 0, 'This field is required');
  }
  if (key === 'width' || key === 'height') result = z.number().int().min(1).max(20000);
  if (RICH_TEXT_KEYS.has(key)) result = result.transform((v) => cleanSubtitle(String(v)));
  return result;
}

function validate(key: string, content: unknown) {
  const result = contentSchema(academicsDocuments[key], '', '', key).safeParse(content);
  if (result.success) return result.data;
  throw new z.ZodError(result.error.issues.map((issue) => ({ ...issue, path: [key, ...issue.path] })));
}

async function findRow(client: Client, key: string) {
  const row = await client.websiteSetting.findUnique({ where: { key: `academics.${key}` } });
  if (row || !LEGACY_HOME_KEYS.has(key)) return row;
  return client.websiteSetting.findUnique({ where: { key: `home.${key}` } });
}

/** Rows keyed by section key; academics.* rows take precedence over legacy home.* rows. */
async function loadRows(publicOnly: boolean) {
  const rows = await prisma.websiteSetting.findMany({
    where: {
      OR: [{ key: { startsWith: 'academics.' } }, { key: { in: [...LEGACY_HOME_KEYS].map((key) => `home.${key}`) } }],
      ...(publicOnly ? { isPublic: true } : {}),
    },
  });
  const map = new Map<string, (typeof rows)[number]>();
  for (const row of rows.filter((r) => r.key.startsWith('home.'))) map.set(row.key.slice(5), row);
  for (const row of rows.filter((r) => r.key.startsWith('academics.'))) map.set(row.key.slice(10), row);
  return map;
}

export async function readAcademicsDocument(key: string) {
  assertKnown(key);
  const row = await findRow(prisma, key);
  const base = row?.value ?? academicsDocuments[key];
  let content: unknown = base;
  if (key === 'about') content = normalizeAboutSection(base);
  else if (key === 'eligibility') content = normalizeEligibilitySection(base);
  else if (key === 'master-program-videos') content = normalizeAcademicsProgramVideosMaster(base);
  else if (key === 'master-gallery') content = normalizeAcademicsGalleryMaster(base);
  else if (key === 'master-events') content = normalizeAcademicsEventsMaster(base);
  else if (key === 'master-testimonials') content = normalizeAcademicsTestimonialsMaster(base);
  return { content, updatedAt: row?.updatedAt.toISOString() ?? null };
}

export async function readAcademics() {
  const rows = await loadRows(true);
  const sections = structuredClone(academicsDefaults) as Record<string, unknown>;
  const masters = structuredClone(academicsMasterDefaults);
  for (const [key, row] of rows) {
    if (key.startsWith('master-') && key.slice(7) in masters) {
      let masterVal = row.value;
      if (key === 'master-program-videos') masterVal = normalizeAcademicsProgramVideosMaster(masterVal) as typeof masterVal;
      if (key === 'master-gallery') masterVal = normalizeAcademicsGalleryMaster(masterVal) as typeof masterVal;
      if (key === 'master-events') masterVal = normalizeAcademicsEventsMaster(masterVal) as (typeof masters)['events'];
      if (key === 'master-testimonials') masterVal = normalizeAcademicsTestimonialsMaster(masterVal) as (typeof masters)['testimonials'];
      Object.assign(masters, { [key.slice(7) as AcademicsMasterKey]: masterVal });
    } else if (key in sections) {
      Object.assign(sections, { [key as AcademicsKey]: row.value });
    }
  }
  sections.hero = mergeHeroForPublic(
    sections.hero as (typeof academicsDefaults)['hero'],
    masters.hero as (typeof academicsMasterDefaults)['hero']
  );
  sections.about = normalizeAboutSection(sections.about) as (typeof academicsDefaults)['about'];
  sections.eligibility = normalizeEligibilitySection(sections.eligibility) as (typeof academicsDefaults)['eligibility'];
  return { sections: sections as typeof academicsDefaults, masters };
}

export async function readPublicProgramVideos() {
  const data = await readAcademics();
  return {
    section: data.sections['program-videos'],
    master: {
      ...data.masters['program-videos'],
      items: data.masters['program-videos'].items.filter((item) => item.enabled !== false),
    },
    gallery: data.masters.gallery,
  };
}

export async function readAcademicsAllAdmin() {
  const rows = await loadRows(false);
  const result: Record<string, { content: unknown; updatedAt: string | null }> = {};
  for (const [key, defaultValue] of Object.entries(academicsDocuments)) {
    const row = rows.get(key);
    const raw = row?.value ?? defaultValue;
    let content: unknown = raw;
    if (key === 'about') content = normalizeAboutSection(raw);
    else if (key === 'eligibility') content = normalizeEligibilitySection(raw);
    else if (key === 'master-program-videos') content = normalizeAcademicsProgramVideosMaster(raw);
    else if (key === 'master-gallery') content = normalizeAcademicsGalleryMaster(raw);
    else if (key === 'master-events') content = normalizeAcademicsEventsMaster(raw);
    else if (key === 'master-testimonials') content = normalizeAcademicsTestimonialsMaster(raw);
    result[key] = { content, updatedAt: row?.updatedAt.toISOString() ?? null };
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
  const conflict = () =>
    new HttpError(409, 'CONTENT_CONFLICT', `"${key}" was updated elsewhere. Reload before saving.`);
  const old = await findRow(tx, key);
  if ((old?.updatedAt.toISOString() ?? null) !== updatedAt) throw conflict();
  const value = content as Prisma.InputJsonValue;

  if (old?.key === `academics.${key}`) {
    const row = await tx.websiteSetting.updateMany({
      where: { id: old.id, updatedAt: old.updatedAt },
      data: { value, isPublic: true },
    });
    if (row.count === 0) throw conflict();
  } else {
    await tx.websiteSetting.upsert({
      where: { key: `academics.${key}` },
      update: { value, isPublic: true },
      create: { key: `academics.${key}`, value, isPublic: true },
    });
  }

  if (LEGACY_HOME_KEYS.has(key)) {
    await tx.websiteSetting.upsert({
      where: { key: `home.${key}` },
      update: { value, isPublic: true },
      create: { key: `home.${key}`, value, isPublic: true },
    });
  }

  await tx.auditLog.create({
    data: { actorId, action, entityType: 'academics', entityId: key, requestId },
  });
  const saved = await tx.websiteSetting.findUniqueOrThrow({ where: { key: `academics.${key}` } });
  return { content: saved.value, updatedAt: saved.updatedAt.toISOString() };
}

export async function updateAcademicsDocument(
  key: string,
  input: unknown,
  actorId: number,
  requestId?: string
) {
  assertKnown(key);
  const { content, updatedAt } = z
    .object({ content: z.unknown(), updatedAt: z.string().datetime().nullable() })
    .strict()
    .parse(input);
  let toValidate: unknown = content;
  if (key === 'about') toValidate = normalizeAboutSection(content);
  else if (key === 'eligibility') toValidate = normalizeEligibilitySection(content);
  else if (key === 'master-program-videos') toValidate = normalizeAcademicsProgramVideosMaster(content);
  else if (key === 'master-events') toValidate = normalizeAcademicsEventsMaster(content);
  else if (key === 'master-testimonials') toValidate = normalizeAcademicsTestimonialsMaster(content);
  const validated = validate(key, toValidate);
  return prisma.$transaction((tx) => write(tx, key, validated, updatedAt, 'academics.update', actorId, requestId));
}

export async function updateAcademicsBulk(input: unknown, actorId: number, requestId?: string) {
  const { sections } = z
    .object({
      sections: z.record(
        z.string(),
        z.object({ content: z.unknown(), updatedAt: z.string().datetime().nullable() }).strict()
      ),
    })
    .strict()
    .parse(input);

  const validated = Object.entries(sections).map(([key, item]) => {
    assertKnown(key);
    let toValidate: unknown = item.content;
    if (key === 'about') toValidate = normalizeAboutSection(item.content);
    else if (key === 'eligibility') toValidate = normalizeEligibilitySection(item.content);
    else if (key === 'master-program-videos') toValidate = normalizeAcademicsProgramVideosMaster(item.content);
    else if (key === 'master-events') toValidate = normalizeAcademicsEventsMaster(item.content);
    else if (key === 'master-testimonials') toValidate = normalizeAcademicsTestimonialsMaster(item.content);
    return { key, content: validate(key, toValidate), updatedAt: item.updatedAt };
  });

  return prisma.$transaction(async (tx) => {
    const updated: Record<string, { content: unknown; updatedAt: string }> = {};
    for (const { key, content, updatedAt } of validated) {
      updated[key] = await write(tx, key, content, updatedAt, 'academics.bulk_update', actorId, requestId);
    }
    return updated;
  });
}
