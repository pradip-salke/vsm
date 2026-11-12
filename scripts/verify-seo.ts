/**
 * Audits the SEO Studio end to end (seo.* website_settings rows only).
 * Usage: tsx scripts/verify-seo.ts [--cleanup]
 *
 * Admin API: overview, page list, page read / save / reset with validation and stale 409s,
 * global settings, tracking, robots.txt (with backup), audit. Public API, robots.txt and
 * sitemaps through the website, and the rendered HTML of a page (override title, description,
 * canonical, robots, share image, JSON-LD, verification meta, analytics tag, original mode).
 * Restores every seo.* row afterward. Requires API, website and MySQL.
 */
import 'dotenv/config';
import assert from 'node:assert/strict';
import { PrismaClient, type Prisma } from '@prisma/client';
import argon2 from 'argon2';
import { seoStaticPages } from '../packages/contracts/src/seo';

const prisma = new PrismaClient();
const base = process.env.API_BASE_URL ?? 'http://localhost:4000';
const origin = process.env.ADMIN_ORIGIN ?? 'http://localhost:5173';
const web = (process.env.WEB_ORIGIN ?? 'http://localhost:3000').replace(/\/+$/, '');

const user = { email: 'seo-audit@example.invalid', role: 'editor' as const };
const AUDIT_NAME = 'Temporary SEO Studio audit';
const password = 'Temporary-Seo-Audit!2026';
const PAGE = '/contact-us/';
const STAMP = `VSM SEO audit ${Date.now().toString(36)}`;

type Doc<T = Record<string, unknown>> = { content: T; updatedAt: string | null };

async function cleanupUser() {
  const u = await prisma.adminUser.findUnique({ where: { email: user.email } });
  if (u?.name === AUDIT_NAME) {
    await prisma.auditLog.deleteMany({ where: { actorId: u.id } });
    await prisma.adminUser.delete({ where: { id: u.id } });
  }
}

const pageHtml = async (path: string, headers: Record<string, string> = {}) => {
  const res = await fetch(`${web}${path}`, { headers: { accept: 'text/html', ...headers }, redirect: 'follow', cache: 'no-store' });
  assert.equal(res.status, 200, `${path} must render`);
  return res.text();
};
const metaContent = (html: string, key: string) =>
  new RegExp(`<meta[^>]*(?:name|property)="${key.replace(/[.:]/g, '\\$&')}"[^>]*content="([^"]*)"`, 'i').exec(html)?.[1] ??
  new RegExp(`<meta[^>]*content="([^"]*)"[^>]*(?:name|property)="${key.replace(/[.:]/g, '\\$&')}"`, 'i').exec(html)?.[1] ??
  null;
const titleOf = (html: string) => /<title[^>]*>([^<]*)<\/title>/i.exec(html)?.[1] ?? '';
const canonicalOf = (html: string) => /<link[^>]*rel="canonical"[^>]*href="([^"]*)"/i.exec(html)?.[1] ?? '';

async function main() {
  await cleanupUser();
  if (process.argv.includes('--cleanup')) return;

  await prisma.adminUser.create({
    data: {
      email: user.email,
      name: AUDIT_NAME,
      passwordHash: await argon2.hash(password),
      userRoles: { create: { role: { connect: { code: user.role } } } },
    },
  });

  const before = await prisma.websiteSetting.findMany({ where: { key: { startsWith: 'seo.' } } });
  let checks = 0;
  const pass = (name: string) => {
    checks++;
    console.info(`  ✓ ${name}`);
  };

  try {
    const login = await fetch(`${base}/api/v1/auth/login`, {
      method: 'POST',
      headers: { Origin: origin, 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: user.email, password }),
    });
    assert.equal(login.status, 200, 'Login must succeed');
    const h = { Cookie: login.headers.get('set-cookie')!.split(';')[0]!, Origin: origin, 'Content-Type': 'application/json' };
    const call = async <T>(method: string, path: string, body?: unknown) => {
      const res = await fetch(`${base}/api/v1/admin/seo${path}`, { method, headers: h, body: body === undefined ? undefined : JSON.stringify(body) });
      const json = (await res.json().catch(() => ({}))) as { data?: T; error?: { message?: string } };
      return { status: res.status, data: json.data as T, error: json.error };
    };
    const ok = async <T>(method: string, path: string, body?: unknown) => {
      const res = await call<T>(method, path, body);
      assert.equal(res.status, 200, `${method} ${path} → ${res.status} ${res.error?.message ?? ''}`);
      return res.data;
    };

    console.info('\nOverview & page registry');
    const overview = await ok<{ publicUrls: number; totalEngines: number; siteUrl: string }>('GET', '/overview');
    assert.ok(overview.publicUrls >= seoStaticPages.length && overview.totalEngines === 5 && overview.siteUrl.startsWith('http'));
    pass(`overview: ${overview.publicUrls} public URLs, site ${overview.siteUrl}`);
    const list = await ok<{ path: string; group: string }[]>('GET', '/pages');
    assert.equal(list.length, overview.publicUrls);
    for (const page of seoStaticPages) assert.ok(list.some((p) => p.path === page.path), `missing ${page.path}`);
    const groups = new Set(list.map((p) => p.group));
    assert.ok(['main', 'specialisations', 'gallery', 'blogs'].every((g) => groups.has(g)), 'all groups listed');
    pass(`page list: ${list.length} URLs across ${[...groups].join(', ')}`);

    console.info('\nPage SEO');
    assert.equal((await call('GET', '/page')).status, 400);
    assert.equal((await call('GET', '/page?path=/no-such-page/')).status, 404);
    pass('page read: 400 without path, 404 for unknown URL');
    const read = await ok<{ page: { path: string }; override: Doc; original: { title: string; status: number } | null }>('GET', `/page?path=${encodeURIComponent('/contact-us')}`);
    assert.equal(read.page.path, PAGE, 'path is normalised');
    assert.ok(read.original && read.original.status === 200 && read.original.title, 'original live metadata is inspected');
    const originalTitle = read.original.title;
    pass(`page read: normalised path, live original title "${originalTitle}"`);

    const override = {
      focusKeyword: 'contact vsm',
      metaTitle: `${STAMP} Contact VSM Mumbai`,
      metaDescription: `${STAMP} – reach the Valia School of Management admissions team in Andheri, Mumbai by phone, email or visit.`,
      canonicalUrl: '/contact-us/',
      robots: 'noindex, follow',
      metaKeywords: 'vsm contact, pgdm mumbai',
      ogTitle: `${STAMP} share title`,
      ogDescription: `${STAMP} share description`,
      ogImage: '/images/brand/vsm-logo.svg',
      schemaJson: JSON.stringify({ '@context': 'https://schema.org', '@type': 'ContactPage', name: STAMP }),
    };
    const pageUrl = `/page?path=${encodeURIComponent(PAGE)}`;
    const bad = await call('PATCH', pageUrl, { content: { ...override, schemaJson: '{oops' }, updatedAt: read.override.updatedAt });
    assert.equal(bad.status, 400);
    assert.equal((await call('PATCH', pageUrl, { content: { ...override, robots: 'sometimes' }, updatedAt: read.override.updatedAt })).status, 400);
    assert.equal((await call('PATCH', pageUrl, { content: { ...override, canonicalUrl: 'javascript:alert(1)' }, updatedAt: read.override.updatedAt })).status, 400);
    assert.equal((await call('PATCH', pageUrl, { content: { ...override, extra: 1 }, updatedAt: read.override.updatedAt })).status, 400);
    pass('page save: invalid JSON-LD, robots value, canonical and unknown fields → 400');
    const saved = await ok<Doc & { score: number }>('PATCH', pageUrl, { content: override, updatedAt: read.override.updatedAt });
    assert.ok(saved.updatedAt && saved.score > 0);
    const row = await prisma.websiteSetting.findFirst({ where: { key: { startsWith: 'seo.page.' }, value: { path: '$.path', equals: PAGE } } });
    assert.equal((row?.value as Record<string, unknown>)?.metaTitle, override.metaTitle, 'stored in MySQL');
    assert.ok((row?.key.length ?? 999) <= 120);
    pass(`page save: persisted to ${row!.key} (score ${saved.score})`);
    assert.equal((await call('PATCH', pageUrl, { content: override, updatedAt: read.override.updatedAt })).status, 409);
    pass('page save: stale updatedAt → 409');
    const reread = await ok<{ override: Doc }>('GET', pageUrl);
    assert.equal(reread.override.content.metaDescription, override.metaDescription);
    pass('page read: round-trip matches');
    const listed = (await ok<{ path: string; hasOverride: boolean; robots: string }[]>('GET', '/pages')).find((p) => p.path === PAGE);
    assert.ok(listed?.hasOverride && listed.robots === 'noindex, follow');
    pass('page list: shows the override and robots status');

    console.info('\nWebsite rendering of the page override');
    const pub = (await (await fetch(`${base}/api/v1/public/seo?path=${encodeURIComponent(PAGE)}`)).json()) as { data: { page: Record<string, string> | null } };
    assert.equal(pub.data.page?.metaTitle, override.metaTitle);
    pass('public SEO API returns the override');
    const html = await pageHtml('/contact-us');
    assert.equal(titleOf(html), override.metaTitle.replace(/&/g, '&amp;'));
    assert.equal(metaContent(html, 'description'), override.metaDescription);
    assert.equal(metaContent(html, 'robots'), 'noindex, follow');
    assert.equal(metaContent(html, 'keywords')?.replace(/,\s*/g, ','), override.metaKeywords.replace(/,\s*/g, ','));
    assert.equal(metaContent(html, 'og:title'), override.ogTitle);
    assert.equal(metaContent(html, 'og:description'), override.ogDescription);
    assert.ok(metaContent(html, 'og:image')?.endsWith('/images/brand/vsm-logo.svg'));
    assert.ok(canonicalOf(html).endsWith('/contact-us/'));
    assert.ok(html.includes(`"name":"${STAMP}"`), 'page JSON-LD rendered');
    pass('rendered /contact-us: title, description, robots, keywords, share tags, canonical and JSON-LD');
    const originalHtml = await pageHtml('/contact-us', { 'x-vsm-seo-original': '1' });
    assert.equal(titleOf(originalHtml), originalTitle.replace(/&/g, '&amp;'));
    pass('original mode ignores the override (used for admin placeholders)');
    const sitemapWithout = await (await fetch(`${web}/sitemap.xml`)).text();
    assert.ok(!sitemapWithout.includes('/contact-us/<'), 'noindex page excluded from sitemap');
    pass('sitemap.xml excludes the noindex page');

    console.info('\nGlobal settings');
    const global = await ok<Doc>('GET', '/global');
    const globalUrl = '/global';
    assert.equal((await call('PATCH', globalUrl, { content: { ...global.content, googleVerification: '<meta name="x">' }, updatedAt: global.updatedAt })).status, 400);
    assert.equal((await call('PATCH', globalUrl, { content: { ...global.content, enableSitelinksSearchbox: true, siteSearchUrl: '' }, updatedAt: global.updatedAt })).status, 400);
    assert.equal((await call('PATCH', globalUrl, { content: { ...global.content, contactEmail: 'nope' }, updatedAt: global.updatedAt })).status, 400);
    pass('global save: pasted meta tag, sitelinks without search URL, bad email → 400');
    const newGlobal = await ok<Doc>('PATCH', globalUrl, {
      content: { ...global.content, googleVerification: 'vsm-audit-google-123', bingVerification: 'BINGAUDIT42', twitterHandle: 'ValiaSOM', enableOrgSchema: true },
      updatedAt: global.updatedAt,
    });
    assert.equal(newGlobal.content.twitterHandle, '@ValiaSOM');
    assert.equal((await call('PATCH', globalUrl, { content: global.content, updatedAt: global.updatedAt })).status, 409);
    pass('global save: persisted, handle normalised, stale → 409');
    const home = await pageHtml('/');
    assert.equal(metaContent(home, 'google-site-verification'), 'vsm-audit-google-123');
    assert.equal(metaContent(home, 'msvalidate.01'), 'BINGAUDIT42');
    assert.ok(home.includes('"@type":"EducationalOrganization"'), 'Organization JSON-LD on home');
    pass('rendered /: verification meta tags and Organization schema');

    console.info('\nTracking & custom code');
    const tracking = await ok<Doc>('GET', '/tracking');
    assert.equal((await call('PATCH', '/tracking', { content: { ...tracking.content, googleAnalyticsId: 'UA-123' }, updatedAt: tracking.updatedAt })).status, 400);
    assert.equal((await call('PATCH', '/tracking', { content: { ...tracking.content, gtmContainerId: 'GTM' }, updatedAt: tracking.updatedAt })).status, 400);
    pass('tracking save: invalid GA4 / GTM IDs → 400');
    await ok('PATCH', '/tracking', {
      content: { ...tracking.content, googleAnalyticsId: 'G-AUDIT12345', customHeadCode: '<meta name="vsm-audit-head" content="yes">', customBodyEndCode: '<div id="vsm-audit-end"></div>' },
      updatedAt: tracking.updatedAt,
    });
    assert.equal((await call('PATCH', '/tracking', { content: tracking.content, updatedAt: tracking.updatedAt })).status, 409);
    pass('tracking save: persisted, stale → 409');
    const tracked = await pageHtml('/contact-us');
    assert.ok(tracked.includes('googletagmanager.com/gtag/js?id=G-AUDIT12345'), 'GA4 tag rendered');
    assert.equal(metaContent(tracked, 'vsm-audit-head'), 'yes');
    assert.ok(tracked.includes('id="vsm-audit-end"'));
    pass('rendered page: GA4 tag, custom head and body-end code');

    console.info('\nRobots & sitemaps');
    const robots = await ok<{ content: string; updatedAt: string | null; sitemaps: { file: string; urlCount: number }[] }>('GET', '/robots');
    assert.equal(robots.sitemaps.length, 3);
    assert.equal((await call('PATCH', '/robots', { content: '   ', updatedAt: robots.updatedAt })).status, 400);
    pass('robots save: empty file → 400');
    const robotsText = `${robots.content}\r\n# ${STAMP}`;
    const savedRobots = await ok<{ content: string }>('PATCH', '/robots', { content: robotsText, updatedAt: robots.updatedAt });
    assert.ok(!savedRobots.content.includes('\r'));
    assert.equal((await call('PATCH', '/robots', { content: robotsText, updatedAt: robots.updatedAt })).status, 409);
    const backup = await ok<{ backup: { content: string } | null }>('GET', '/robots');
    assert.ok(backup.backup?.content, 'backup kept');
    pass('robots save: persisted, CRLF normalised, stale → 409, backup kept');
    const liveRobots = await (await fetch(`${web}/robots.txt`)).text();
    assert.ok(liveRobots.includes(`# ${STAMP}`));
    pass('website /robots.txt serves the saved file');
    for (const map of robots.sitemaps) {
      const res = await fetch(`${web}/${map.file}`);
      const xml = await res.text();
      assert.equal(res.status, 200);
      assert.ok(res.headers.get('content-type')?.includes('xml'));
      assert.equal((xml.match(/<url>/g) ?? []).length, map.urlCount, `${map.file} URL count`);
    }
    pass(`sitemaps: ${robots.sitemaps.map((m) => `${m.file} (${m.urlCount})`).join(', ')}`);

    console.info('\nSEO audit');
    const audit = await ok<{ total: number; reachable: number; averageScore: number; durationMs: number; rows: { path: string; status: number; score: number; title: string; hasOverride: boolean; checks: { id: string }[] }[] }>('GET', '/audit');
    assert.equal(audit.total, list.length);
    const contactRow = audit.rows.find((r) => r.path === PAGE);
    assert.ok(contactRow?.hasOverride && contactRow.title === override.metaTitle && contactRow.checks.some((c) => c.id === 'robots'));
    pass(`audit: ${audit.reachable}/${audit.total} reachable, average score ${audit.averageScore}, ${Math.round(audit.durationMs / 1000)}s`);
    const failing = audit.rows.filter((r) => r.status !== 200);
    if (failing.length) console.info(`    (non-200: ${failing.map((r) => `${r.path} ${r.status}`).join(', ')})`);

    console.info('\nReset');
    const current = await ok<{ override: Doc }>('GET', pageUrl);
    assert.equal((await call('DELETE', `${pageUrl}&updatedAt=${encodeURIComponent(read.override.updatedAt ?? '2000-01-01T00:00:00.000Z')}`)).status, 409);
    await ok('DELETE', `${pageUrl}&updatedAt=${encodeURIComponent(current.override.updatedAt!)}`);
    assert.equal(await prisma.websiteSetting.count({ where: { key: row!.key } }), 0);
    const resetHtml = await pageHtml('/contact-us');
    assert.equal(titleOf(resetHtml), originalTitle.replace(/&/g, '&amp;'));
    pass('page reset: stale → 409, row deleted, website back to its own metadata');

    const logs = await prisma.auditLog.count({ where: { entityType: 'seo', actor: { email: user.email } } });
    assert.ok(logs >= 5);
    pass(`audit log: ${logs} seo entries recorded`);
  } finally {
    await prisma.websiteSetting.deleteMany({ where: { key: { startsWith: 'seo.' }, NOT: { key: { in: before.map((r) => r.key) } } } });
    for (const r of before) {
      await prisma.websiteSetting.upsert({
        where: { key: r.key },
        update: { value: r.value as Prisma.InputJsonValue, isPublic: r.isPublic },
        create: { key: r.key, value: r.value as Prisma.InputJsonValue, isPublic: r.isPublic },
      });
    }
    await cleanupUser();
  }

  console.info(`\n${checks} checks passed. Restored ${before.length} seo.* row(s).`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
