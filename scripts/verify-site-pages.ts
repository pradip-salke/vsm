// Audits the About Us, Career and Blogs CMS (page sections, masters, blog posts) against the running API and MySQL.
// Restores page rows, deletes audit blog posts and uploaded media after the run.
import 'dotenv/config';
import assert from 'node:assert/strict';
import { unlink } from 'node:fs/promises';
import { resolve } from 'node:path';
import { PrismaClient } from '@prisma/client';
import argon2 from 'argon2';
import { aboutPages } from '../packages/contracts/src/about-pages';
import { careerPages } from '../packages/contracts/src/career-page';
import { blogPages } from '../packages/contracts/src/blogs';

const prisma = new PrismaClient();
const base = process.env.API_BASE_URL ?? 'http://localhost:4000';
const origin = process.env.ADMIN_ORIGIN ?? 'http://localhost:5173';
const password = 'Temporary-Site-Pages-Audit!2026';
const users = [
  { email: 'site-pages-audit@example.invalid', role: 'editor' },
  { email: 'site-pages-viewer-audit@example.invalid', role: 'viewer' },
];
const AUDIT_NAME = 'Temporary Site Pages audit';
const AUDIT_SLUG = 'zz-cms-audit-post';
const PNG_1PX = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==', 'base64');
const GROUP_PREFIXES = ['about.', 'career.', 'blogs.'];
const OTHER_PREFIXES = ['admissions.', 'academics.', 'academics-aima.', 'home.', 'placements.', 'events.'];

type Doc = { content: unknown; updatedAt: string | null };
type Img = { src: string; alt: string; width: number; height: number };
type Slide = { image: Img; title: string; enabled: boolean } & Record<string, unknown>;
type Registry = Record<string, { path: string; sections: Record<string, unknown>; masters: Record<string, { items: unknown[] }> }>;
type PublicPage = { path: string; sections: Record<string, unknown>; masters: Record<string, { items: unknown[] }> };

const groups: { group: string; adminBase: string; publicBase: string; registry: Registry }[] = [
  { group: 'about', adminBase: 'about', publicBase: 'about', registry: aboutPages as unknown as Registry },
  { group: 'career', adminBase: 'career', publicBase: 'career', registry: careerPages as unknown as Registry },
  { group: 'blogs', adminBase: 'blogs/pages', publicBase: 'blogs/pages', registry: blogPages as unknown as Registry },
];
const keysOf = (registry: Registry, slug: string) => [...Object.keys(registry[slug].sections), ...Object.keys(registry[slug].masters).map((k) => `master-${k}`)];

async function requireJson<T>(res: Response, label: string): Promise<T> {
  const text = await res.text();
  if (!res.ok) throw new Error(`${label}: HTTP ${res.status} ${res.statusText}. Body: ${text.slice(0, 600)}`);
  return JSON.parse(text) as T;
}

async function cleanup() {
  for (const { email } of users) {
    const user = await prisma.adminUser.findUnique({ where: { email } });
    if (user?.name === AUDIT_NAME) {
      await prisma.auditLog.deleteMany({ where: { actorId: user.id } });
      await prisma.adminUser.delete({ where: { id: user.id } });
    }
  }
  await prisma.blogPost.deleteMany({ where: { slug: { startsWith: AUDIT_SLUG } } });
}

async function login(email: string) {
  const res = await fetch(`${base}/api/v1/auth/login`, { method: 'POST', headers: { Origin: origin, 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password }) });
  assert.equal(res.status, 200, `Login must succeed for ${email}`);
  return { Cookie: res.headers.get('set-cookie')!.split(';')[0]!, Origin: origin, 'Content-Type': 'application/json' };
}

async function main() {
  await cleanup();
  if (process.argv.includes('--cleanup')) return;
  for (const { email, role } of users) {
    await prisma.adminUser.create({ data: { email, name: AUDIT_NAME, passwordHash: await argon2.hash(password), userRoles: { create: { role: { connect: { code: role } } } } } });
  }

  const before = new Map((await prisma.websiteSetting.findMany({ where: { OR: GROUP_PREFIXES.map((p) => ({ key: { startsWith: p } })) } })).map((r) => [r.key, r]));
  const othersBefore = new Map((await prisma.websiteSetting.findMany({ where: { OR: OTHER_PREFIXES.map((p) => ({ key: { startsWith: p } })) } })).map((r) => [r.key, r.updatedAt.toISOString()]));
  const homeBefore = await requireJson<{ data: { sections: unknown } }>(await fetch(`${base}/api/v1/public/home`), 'GET public home');
  const blogCountBefore = await prisma.blogPost.count();
  const uploadedNames: string[] = [];
  const checks: string[] = [];
  const pass = (name: string) => {
    checks.push(name);
    console.info(`  ✓ ${name}`);
  };
  const publicOf = async (publicBase: string, slug: string) => (await requireJson<{ data: PublicPage }>(await fetch(`${base}/api/v1/public/${publicBase}/${slug}`), `GET public ${publicBase}/${slug}`)).data;

  try {
    // 1. Public endpoints for every page
    let pageCount = 0;
    for (const { publicBase, registry } of groups) {
      for (const slug of Object.keys(registry)) {
        const pub = await publicOf(publicBase, slug);
        assert.equal(pub.path, registry[slug].path);
        for (const key of Object.keys(registry[slug].sections)) assert(key in pub.sections, `${publicBase}/${slug}: section ${key}`);
        assert.deepEqual(Object.keys(pub.masters).sort(), Object.keys(registry[slug].masters).sort());
        const firstSlide = registry[slug].masters.hero.items[0] as Slide | undefined;
        if (firstSlide) assert.equal((pub.sections.hero as { title?: string }).title, firstSlide.title, `${publicBase}/${slug}: banner slide merged into hero`);
        pageCount++;
      }
      assert.equal((await fetch(`${base}/api/v1/public/${publicBase}/not-a-page`)).status, 404);
    }
    assert.equal(pageCount, 15);
    pass(`Public endpoints serve all ${pageCount} pages (12 About Us, Career, Blog Listing, Blog Detail) with banner master; unknown page 404`);

    // 2. Auth / roles
    assert.equal((await fetch(`${base}/api/v1/admin/about/our-philosophy`)).status, 401);
    assert.equal((await fetch(`${base}/api/v1/admin/blog-posts`)).status, 401);
    const viewer = await login(users[1].email);
    const vDoc = (await requireJson<{ data: Doc }>(await fetch(`${base}/api/v1/admin/about/our-philosophy/values`, { headers: viewer }), 'viewer GET values')).data;
    assert.equal((await fetch(`${base}/api/v1/admin/about/our-philosophy/values`, { method: 'PATCH', headers: viewer, body: JSON.stringify(vDoc) })).status, 403);
    assert.equal((await fetch(`${base}/api/v1/admin/blog-posts?pageSize=1`, { headers: viewer })).status, 200);
    assert.equal((await fetch(`${base}/api/v1/admin/blog-posts`, { method: 'POST', headers: viewer, body: JSON.stringify({ title: 'Viewer post', slug: `${AUDIT_SLUG}-viewer` }) })).status, 403);
    pass('Unauthenticated 401; viewer can read pages and posts but cannot save pages or create posts (403)');

    const h = await login(users[0].email);
    const url = (adminBase: string, slug: string, key = '') => `${base}/api/v1/admin/${adminBase}/${slug}${key ? `/${key}` : ''}`;
    const get = async (adminBase: string, slug: string, key: string): Promise<Doc> => (await requireJson<{ data: Doc }>(await fetch(url(adminBase, slug, key), { headers: h }), `GET ${adminBase}/${slug}/${key}`)).data;
    const patch = (adminBase: string, slug: string, key: string, body: unknown) => fetch(url(adminBase, slug, key), { method: 'PATCH', headers: h, body: JSON.stringify(body) });
    const bulk = (adminBase: string, slug: string, sections: Record<string, Doc>) => fetch(url(adminBase, slug), { method: 'PATCH', headers: h, body: JSON.stringify({ sections }) });
    const ok = async (res: Response, label: string) => (await requireJson<{ data: Record<string, Doc> }>(res, label)).data;

    assert.equal((await fetch(url('about', 'not-a-page'), { headers: h })).status, 404);
    assert.equal((await fetch(url('about', 'our-philosophy', 'board'), { headers: h })).status, 404, 'section of another About page not addressable');
    assert.equal((await fetch(url('career', 'our-philosophy'), { headers: h })).status, 404, 'About page not reachable via Career API');
    assert.equal((await fetch(url('blogs/pages', 'career'), { headers: h })).status, 404, 'Career page not reachable via Blogs API');
    assert.equal((await fetch(url('about', 'infrastructure', 'master-openings'), { headers: h })).status, 404, 'About pages have no openings master');
    pass('Admin: unknown page 404; sections are only addressable on their own page and group');

    // 3. Every document: load existing content, unchanged round-trip, stale save 409
    let docCount = 0;
    for (const { adminBase, registry } of groups) {
      for (const slug of Object.keys(registry)) {
        const list = (await requireJson<{ data: Record<string, Doc> }>(await fetch(url(adminBase, slug), { headers: h }), `GET ${slug} list`)).data;
        assert.deepEqual(Object.keys(list).sort(), keysOf(registry, slug).sort());
        for (const key of keysOf(registry, slug)) {
          const doc = await get(adminBase, slug, key);
          assert.deepEqual(doc.content, list[key].content, `${slug}/${key}: single read matches list`);
          assert.notEqual(doc.updatedAt, null, `${slug}/${key}: seeded DB row exists`);
          const res = await patch(adminBase, slug, key, doc);
          assert.equal(res.status, 200, `${slug}/${key}: save unchanged: ${await res.clone().text()}`);
          const saved = (await requireJson<{ data: Doc }>(res, `${slug}/${key} PATCH`)).data;
          assert.deepEqual(saved.content, doc.content, `${slug}/${key}: round-trip unchanged`);
          assert.equal((await patch(adminBase, slug, key, doc)).status, 409, `${slug}/${key}: stale updatedAt must conflict`);
          docCount++;
        }
      }
    }
    pass(`All ${docCount} page documents load existing DB content, save unchanged, and reject stale saves (409)`);

    // Upload a test image for image fields
    const up = await fetch(`${base}/api/v1/admin/home-media`, { method: 'POST', headers: { ...h, 'Content-Type': 'image/png', 'X-File-Name': 'site-pages-audit.png' }, body: PNG_1PX });
    assert.equal(up.status, 201, await up.clone().text());
    const uploaded = (await requireJson<{ data: Img }>(up, 'upload')).data;
    const asset: Img = { src: uploaded.src, alt: uploaded.alt, width: uploaded.width, height: uploaded.height };
    uploadedNames.push(asset.src.split('/').pop()!);
    assert.match(asset.src, /^\/cms-media\/.+\.webp$/);
    pass('Image upload returns a /cms-media WebP asset');

    // 4. About Us pages
    {
      const slug = 'about-vsm-mba-pgdm-colleges-in-mumbai';
      const intro = await get('about', slug, 'intro');
      const vm = await get('about', slug, 'vision-mission');
      const v = structuredClone(vm.content) as { title: string; cards: { title: string; text: string; image: Img }[] };
      v.cards.push({ title: 'Audit Values', text: 'Audit card text', image: { ...asset, alt: 'Audit icon' } });
      v.cards.reverse();
      v.title = 'Audit Vision Heading';
      const res = await bulk('about', slug, {
        intro: { content: { body: '<p>Audit <strong>intro</strong><script>alert(1)</script> <a href="/contact-us/">contact</a></p>' }, updatedAt: intro.updatedAt },
        'vision-mission': { content: v, updatedAt: vm.updatedAt },
      });
      const saved = await ok(res, 'about-vsm bulk');
      assert.doesNotMatch((saved.intro.content as { body: string }).body, /script/);
      const pub = await publicOf('about', slug);
      const pv = pub.sections['vision-mission'] as typeof v;
      assert.equal(pv.cards.length, 3);
      assert.equal(pv.cards[0].title, 'Audit Values');
      assert.equal(pv.cards[0].image.src, asset.src);
      assert.equal(pv.title, 'Audit Vision Heading');
      assert.match((pub.sections.intro as { body: string }).body, /<strong>intro<\/strong>.*href="\/contact-us\/"/);
      pass('About VSM: rich intro (script stripped, link kept), vision/mission card add with uploaded icon + reorder + heading persist');
    }
    {
      const slug = 'our-philosophy';
      const values = await get('about', slug, 'values');
      const c = structuredClone(values.content) as { cards: { title: string; text: string }[] };
      c.cards.splice(1, 1);
      c.cards[0].text = 'Audit edited text';
      assert.equal((await patch('about', slug, 'values', { content: c, updatedAt: values.updatedAt })).status, 200);
      const pc = (await publicOf('about', slug)).sections.values as typeof c;
      assert.equal(pc.cards.length, 5);
      assert.equal(pc.cards[0].text, 'Audit edited text');
      const cur = await get('about', slug, 'values');
      const blank = structuredClone(cur.content) as typeof c;
      blank.cards[0].title = ' ';
      assert.equal((await patch('about', slug, 'values', { content: blank, updatedAt: cur.updatedAt })).status, 400);
      pass('Our Philosophy: value card delete + edit persist; blank card title rejected (400)');
    }
    {
      const slug = 'academic-advisory-board';
      const board = await get('about', slug, 'board');
      const b = structuredClone(board.content) as { profiles: { name: string; role: string; details: string[]; image: Img }[] };
      b.profiles.push({ name: 'Audit Member', role: 'Audit Role', details: ['Line 1', 'Line 2'], image: { ...asset, alt: 'Audit Member' } });
      [b.profiles[0], b.profiles[1]] = [b.profiles[1], b.profiles[0]];
      b.profiles[0].details.push('Audit extra detail');
      b.profiles.splice(2, 1);
      assert.equal((await patch('about', slug, 'board', { content: b, updatedAt: board.updatedAt })).status, 200);
      const pb = (await publicOf('about', slug)).sections.board as typeof b;
      assert.equal(pb.profiles.length, 7);
      assert.equal(pb.profiles.at(-1)!.name, 'Audit Member');
      assert.equal(pb.profiles[0].name, 'MR. RAMESH IYER');
      assert.equal(pb.profiles[0].details.at(-1), 'Audit extra detail');
      const cur = await get('about', slug, 'board');
      const extra = { ...(cur.content as object), eyebrow: 'foreign' };
      assert.equal((await patch('about', slug, 'board', { content: extra, updatedAt: cur.updatedAt })).status, 400);
      const noPhoto = structuredClone(cur.content) as typeof b;
      noPhoto.profiles[0].image.src = '';
      const noPhotoRes = await patch('about', slug, 'board', { content: noPhoto, updatedAt: cur.updatedAt });
      assert.equal(noPhotoRes.status, 400);
      const details = ((await noPhotoRes.json()) as { error: { details: { path: unknown[]; message: string }[] } }).error.details;
      assert.equal(details.length, 1, `one clear error for a missing photo: ${JSON.stringify(details)}`);
      assert.match(details[0].message, /image is required/i);
      pass('Advisory Board: profile add (uploaded photo), reorder, delete and detail-line edit persist; foreign fields and missing photo rejected with one clear error');
    }
    {
      const slug = 'trustee-message';
      const m = await get('about', slug, 'messages');
      const t = structuredClone(m.content) as { items: { name: string; body: string }[] };
      t.items[1].body = '<p>Audit message for <em>Mrs. Alka Valia</em></p>';
      t.items.reverse();
      assert.equal((await patch('about', slug, 'messages', { content: t, updatedAt: m.updatedAt })).status, 200);
      const pt = (await publicOf('about', slug)).sections.messages as typeof t;
      assert.equal(pt.items[1].body, '<p>Audit message for <em>Mrs. Alka Valia</em></p>');
      assert.equal(pt.items[0].name, 'Mr. Nilesh Mehta');
      pass('Trustee Message: rich trustee message edit + reorder persist');
    }
    {
      const slug = 'vice-chairman-message';
      const m = await get('about', slug, 'message');
      const vc = structuredClone(m.content) as { bridge: string[]; careers: string[]; signature: string[]; closing: string; image: Img };
      vc.bridge.push('Audit bridge point');
      vc.careers.splice(0, 1);
      vc.signature[1] = 'Audit Signatory';
      vc.closing = '<p>Audit closing</p>';
      vc.image = { ...asset, alt: 'Audit portrait' };
      assert.equal((await patch('about', slug, 'message', { content: vc, updatedAt: m.updatedAt })).status, 200);
      const pm = (await publicOf('about', slug)).sections.message as typeof vc;
      assert.equal(pm.bridge.at(-1), 'Audit bridge point');
      assert.equal(pm.careers.length, 7);
      assert.equal(pm.signature[1], 'Audit Signatory');
      assert.equal(pm.image.src, asset.src);
      pass('Vice Chairman Message: bullet lists, signature, closing rich text and replaced photo persist');
    }
    {
      const slug = 'director-message';
      const m = await get('about', slug, 'message');
      const d = structuredClone(m.content) as { pillars: { label: string; detail: string }[] };
      d.pillars.push({ label: 'Audit Pillar', detail: 'audit detail' });
      d.pillars.reverse();
      assert.equal((await patch('about', slug, 'message', { content: d, updatedAt: m.updatedAt })).status, 200);
      const pd = (await publicOf('about', slug)).sections.message as typeof d;
      assert.equal(pd.pillars.length, 5);
      assert.equal(pd.pillars[0].label, 'Audit Pillar');
      pass('Director Message: pillar add + reorder persist');
    }
    {
      const slug = 'affiliation-industry-leadership';
      const leaders = await get('about', slug, 'leaders');
      const past = await get('about', slug, 'past-presidents');
      const l = structuredClone(leaders.content) as { profiles: { name: string }[] };
      const pp = structuredClone(past.content) as { title: string; profiles: { name: string; role: string }[] };
      l.profiles.splice(0, 1);
      pp.profiles[0].role = '2019 - 2021';
      pp.title = 'Audit Past Presidents';
      await ok(await bulk('about', slug, { leaders: { content: l, updatedAt: leaders.updatedAt }, 'past-presidents': { content: pp, updatedAt: past.updatedAt } }), 'affiliation bulk');
      const pub = await publicOf('about', slug);
      assert.equal((pub.sections.leaders as typeof l).profiles.length, 5);
      assert.equal((pub.sections['past-presidents'] as typeof pp).profiles[0].role, '2019 - 2021');
      assert.equal((pub.sections['past-presidents'] as typeof pp).title, 'Audit Past Presidents');
      pass('Affiliation & Industry Leadership: leader delete, past-president tenure + heading edits persist (bulk)');
    }
    {
      const slug = 'infrastructure';
      const g = await get('about', slug, 'gallery');
      const gal = structuredClone(g.content) as { images: Img[] };
      gal.images.unshift({ ...asset, alt: 'Audit gallery image' });
      gal.images.splice(5, 2);
      [gal.images[1], gal.images[2]] = [gal.images[2], gal.images[1]];
      assert.equal((await patch('about', slug, 'gallery', { content: gal, updatedAt: g.updatedAt })).status, 200);
      const pg = (await publicOf('about', slug)).sections.gallery as typeof gal;
      assert.equal(pg.images.length, 16);
      assert.equal(pg.images[0].src, asset.src);
      const cur = await get('about', slug, 'gallery');
      const bad = structuredClone(cur.content) as typeof gal;
      bad.images[0].src = 'https://evil.example.com/x.png';
      assert.equal((await patch('about', slug, 'gallery', { content: bad, updatedAt: cur.updatedAt })).status, 400);
      pass('Infrastructure: gallery image upload/add, delete, reorder persist; off-site image source rejected');
    }
    {
      const slug = 'student-residence';
      const c = await get('about', slug, 'content');
      const nav = await get('about', slug, 'page-nav');
      const seo = await get('about', slug, 'seo');
      const n = structuredClone(nav.content) as { links: { label: string; href: string }[] };
      n.links.push({ label: 'Audit Link', href: '/about-us/infrastructure/' });
      await ok(
        await bulk('about', slug, {
          content: { content: { title: 'Audit Residence', body: '<p>Audit <a href="https://vsmedu.com/brochure.pdf" target="_blank" rel="noreferrer">brochure</a></p>' }, updatedAt: c.updatedAt },
          'page-nav': { content: n, updatedAt: nav.updatedAt },
          seo: { content: { metaTitle: 'Audit SEO Title', metaDescription: 'Audit description' }, updatedAt: seo.updatedAt },
        }),
        'residence bulk'
      );
      const pub = await publicOf('about', slug);
      assert.equal((pub.sections.content as { title: string }).title, 'Audit Residence');
      assert.match((pub.sections.content as { body: string }).body, /href="https:\/\/vsmedu\.com\/brochure\.pdf"/);
      assert.equal((pub.sections['page-nav'] as typeof n).links.at(-1)!.label, 'Audit Link');
      assert.equal((pub.sections.seo as { metaTitle: string }).metaTitle, 'Audit SEO Title');
      const cur = await get('about', slug, 'page-nav');
      const bad = structuredClone(cur.content) as typeof n;
      bad.links[0].href = 'javascript:alert(1)';
      assert.equal((await patch('about', slug, 'page-nav', { content: bad, updatedAt: cur.updatedAt })).status, 400);
      const curSeo = await get('about', slug, 'seo');
      assert.equal((await patch('about', slug, 'seo', { content: { metaTitle: '', metaDescription: 'x' }, updatedAt: curSeo.updatedAt })).status, 400);
      pass('Student Residence: content + brochure link, page-nav link add, SEO edit persist; javascript: link and empty meta title rejected');
    }
    {
      const nav = await get('about', 'director-message', 'page-nav');
      const n = structuredClone(nav.content) as { title: string };
      n.title = 'Audit nav title (director page only)';
      assert.equal((await patch('about', 'director-message', 'page-nav', { content: n, updatedAt: nav.updatedAt })).status, 200);
      for (const slug of Object.keys(aboutPages).filter((s) => s !== 'director-message')) {
        assert.notEqual(((await publicOf('about', slug)).sections['page-nav'] as { title: string }).title, n.title, `${slug} page-nav independent`);
      }
      pass('About Us page independence: the shared-looking side navigation is stored per page');
    }

    // 5. Banner masters (one page per group) — add with upload, disable, reorder, delete
    for (const [adminBase, publicBase, slug] of [['about', 'about', 'infrastructure'], ['career', 'career', 'career'], ['blogs/pages', 'blogs/pages', 'detail']] as const) {
      const registry = groups.find((g) => g.adminBase === adminBase)!.registry;
      const original = (registry[slug].masters.hero.items[0] as Slide).title;
      const m = await get(adminBase, slug, 'master-hero');
      const items = structuredClone((m.content as { items: Slide[] }).items);
      const added: Slide = { ...items[0], title: `Audit Banner ${slug}`, image: { ...asset } };
      let saved = (await requireJson<{ data: Doc }>(await patch(adminBase, slug, 'master-hero', { content: { items: [added, ...items] }, updatedAt: m.updatedAt }), 'add slide')).data;
      assert.equal(((await publicOf(publicBase, slug)).sections.hero as { title: string; image: Img }).title, `Audit Banner ${slug}`);
      const toggled = structuredClone((saved.content as { items: Slide[] }).items);
      toggled[0].enabled = false;
      saved = (await requireJson<{ data: Doc }>(await patch(adminBase, slug, 'master-hero', { content: { items: toggled }, updatedAt: saved.updatedAt }), 'toggle')).data;
      assert.equal(((await publicOf(publicBase, slug)).sections.hero as { title: string }).title, original, 'disabled slide skipped publicly');
      saved = (await requireJson<{ data: Doc }>(await patch(adminBase, slug, 'master-hero', { content: { items: [...(saved.content as { items: Slide[] }).items].reverse() }, updatedAt: saved.updatedAt }), 'reorder')).data;
      assert.equal((saved.content as { items: Slide[] }).items.at(-1)!.title, `Audit Banner ${slug}`);
      saved = (await requireJson<{ data: Doc }>(await patch(adminBase, slug, 'master-hero', { content: { items: (saved.content as { items: Slide[] }).items.slice(0, -1) }, updatedAt: saved.updatedAt }), 'delete')).data;
      assert.equal((saved.content as { items: Slide[] }).items.length, items.length);
      const noImg = structuredClone((saved.content as { items: Slide[] }).items);
      noImg[0].image.src = '';
      assert.equal((await patch(adminBase, slug, 'master-hero', { content: { items: noImg }, updatedAt: saved.updatedAt })).status, 400);
    }
    pass('Banner masters (About, Career, Blog Detail): uploaded slide add, publish/unpublish, reorder, delete persist; empty image rejected');

    // 6. Career page sections
    {
      const app = await get('career', 'career', 'application');
      const cta = await get('career', 'career', 'cta');
      const a = { ...(app.content as object), image: { ...asset, alt: 'Audit career image' }, formTitle: 'Audit Apply Heading', captionTitle: 'Audit Caption' };
      const ctaContent = structuredClone(cta.content) as Record<string, unknown>;
      const ctaKey = Object.keys(ctaContent).find((k) => typeof ctaContent[k] === 'string' && /title/i.test(k)) ?? Object.keys(ctaContent).find((k) => typeof ctaContent[k] === 'string')!;
      ctaContent[ctaKey] = 'Audit Career CTA';
      await ok(
        await bulk('career', 'career', { application: { content: a, updatedAt: app.updatedAt }, cta: { content: ctaContent, updatedAt: cta.updatedAt } }),
        'career bulk'
      );
      const pub = await publicOf('career', 'career');
      assert.equal((pub.sections.application as { formTitle: string; image: Img }).formTitle, 'Audit Apply Heading');
      assert.equal((pub.sections.application as { image: Img }).image.src, asset.src);
      assert.equal((pub.sections.cta as Record<string, unknown>)[ctaKey], 'Audit Career CTA');
      const home = await requireJson<{ data: { sections: Record<string, Record<string, unknown>> } }>(await fetch(`${base}/api/v1/public/home`), 'home');
      assert.notEqual(home.data.sections.cta?.[ctaKey], 'Audit Career CTA', 'Home CTA not shared with Career');
      const cur = await get('career', 'career', 'application');
      assert.equal((await patch('career', 'career', 'application', { content: { ...(cur.content as object), formTitle: '' }, updatedAt: cur.updatedAt })).status, 400);
      pass('Career: application image upload, form heading and Career-only CTA persist (Home CTA untouched); empty form title rejected');
    }


    // 7. Blog listing / detail page settings
    {
      const heading = await get('blogs/pages', 'listing', 'heading');
      const listing = await get('blogs/pages', 'listing', 'listing');
      await ok(
        await bulk('blogs/pages', 'listing', {
          heading: { content: { ...(heading.content as object), title: 'Audit Latest', intro: '<p>Audit <em>intro</em></p>' }, updatedAt: heading.updatedAt },
          listing: { content: { ...(listing.content as object), pageSize: 3, readMoreText: 'Audit read' }, updatedAt: listing.updatedAt },
        }),
        'listing bulk'
      );
      const pub = await publicOf('blogs/pages', 'listing');
      assert.equal((pub.sections.heading as { title: string }).title, 'Audit Latest');
      const posts = await requireJson<{ data: { items: unknown[]; pageSize: number; pageCount: number; total: number } }>(await fetch(`${base}/api/v1/public/blogs`), 'public blogs');
      assert.equal(posts.data.pageSize, 3);
      assert.equal(posts.data.items.length, 3);
      assert.equal(posts.data.pageCount, Math.ceil(posts.data.total / 3));
      const links = await get('blogs/pages', 'detail', 'links');
      assert.equal((await patch('blogs/pages', 'detail', 'links', { content: { ...(links.content as object), backLinkText: 'Audit back' }, updatedAt: links.updatedAt })).status, 200);
      assert.equal(((await publicOf('blogs/pages', 'detail')).sections.links as { backLinkText: string }).backLinkText, 'Audit back');
      assert.equal(((await publicOf('blogs/pages', 'listing')).sections.heading as { title: string }).title, 'Audit Latest', 'listing unaffected by detail edit');
      const cur = await get('blogs/pages', 'detail', 'links');
      assert.equal((await patch('blogs/pages', 'detail', 'links', { content: { ...(cur.content as object), backLinkText: '' }, updatedAt: cur.updatedAt })).status, 400);
      pass('Blog Listing/Detail settings: heading + rich intro, articles-per-page drives public pagination, detail link text persist independently; empty back link rejected');
    }

    // 8. Blog posts CRUD + publishing
    {
      const list = (await requireJson<{ data: { total: number; categories: { name: string; total: number }[]; statusCounts: Record<string, number> } }>(await fetch(`${base}/api/v1/admin/blog-posts?pageSize=5`, { headers: h }), 'admin list')).data;
      assert.equal(list.total, blogCountBefore);
      assert(list.total >= 55, 'imported blogs present');
      assert(list.categories.some((c) => c.name === 'Blog'));
      const existing = await prisma.blogPost.findFirstOrThrow({ where: { status: 'PUBLISHED' }, orderBy: { id: 'asc' } });
      const existingPub = await requireJson<{ data: { body: string; title: string } }>(await fetch(`${base}/api/v1/public/blogs/${existing.slug}`), 'existing public');
      assert.equal(existingPub.data.title, existing.title);
      assert(existingPub.data.body.length > 200, 'imported blog body served');
      pass(`Blog posts: ${list.total} imported posts listed with category/status counts; existing detail served publicly`);

      const ld = '<script type="application/ld+json">{"@context":"https://schema.org","@type":"FAQPage"}</script>';
      const input = {
        title: 'CMS Audit Post',
        slug: AUDIT_SLUG,
        excerpt: '<p>Audit excerpt</p>',
        body: `<h2>Heading</h2><p>Body <strong>bold</strong> <img src="${asset.src}" alt="inline"></p><script>alert(1)</script>${ld}`,
        coverImageUrl: asset.src,
        coverImageAlt: 'Audit cover',
        categories: ['Audit Category', 'Blog'],
        tags: ['audit-tag', 'PGDM'],
        authorName: 'Audit Author',
        authorRole: 'Professor',
        authorImageUrl: asset.src,
        authorBio: 'Audit bio',
        featured: true,
        status: 'DRAFT',
        publishedAt: null,
        seoTitle: 'Audit SEO',
        seoDescription: 'Audit SEO description',
        canonicalUrl: `/blogs/${AUDIT_SLUG}/`,
        ogImageUrl: asset.src,
        noIndex: true,
      };
      const createdRes = await fetch(`${base}/api/v1/admin/blog-posts`, { method: 'POST', headers: h, body: JSON.stringify(input) });
      assert.equal(createdRes.status, 201, await createdRes.clone().text());
      let post = (await requireJson<{ data: { id: number; updatedAt: string; body: string; status: string; publishedAt: string | null } & typeof input }>(createdRes, 'create')).data;
      assert.doesNotMatch(post.body, /alert\(1\)/);
      assert.match(post.body, /application\/ld\+json/);
      assert.match(post.body, /<img src="\/cms-media\//);
      assert.deepEqual(post.tags, ['audit-tag', 'PGDM']);
      const row = await prisma.blogPost.findUniqueOrThrow({ where: { id: post.id }, include: { seo: true } });
      assert.equal(row.coverImageUrl, asset.src);
      assert.equal(row.authorRole, 'Professor');
      assert.equal(row.featured, true);
      assert.equal(row.seo?.title, 'Audit SEO');
      assert.equal(row.seo?.noIndex, true);
      assert.equal((await fetch(`${base}/api/v1/public/blogs/${AUDIT_SLUG}`)).status, 404, 'draft hidden publicly');
      pass('Blog create: featured image, categories, tags, author, SEO and body (scripts removed, JSON-LD kept) persist to DB; draft hidden publicly');

      assert.equal((await fetch(`${base}/api/v1/admin/blog-posts`, { method: 'POST', headers: h, body: JSON.stringify({ ...input, slug: existing.slug }) })).status, 409, 'duplicate slug');
      assert.equal((await fetch(`${base}/api/v1/admin/blog-posts`, { method: 'POST', headers: h, body: JSON.stringify({ ...input, slug: 'Bad Slug!' }) })).status, 400);
      assert.equal((await fetch(`${base}/api/v1/admin/blog-posts`, { method: 'POST', headers: h, body: JSON.stringify({ ...input, slug: `${AUDIT_SLUG}-x`, coverImageUrl: 'javascript:alert(1)' }) })).status, 400);
      assert.equal((await fetch(`${base}/api/v1/admin/blog-posts`, { method: 'POST', headers: h, body: JSON.stringify({ ...input, slug: `${AUDIT_SLUG}-x`, title: '' }) })).status, 400);
      pass('Blog validation: duplicate slug 409, invalid slug / javascript: image / empty title 400');

      const updRes = await fetch(`${base}/api/v1/admin/blog-posts/${post.id}`, { method: 'PATCH', headers: h, body: JSON.stringify({ ...input, title: 'CMS Audit Post Edited', tags: ['audit-tag'], status: 'PUBLISHED', updatedAt: post.updatedAt }) });
      assert.equal(updRes.status, 200, await updRes.clone().text());
      const stale = post.updatedAt;
      post = (await requireJson<{ data: typeof post }>(updRes, 'update')).data;
      assert.equal((await fetch(`${base}/api/v1/admin/blog-posts/${post.id}`, { method: 'PATCH', headers: h, body: JSON.stringify({ ...input, updatedAt: stale }) })).status, 409, 'stale update conflicts');
      assert.equal(post.status, 'PUBLISHED');
      assert(post.publishedAt, 'publishedAt set on publish');
      const pubDetail = (await requireJson<{ data: typeof post }>(await fetch(`${base}/api/v1/public/blogs/${AUDIT_SLUG}`), 'public detail')).data;
      assert.equal(pubDetail.title, 'CMS Audit Post Edited');
      assert.equal(pubDetail.seoTitle, 'Audit SEO');
      assert.equal(pubDetail.authorName, 'Audit Author');
      const byCat = (await requireJson<{ data: { items: { slug: string; body?: string }[] } }>(await fetch(`${base}/api/v1/public/blogs?category=${encodeURIComponent('Audit Category')}`), 'by category')).data.items;
      assert.deepEqual(byCat.map((p) => p.slug), [AUDIT_SLUG]);
      assert.equal(byCat[0].body, undefined, 'listing omits body');
      assert.equal((await requireJson<{ data: { items: unknown[] } }>(await fetch(`${base}/api/v1/public/blogs?tag=PGDM&category=${encodeURIComponent('Audit Category')}`), 'by tag')).data.items.length, 0, 'removed tag no longer matches');
      pass('Blog update + publish: edits persist, stale save 409, published post appears on detail and category-filtered listing; tag removal reflected');

      let st = await fetch(`${base}/api/v1/admin/blog-posts/${post.id}/status`, { method: 'PATCH', headers: h, body: JSON.stringify({ status: 'DRAFT', updatedAt: post.updatedAt }) });
      post = (await requireJson<{ data: typeof post }>(st, 'unpublish')).data;
      assert.equal((await fetch(`${base}/api/v1/public/blogs/${AUDIT_SLUG}`)).status, 404, 'unpublished hidden');
      st = await fetch(`${base}/api/v1/admin/blog-posts/${post.id}/status`, { method: 'PATCH', headers: h, body: JSON.stringify({ status: 'PUBLISHED', updatedAt: post.updatedAt }) });
      post = (await requireJson<{ data: typeof post }>(st, 'republish')).data;
      assert.equal((await fetch(`${base}/api/v1/public/blogs/${AUDIT_SLUG}`)).status, 200, 'republished visible');
      assert.equal((await fetch(`${base}/api/v1/admin/blog-posts/${post.id}/status`, { method: 'PATCH', headers: h, body: JSON.stringify({ status: 'DRAFT', updatedAt: stale }) })).status, 409);
      const future = new Date(Date.now() + 7 * 864e5).toISOString();
      const sch = await fetch(`${base}/api/v1/admin/blog-posts/${post.id}`, { method: 'PATCH', headers: h, body: JSON.stringify({ ...input, status: 'PUBLISHED', publishedAt: future, updatedAt: post.updatedAt }) });
      post = (await requireJson<{ data: typeof post }>(sch, 'schedule')).data;
      assert.equal((await fetch(`${base}/api/v1/public/blogs/${AUDIT_SLUG}`)).status, 404, 'future publish date hidden until then');
      pass('Publishing workflow: unpublish hides, republish shows, stale status change 409, future publish date schedules the post');

      assert.equal((await fetch(`${base}/api/v1/admin/blog-posts/${post.id}`, { method: 'DELETE', headers: viewer })).status, 403);
      assert.equal((await fetch(`${base}/api/v1/admin/blog-posts/${post.id}`, { method: 'DELETE', headers: h })).status, 204);
      assert.equal((await fetch(`${base}/api/v1/admin/blog-posts/${post.id}`, { headers: h })).status, 404);
      assert.equal(await prisma.blogPost.count({ where: { id: post.id } }), 0);
      assert.equal(await prisma.seoMetadata.count({ where: { blogPostId: post.id } }), 0);
      assert.equal(await prisma.blogPost.count(), blogCountBefore);
      pass('Blog delete: viewer forbidden; editor delete removes the post and its SEO row from the DB');

      const logs = await prisma.auditLog.findMany({ where: { entityType: 'blog_post', entityId: String(post.id) }, select: { action: true } });
      for (const action of ['blog_post.create', 'blog_post.update', 'blog_post.unpublish', 'blog_post.publish', 'blog_post.delete']) assert(logs.some((l) => l.action === action), action);
      pass(`Blog audit log: ${logs.length} entries (create, update, publish, unpublish, delete)`);
    }

    // 9. Isolation from other CMS areas + audit logs
    {
      const othersAfter = await prisma.websiteSetting.findMany({ where: { OR: OTHER_PREFIXES.map((p) => ({ key: { startsWith: p } })) } });
      for (const row of othersAfter) assert.equal(row.updatedAt.toISOString(), othersBefore.get(row.key), `${row.key} untouched`);
      assert.equal(othersAfter.length, othersBefore.size);
      const home = await requireJson<{ data: { sections: unknown } }>(await fetch(`${base}/api/v1/public/home`), 'home after');
      assert.deepEqual(home.data.sections, homeBefore.data.sections);
      pass(`Home, Academics, AIMA, Admissions, Placements and Events content untouched (${othersAfter.length} rows compared)`);

      const logs = await prisma.auditLog.findMany({ where: { entityType: { in: ['about', 'career', 'blogs'] }, actor: { email: users[0].email } }, select: { entityType: true, entityId: true, action: true } });
      for (const slug of Object.keys(aboutPages)) assert(logs.some((l) => l.entityType === 'about' && l.entityId.startsWith(`${slug}.`)), `audit for about/${slug}`);
      assert(logs.some((l) => l.entityType === 'career' && l.entityId === 'career.application'));
      assert(logs.some((l) => l.entityType === 'blogs' && l.entityId.startsWith('listing.')) && logs.some((l) => l.entityType === 'blogs' && l.entityId.startsWith('detail.')));
      assert(logs.some((l) => l.action.endsWith('.bulk_update')) && logs.some((l) => l.action.endsWith('.update')));
      pass(`Page audit log: ${logs.length} entries covering every About Us page, Career and both Blog pages`);
    }
  } finally {
    const now = await prisma.websiteSetting.findMany({ where: { OR: GROUP_PREFIXES.map((p) => ({ key: { startsWith: p } })) } });
    for (const row of now) if (!before.has(row.key)) await prisma.websiteSetting.delete({ where: { key: row.key } });
    for (const [key, original] of before) await prisma.websiteSetting.update({ where: { key }, data: { value: original.value as object, isPublic: original.isPublic } });
    for (const name of uploadedNames) {
      await prisma.mediaAsset.deleteMany({ where: { storageKey: `home/${name}` } });
      await unlink(resolve(process.env.MEDIA_ROOT ?? 'uploads/home', name)).catch(() => undefined);
    }
  }
  console.info(`✓ Passed ${checks.length} About Us / Career / Blogs CMS checks.`);
}

main()
  .catch((err) => {
    console.error('Verification failed:', err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await cleanup();
    await prisma.$disconnect();
  });
