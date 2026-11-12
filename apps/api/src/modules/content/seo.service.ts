import { createHash } from 'node:crypto';
import { Prisma } from '@prisma/client';
import { z } from 'zod';
import {
  SEO_ROBOTS_OPTIONS,
  SEO_TRACKING_PATTERNS,
  SEO_VERIFICATION_KEYS,
  blogPostSeoPath,
  defaultRobotsTxt,
  normaliseSeoPath,
  scoreSeo,
  seoGlobalDefaults,
  seoOverrideIsActive,
  seoPageOverrideDefaults,
  seoSitemaps,
  seoStaticPages,
  seoTrackingDefaults,
  type SeoCheck,
  type SeoGlobalSettings,
  type SeoPageEntry,
  type SeoPageOverride,
  type SeoTrackingSettings,
} from '@vsmedu/contracts/seo';
import { env } from '../../config/env.js';
import { prisma } from '../../lib/prisma.js';
import { HttpError } from '../../middleware/errors.js';

type Doc<T> = { content: T; updatedAt: string | null };

const KEY = { global: 'seo.global', tracking: 'seo.tracking', robots: 'seo.robots', robotsBackup: 'seo.robots-backup' } as const;
const PAGE_PREFIX = 'seo.page.';
// website_settings.key is VARCHAR(120); blog URLs can be longer, so page rows are keyed by a path hash.
const pageKey = (path: string) => `${PAGE_PREFIX}${createHash('sha256').update(path).digest('hex').slice(0, 32)}`;

/* ─── Validation ──────────────────────────────────────────────────────────── */

const noControl = (v: string) => !/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/.test(v);
const text = (max: number) => z.string().max(max).refine(noControl, 'Remove control characters').transform((v) => v.trim());
const sitePathOrHttps = (label: string) =>
  text(2048).refine((v) => !v || /^\/(?!\/)[^\s\\]*$/.test(v) || /^https?:\/\/[^\s\\]+$/.test(v), `${label}: use a site path (/…) or a full http(s) URL`);
const httpUrl = (label: string) => text(2048).refine((v) => !v || /^https?:\/\/[^\s\\]+$/.test(v), `${label}: use a full http(s) URL`);

const PageOverrideSchema = z
  .object({
    focusKeyword: text(120),
    metaTitle: text(200),
    metaDescription: text(500),
    canonicalUrl: sitePathOrHttps('Canonical URL'),
    robots: z.enum(SEO_ROBOTS_OPTIONS),
    metaKeywords: text(500),
    ogTitle: text(200),
    ogDescription: text(500),
    ogImage: sitePathOrHttps('Share image'),
    schemaJson: z
      .string()
      .max(20000)
      .transform((v) => v.trim())
      .superRefine((v, ctx) => {
        if (!v) return;
        try {
          const parsed: unknown = JSON.parse(v);
          if (!parsed || typeof parsed !== 'object') ctx.addIssue({ code: 'custom', message: 'Structured data must be a JSON object or array' });
        } catch (error) {
          ctx.addIssue({ code: 'custom', message: `Structured data is not valid JSON (${error instanceof Error ? error.message : 'parse error'})` });
        }
      }),
  })
  .strict();

const verification = text(200).refine((v) => /^[A-Za-z0-9_\-:.=+/]*$/.test(v), 'Paste only the verification code (letters, numbers, - _ : . = + /), not the whole meta tag');

const GlobalSchema = z
  .object({
    googleVerification: verification,
    bingVerification: verification,
    yandexVerification: verification,
    pinterestVerification: verification,
    facebookVerification: verification,
    enableOrgSchema: z.boolean(),
    orgName: text(160),
    websiteUrl: httpUrl('Website URL'),
    orgLogo: sitePathOrHttps('Logo'),
    contactEmail: text(254).refine((v) => !v || z.email().safeParse(v).success, 'Enter a valid email address'),
    contactPhone: text(40).refine((v) => !v || /^\+?[\d ()\-/]{6,40}$/.test(v), 'Enter a valid phone number'),
    socialUrls: z
      .string()
      .max(4000)
      .transform((v) => v.split(/\r?\n/).map((line) => line.trim()).filter(Boolean).join('\n'))
      .refine((v) => !v || v.split('\n').every((line) => /^https?:\/\/[^\s\\]+$/.test(line)), 'Every social profile line must be a full http(s) URL'),
    enableSitelinksSearchbox: z.boolean(),
    siteSearchUrl: httpUrl('Site search URL').refine((v) => !v || v.includes('{search_term_string}'), 'The search URL must contain {search_term_string}'),
    defaultShareImage: sitePathOrHttps('Default share image'),
    twitterHandle: text(16)
      .refine((v) => !v || /^@?[A-Za-z0-9_]{1,15}$/.test(v), 'Enter a valid X handle, e.g. @ValiaSOM')
      .transform((v) => (v && !v.startsWith('@') ? `@${v}` : v)),
  })
  .strict()
  .superRefine((v, ctx) => {
    if (v.enableOrgSchema && !v.orgName) ctx.addIssue({ code: 'custom', path: ['orgName'], message: 'Organization name is required when the Organization schema is enabled' });
    if (v.enableSitelinksSearchbox && !v.siteSearchUrl) ctx.addIssue({ code: 'custom', path: ['siteSearchUrl'], message: 'Enter the site search URL to enable the sitelinks search box' });
  });

const trackingId = (key: keyof typeof SEO_TRACKING_PATTERNS, label: string, example: string) =>
  text(40).refine((v) => !v || SEO_TRACKING_PATTERNS[key].test(v), `${label} looks wrong (expected e.g. ${example})`);

const TrackingSchema = z
  .object({
    googleAnalyticsId: trackingId('googleAnalyticsId', 'Google Analytics 4 measurement ID', 'G-XXXXXXXXXX'),
    gtmContainerId: trackingId('gtmContainerId', 'Tag Manager container ID', 'GTM-XXXXXXX'),
    metaPixelId: trackingId('metaPixelId', 'Meta Pixel ID', '123456789012345'),
    clarityProjectId: trackingId('clarityProjectId', 'Clarity project ID', 'abcd1234ef'),
    customHeadCode: z.string().max(20000),
    customBodyStartCode: z.string().max(20000),
    customBodyEndCode: z.string().max(20000),
  })
  .strict();

const RobotsSchema = z
  .string()
  .max(20000)
  .transform((v) => v.replace(/\r\n?/g, '\n').trim())
  .refine((v) => v.length > 0, 'robots.txt cannot be empty — use "User-agent: *" with "Allow: /" to allow everything');

const DocInput = <T extends z.ZodType>(content: T) => z.object({ content, updatedAt: z.string().datetime().nullable() }).strict();

function zodPath<T>(schema: z.ZodType<T>, value: unknown, root: string): T {
  const result = schema.safeParse(value);
  if (result.success) return result.data;
  throw new z.ZodError(result.error.issues.map((issue) => ({ ...issue, path: [root, ...issue.path] })));
}

/* ─── Storage ─────────────────────────────────────────────────────────────── */

async function readSetting<T>(key: string, defaults: T): Promise<Doc<T>> {
  const row = await prisma.websiteSetting.findUnique({ where: { key } });
  const content = row ? (typeof defaults === 'object' && defaults !== null ? { ...defaults, ...(row.value as object) } : (row.value as T)) : defaults;
  return { content: content as T, updatedAt: row?.updatedAt.toISOString() ?? null };
}

async function writeSetting(
  tx: Prisma.TransactionClient,
  key: string,
  value: unknown,
  updatedAt: string | null,
  action: string,
  entityId: string,
  actorId: number,
  requestId?: string
) {
  const conflict = () => new HttpError(409, 'CONTENT_CONFLICT', 'These SEO settings were updated elsewhere. Reload before saving.');
  const old = await tx.websiteSetting.findUnique({ where: { key } });
  if ((old?.updatedAt.toISOString() ?? null) !== updatedAt) throw conflict();
  const json = value as Prisma.InputJsonValue;
  if (old) {
    const row = await tx.websiteSetting.updateMany({ where: { id: old.id, updatedAt: old.updatedAt }, data: { value: json, isPublic: true } });
    if (row.count === 0) throw conflict();
  } else {
    await tx.websiteSetting.create({ data: { key, value: json, isPublic: true } });
  }
  await tx.auditLog.create({ data: { actorId, action, entityType: 'seo', entityId: entityId.slice(0, 100), requestId } });
  return tx.websiteSetting.findUniqueOrThrow({ where: { key } });
}

/* ─── Pages registry ──────────────────────────────────────────────────────── */

export type SeoPageListItem = SeoPageEntry & { hasOverride: boolean; robots: string; updatedAt: string | null };

async function allPages(): Promise<(SeoPageEntry & { lastmod?: Date })[]> {
  const posts = await prisma.blogPost.findMany({
    where: { status: 'PUBLISHED', deletedAt: null },
    select: { slug: true, title: true, updatedAt: true, publishedAt: true },
    orderBy: [{ publishedAt: 'desc' }, { id: 'desc' }],
  });
  return [...seoStaticPages, ...posts.map((post) => ({ path: blogPostSeoPath(post.slug), label: post.title, group: 'blogs' as const, lastmod: post.updatedAt }))];
}

async function findPage(rawPath: unknown) {
  if (typeof rawPath !== 'string' || !rawPath) throw new HttpError(400, 'SEO_PATH_REQUIRED', 'Choose a page (path query parameter is required)');
  const path = normaliseSeoPath(rawPath);
  const page = (await allPages()).find((entry) => entry.path === path);
  if (!page) throw new HttpError(404, 'SEO_PAGE_NOT_FOUND', `Unknown public URL: ${path}`);
  return page;
}

async function overrideRows() {
  const rows = await prisma.websiteSetting.findMany({ where: { key: { startsWith: PAGE_PREFIX } } });
  return new Map(rows.map((row) => {
    const value = row.value as Partial<SeoPageOverride> & { path?: string };
    return [value.path ?? '', { content: { ...seoPageOverrideDefaults, ...value }, updatedAt: row.updatedAt }] as const;
  }));
}

function stripPath(value: SeoPageOverride & { path?: string }): SeoPageOverride {
  const { path: _path, ...rest } = value;
  return { ...seoPageOverrideDefaults, ...rest };
}

export async function siteUrl() {
  const { content } = await readSetting(KEY.global, seoGlobalDefaults);
  return (content.websiteUrl || env.WEB_ORIGIN).replace(/\/+$/, '');
}

/* ─── Live page inspection (audit + "currently live") ─────────────────────── */

export type SeoInspection = {
  status: number;
  finalUrl: string;
  title: string;
  description: string;
  canonical: string;
  robots: string;
  keywords: string;
  ogTitle: string;
  ogDescription: string;
  ogImage: string;
  h1Count: number;
  imagesTotal: number;
  imagesMissingAlt: number;
  jsonLdCount: number;
  verificationTags: string[];
};

const ENTITIES: Record<string, string> = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ', ndash: '–', mdash: '—', rsquo: '’', lsquo: '‘', rdquo: '”', ldquo: '“', hellip: '…' };
const decode = (v: string) =>
  v.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (match, entity: string) => {
    if (entity[0] === '#') return String.fromCodePoint(entity[1]?.toLowerCase() === 'x' ? parseInt(entity.slice(2), 16) : parseInt(entity.slice(1), 10));
    return ENTITIES[entity.toLowerCase()] ?? match;
  });

function attributes(tag: string): Record<string, string> {
  const result: Record<string, string> = {};
  for (const match of tag.matchAll(/([a-zA-Z_:][-a-zA-Z0-9_:.]*)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+)))?/g)) {
    const name = match[1]!.toLowerCase();
    if (!(name in result)) result[name] = decode(match[2] ?? match[3] ?? match[4] ?? '');
  }
  return result;
}

export function parseSeoHtml(html: string): Omit<SeoInspection, 'status' | 'finalUrl'> {
  const visible = html.replace(/<noscript\b[\s\S]*?<\/noscript>/gi, '').replace(/<!--[\s\S]*?-->/g, '');
  const metas = [...visible.matchAll(/<meta\b[^>]*>/gi)].map((m) => attributes(m[0].slice(5)));
  const meta = (key: string) => metas.find((m) => (m.name ?? m.property ?? '').toLowerCase() === key)?.content ?? '';
  const canonical = [...visible.matchAll(/<link\b[^>]*>/gi)].map((m) => attributes(m[0].slice(5))).find((l) => (l.rel ?? '').toLowerCase().split(/\s+/).includes('canonical'))?.href ?? '';
  const images = [...visible.matchAll(/<img\b[^>]*>/gi)].map((m) => attributes(m[0].slice(4)));
  return {
    title: decode((/<title[^>]*>([\s\S]*?)<\/title>/i.exec(visible)?.[1] ?? '').trim()),
    description: meta('description'),
    canonical,
    robots: meta('robots'),
    keywords: meta('keywords'),
    ogTitle: meta('og:title'),
    ogDescription: meta('og:description'),
    ogImage: meta('og:image'),
    h1Count: (visible.match(/<h1[\s>]/gi) ?? []).length,
    imagesTotal: images.length,
    imagesMissingAlt: images.filter((img) => !('alt' in img)).length,
    jsonLdCount: (visible.match(/<script\b[^>]*type=["']application\/ld\+json["']/gi) ?? []).length,
    verificationTags: ['google-site-verification', 'msvalidate.01', 'yandex-verification', 'p:domain_verify', 'facebook-domain-verification'].filter((name) => meta(name)),
  };
}

/** Fetches a registered public URL from the website. `original` asks the website to skip Page SEO overrides. */
export async function inspectUrl(path: string, original = false, timeoutMs = 45000): Promise<SeoInspection> {
  const response = await fetch(`${env.WEB_ORIGIN.replace(/\/+$/, '')}${path}`, {
    headers: { 'user-agent': 'VSM-SEO-Audit/1.0', accept: 'text/html', ...(original ? { 'x-vsm-seo-original': '1' } : {}) },
    redirect: 'follow',
    cache: 'no-store',
    signal: AbortSignal.timeout(timeoutMs),
  });
  const html = response.headers.get('content-type')?.includes('text/html') ? await response.text() : '';
  return { status: response.status, finalUrl: response.url, ...parseSeoHtml(html) };
}

async function mapLimit<T, R>(items: T[], limit: number, fn: (item: T) => Promise<R>): Promise<R[]> {
  const results: R[] = new Array(items.length);
  let next = 0;
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (next < items.length) {
      const index = next++;
      results[index] = await fn(items[index]!);
    }
  }));
  return results;
}

/* ─── Public API ──────────────────────────────────────────────────────────── */

export const seoService = {
  async overview() {
    const [pages, overrides, global, tracking] = await Promise.all([allPages(), overrideRows(), readSetting(KEY.global, seoGlobalDefaults), readSetting(KEY.tracking, seoTrackingDefaults)]);
    const known = new Set(pages.map((p) => p.path));
    return {
      pagesWithOverrides: [...overrides].filter(([path, row]) => known.has(path) && seoOverrideIsActive(row.content)).length,
      verifiedCount: SEO_VERIFICATION_KEYS.filter((key) => global.content[key]).length,
      totalEngines: SEO_VERIFICATION_KEYS.length,
      analyticsConnected: Boolean(tracking.content.googleAnalyticsId || tracking.content.gtmContainerId),
      trackingConnected: (['googleAnalyticsId', 'gtmContainerId', 'metaPixelId', 'clarityProjectId'] as const).filter((key) => tracking.content[key]).length,
      publicUrls: pages.length,
      siteUrl: await siteUrl(),
    };
  },

  async listPages(): Promise<SeoPageListItem[]> {
    const [pages, overrides] = await Promise.all([allPages(), overrideRows()]);
    return pages.map(({ path, label, group }) => {
      const row = overrides.get(path);
      return { path, label, group, hasOverride: seoOverrideIsActive(row?.content), robots: row?.content.robots ?? 'index, follow', updatedAt: row?.updatedAt.toISOString() ?? null };
    });
  },

  async readPage(rawPath: unknown) {
    const page = await findPage(rawPath);
    const [row, global] = await Promise.all([prisma.websiteSetting.findUnique({ where: { key: pageKey(page.path) } }), readSetting(KEY.global, seoGlobalDefaults)]);
    let original: SeoInspection | null = null;
    let liveError = '';
    try {
      original = await inspectUrl(page.path, true);
    } catch (error) {
      liveError = `The website did not respond (${error instanceof Error ? error.message : 'unknown error'}).`;
    }
    return {
      page: { path: page.path, label: page.label, group: page.group },
      override: { content: row ? stripPath(row.value as SeoPageOverride) : seoPageOverrideDefaults, updatedAt: row?.updatedAt.toISOString() ?? null } satisfies Doc<SeoPageOverride>,
      original,
      liveError,
      siteUrl: (global.content.websiteUrl || env.WEB_ORIGIN).replace(/\/+$/, ''),
      defaultShareImage: global.content.defaultShareImage,
      siteName: global.content.orgName,
    };
  },

  async savePage(rawPath: unknown, input: unknown, actorId: number, requestId?: string) {
    const page = await findPage(rawPath);
    const { content, updatedAt } = DocInput(z.unknown()).parse(input);
    const value = zodPath(PageOverrideSchema, content, 'content');
    const saved = await prisma.$transaction((tx) => writeSetting(tx, pageKey(page.path), { path: page.path, ...value }, updatedAt, 'seo.page.update', page.path, actorId, requestId));
    const score = scoreSeo({ title: value.metaTitle, description: value.metaDescription, focusKeyword: value.focusKeyword, canonical: value.canonicalUrl || page.path, ogImage: value.ogImage });
    return { content: stripPath(saved.value as SeoPageOverride), updatedAt: saved.updatedAt.toISOString(), score: score.score };
  },

  async resetPage(rawPath: unknown, updatedAt: unknown, actorId: number, requestId?: string) {
    const page = await findPage(rawPath);
    const expected = z.string().datetime().nullable().parse(typeof updatedAt === 'string' && updatedAt ? updatedAt : null);
    await prisma.$transaction(async (tx) => {
      const old = await tx.websiteSetting.findUnique({ where: { key: pageKey(page.path) } });
      if (!old) return;
      if (old.updatedAt.toISOString() !== expected) throw new HttpError(409, 'CONTENT_CONFLICT', 'This page SEO was updated elsewhere. Reload before resetting.');
      await tx.websiteSetting.delete({ where: { id: old.id } });
      await tx.auditLog.create({ data: { actorId, action: 'seo.page.reset', entityType: 'seo', entityId: page.path.slice(0, 100), requestId } });
    });
    return { content: seoPageOverrideDefaults, updatedAt: null };
  },

  readGlobal: () => readSetting(KEY.global, seoGlobalDefaults),
  async saveGlobal(input: unknown, actorId: number, requestId?: string) {
    const { content, updatedAt } = DocInput(z.unknown()).parse(input);
    const value = zodPath(GlobalSchema, content, 'content');
    const saved = await prisma.$transaction((tx) => writeSetting(tx, KEY.global, value, updatedAt, 'seo.global.update', 'global', actorId, requestId));
    return { content: { ...seoGlobalDefaults, ...(saved.value as object) } as SeoGlobalSettings, updatedAt: saved.updatedAt.toISOString() };
  },

  readTracking: () => readSetting(KEY.tracking, seoTrackingDefaults),
  async saveTracking(input: unknown, actorId: number, requestId?: string) {
    const { content, updatedAt } = DocInput(z.unknown()).parse(input);
    const value = zodPath(TrackingSchema, content, 'content');
    const saved = await prisma.$transaction((tx) => writeSetting(tx, KEY.tracking, value, updatedAt, 'seo.tracking.update', 'tracking', actorId, requestId));
    return { content: { ...seoTrackingDefaults, ...(saved.value as object) } as SeoTrackingSettings, updatedAt: saved.updatedAt.toISOString() };
  },

  async readRobots() {
    const base = await siteUrl();
    const [row, backup, pages, overrides] = await Promise.all([
      prisma.websiteSetting.findUnique({ where: { key: KEY.robots } }),
      prisma.websiteSetting.findUnique({ where: { key: KEY.robotsBackup } }),
      allPages(),
      overrideRows(),
    ]);
    const excluded = new Set([...overrides].filter(([, o]) => o.content.robots.startsWith('noindex')).map(([path]) => path));
    return {
      content: row ? String(row.value) : defaultRobotsTxt(base),
      updatedAt: row?.updatedAt.toISOString() ?? null,
      backup: backup ? { content: String(backup.value), savedAt: backup.updatedAt.toISOString() } : null,
      defaultContent: defaultRobotsTxt(base),
      siteUrl: base,
      sitemaps: seoSitemaps.map((map) => ({
        ...map,
        url: `${base}/${map.file}`,
        urlCount: pages.filter((p) => map.groups.includes(p.group) && !excluded.has(p.path)).length,
      })),
    };
  },

  async saveRobots(input: unknown, actorId: number, requestId?: string) {
    const { content, updatedAt } = DocInput(z.unknown()).parse(input);
    const value = zodPath(RobotsSchema, content, 'content');
    const base = await siteUrl();
    return prisma.$transaction(async (tx) => {
      const existing = await tx.websiteSetting.findUnique({ where: { key: KEY.robots } });
      // Keep the file as it was before the first edit, like robots.txt.bak.
      if (!(await tx.websiteSetting.findUnique({ where: { key: KEY.robotsBackup } }))) {
        await tx.websiteSetting.create({ data: { key: KEY.robotsBackup, value: existing ? existing.value ?? '' : defaultRobotsTxt(base), isPublic: false } });
      }
      const saved = await writeSetting(tx, KEY.robots, value, updatedAt, 'seo.robots.update', 'robots.txt', actorId, requestId);
      return { content: String(saved.value), updatedAt: saved.updatedAt.toISOString() };
    });
  },

  /** Audits every public URL, or only `paths` (comma-separated, max 10) so the admin can stream results in batches. */
  async audit(rawPaths?: unknown) {
    const [registry, overrides] = await Promise.all([allPages(), overrideRows()]);
    let pages = registry;
    if (typeof rawPaths === 'string' && rawPaths.trim()) {
      const wanted = new Set(rawPaths.split(',').map((p) => normaliseSeoPath(p.trim())).filter(Boolean));
      if (wanted.size > 10) throw new HttpError(400, 'SEO_AUDIT_BATCH_TOO_LARGE', 'Audit at most 10 URLs per request');
      pages = registry.filter((page) => wanted.has(page.path));
    }
    const startedAt = Date.now();
    const rows = await mapLimit(pages, 6, async (page) => {
      const override = overrides.get(page.path)?.content;
      try {
        const live = await inspectUrl(page.path, false, 30000);
        const { score, checks } = scoreSeo({ ...live, focusKeyword: override?.focusKeyword });
        const statusCheck: SeoCheck[] = live.status === 200 ? [] : [{ id: 'status', status: 'fail', text: `Page returned HTTP ${live.status}.` }];
        const robotsCheck: SeoCheck[] = /noindex/i.test(live.robots) ? [{ id: 'robots', status: 'warn', text: `Page is excluded from search results (${live.robots}).` }] : [];
        return { ...page, ...live, score: live.status === 200 ? score : 0, checks: [...statusCheck, ...robotsCheck, ...checks], hasOverride: seoOverrideIsActive(override), error: '' };
      } catch (error) {
        return { ...page, status: 0, finalUrl: '', title: '', description: '', canonical: '', robots: '', keywords: '', ogTitle: '', ogDescription: '', ogImage: '', h1Count: 0, imagesTotal: 0, imagesMissingAlt: 0, jsonLdCount: 0, verificationTags: [], score: 0, checks: [{ id: 'status', status: 'fail' as const, text: error instanceof Error && error.name === 'TimeoutError' ? 'The page took longer than 30 seconds to respond.' : 'The website did not respond.' }], hasOverride: seoOverrideIsActive(override), error: error instanceof Error ? error.message : 'Request failed' };
      }
    });
    const reachable = rows.filter((row) => row.status === 200);
    return {
      checkedAt: new Date().toISOString(),
      durationMs: Date.now() - startedAt,
      total: rows.length,
      reachable: reachable.length,
      averageScore: reachable.length ? Math.round(reachable.reduce((sum, row) => sum + row.score, 0) / reachable.length) : 0,
      rows,
    };
  },

  /** Everything the website needs to render SEO for one URL. */
  async publicPage(rawPath: unknown) {
    const path = normaliseSeoPath(typeof rawPath === 'string' && rawPath ? rawPath : '/');
    const [global, tracking, row] = await Promise.all([
      readSetting(KEY.global, seoGlobalDefaults),
      readSetting(KEY.tracking, seoTrackingDefaults),
      prisma.websiteSetting.findUnique({ where: { key: pageKey(path) } }),
    ]);
    return { path, siteUrl: (global.content.websiteUrl || env.WEB_ORIGIN).replace(/\/+$/, ''), global: global.content, tracking: tracking.content, page: row ? stripPath(row.value as SeoPageOverride) : null };
  },

  async robotsTxt() {
    const row = await prisma.websiteSetting.findUnique({ where: { key: KEY.robots } });
    return row ? String(row.value) : defaultRobotsTxt(await siteUrl());
  },

  async sitemapXml(file: string) {
    const map = seoSitemaps.find((s) => s.file === file);
    if (!map) throw new HttpError(404, 'SITEMAP_NOT_FOUND', `Unknown sitemap: ${file}`);
    const [base, pages, overrides] = await Promise.all([siteUrl(), allPages(), overrideRows()]);
    const escape = (v: string) => v.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');
    const urls = pages
      .filter((p) => map.groups.includes(p.group) && !overrides.get(p.path)?.content.robots.startsWith('noindex'))
      .map((p) => {
        const override = overrides.get(p.path);
        const loc = override?.content.canonicalUrl && /^https?:\/\//.test(override.content.canonicalUrl) ? override.content.canonicalUrl : `${base}${override?.content.canonicalUrl || p.path}`;
        const lastmod = p.lastmod ?? override?.updatedAt;
        return [
          '  <url>',
          `    <loc>${escape(loc)}</loc>`,
          ...(lastmod ? [`    <lastmod>${lastmod.toISOString().slice(0, 10)}</lastmod>`] : []),
          `    <changefreq>${map.changefreq}</changefreq>`,
          `    <priority>${p.path === '/' ? '1.0' : map.priority}</priority>`,
          '  </url>',
        ].join('\n');
      });
    return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join('\n')}\n</urlset>\n`;
  },
};
