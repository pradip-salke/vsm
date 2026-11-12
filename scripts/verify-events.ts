/**
 * Audits every Events page CMS (events.<page>.* keys only).
 * Usage: tsx scripts/verify-events.ts [--cleanup]
 *
 * Per page: list, PATCH → MySQL → GET round-trip + stale 409 for every document, bulk save,
 * banner + master add / edit / toggle / reorder / delete (image uploads for albums and photos,
 * nested album photos), validation, public API, isolation from other pages and other CMS areas.
 * Restores all touched rows afterward. Requires API + MySQL.
 */
import 'dotenv/config';
import assert from 'node:assert/strict';
import { unlink } from 'node:fs/promises';
import { resolve } from 'node:path';
import { PrismaClient } from '@prisma/client';
import argon2 from 'argon2';
import { eventsPages, eventsPageSlugs, type EventsPageSlug } from '../packages/contracts/src/events';

const prisma = new PrismaClient();
const base = process.env.API_BASE_URL ?? 'http://localhost:4000';
const origin = process.env.ADMIN_ORIGIN ?? 'http://localhost:5173';
const PNG_1PX = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
  'base64'
);
const OUTSIDE_KEYS = ['home.master-events', 'home.events', 'academics.master-events', 'placements.alumni.master-alumni', 'admissions.application-form.faq'];

const user = { email: 'events-audit@example.invalid', role: 'editor' as const };
const AUDIT_NAME = 'Temporary Events CMS audit';
const password = 'Temporary-Events-Audit!2026';

type Doc = { content: Record<string, unknown>; updatedAt: string | null };
type Item = Record<string, unknown>;
type Pages = Record<string, { path: string; navTitle: string; sections: Record<string, Item>; masters: Record<string, { items: Item[] }>; masterLabels: Record<string, string>; masterSections: Record<string, string> }>;
const pages = eventsPages as unknown as Pages;

const docKeys = (slug: EventsPageSlug) => [
  ...Object.keys(pages[slug]!.sections),
  ...Object.keys(pages[slug]!.masters).map((k) => `master-${k}`),
];

async function cleanupUser() {
  const u = await prisma.adminUser.findUnique({ where: { email: user.email } });
  if (u?.name === AUDIT_NAME) {
    await prisma.auditLog.deleteMany({ where: { actorId: u.id } });
    await prisma.adminUser.delete({ where: { id: u.id } });
  }
}

async function snapshot(prefixes: string[]) {
  const rows = await prisma.websiteSetting.findMany({ where: { OR: prefixes.map((p) => ({ key: { startsWith: p } })) } });
  return new Map(rows.map((r) => [r.key, r.updatedAt.toISOString()]));
}

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

  const guarded = await prisma.websiteSetting.findMany({ where: { key: { startsWith: 'events.' } } });
  const guardedKeys = eventsPageSlugs.flatMap((slug) => docKeys(slug).map((k) => `events.${slug}.${k}`));
  const outsideBefore = new Map(
    (await prisma.websiteSetting.findMany({ where: { key: { in: OUTSIDE_KEYS } } })).map((r) => [r.key, r.updatedAt.toISOString()])
  );
  const uploadedNames: string[] = [];
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

    const upload = async (name: string) => {
      const res = await fetch(`${base}/api/v1/admin/home-media`, {
        method: 'POST',
        headers: { ...h, 'Content-Type': 'image/png', 'X-File-Name': name },
        body: PNG_1PX,
      });
      assert.equal(res.status, 201, await res.clone().text());
      const data = ((await res.json()) as { data: { src: string; width: number; height: number } }).data;
      uploadedNames.push(data.src.split('/').pop()!);
      return data;
    };
    const publicPage = async (slug: string) => {
      const res = await fetch(`${base}/api/v1/public/events/${slug}`);
      assert.equal(res.status, 200);
      return ((await res.json()) as { data: { sections: Record<string, Item>; masters: Record<string, { items: Item[] }> } }).data;
    };

    for (const slug of eventsPageSlugs) {
      const page = pages[slug]!;
      console.info(`\n${page.navTitle} (${page.path})`);
      const adminBase = `${base}/api/v1/admin/events/${slug}`;
      const getOne = async (key: string): Promise<Doc> => {
        const res = await fetch(`${adminBase}/${key}`, { headers: h });
        assert.equal(res.status, 200, `GET ${slug}/${key}: ${res.status}`);
        return ((await res.json()) as { data: Doc }).data;
      };
      const patchOne = (key: string, body: unknown) =>
        fetch(`${adminBase}/${key}`, { method: 'PATCH', headers: h, body: JSON.stringify(body) });
      const saveOk = async (key: string, content: unknown, updatedAt: string | null) => {
        const res = await patchOne(key, { content, updatedAt });
        assert.equal(res.status, 200, `${slug}/${key}: ${await res.clone().text()}`);
        return ((await res.json()) as { data: Doc }).data;
      };

      const otherPrefixes = eventsPageSlugs.filter((s) => s !== slug).map((s) => `events.${s}.`);
      const othersBefore = await snapshot(otherPrefixes);
      const keys = docKeys(slug);

      const listed = (await (await fetch(adminBase, { headers: h })).json()) as { data: Record<string, Doc> };
      assert.deepEqual(Object.keys(listed.data).sort(), [...keys].sort());
      const counts = Object.keys(page.masters)
        .filter((k) => k !== 'hero')
        .map((k) => `${(listed.data[`master-${k}`]!.content.items as Item[]).length} ${page.masterLabels[k]!.toLowerCase()}`);
      pass(`List returns all ${keys.length} documents with existing content${counts.length ? ` (${counts.join(', ')})` : ''}`);

      for (const key of keys) {
        const doc = await getOne(key);
        const saved = await saveOk(key, doc.content, doc.updatedAt);
        assert.deepEqual(saved.content, doc.content, `${slug}/${key}: round-trip`);
        assert.equal((await patchOne(key, { content: doc.content, updatedAt: doc.updatedAt })).status, 409, `${slug}/${key}: stale 409`);
        assert(await prisma.websiteSetting.findUnique({ where: { key: `events.${slug}.${key}` } }), `${slug}/${key}: in MySQL`);
      }
      pass('Every section and master persists to MySQL, round-trips and rejects stale saves (409)');

      const tag = `Audit ${slug}`;
      const hero = await getOne('hero');
      const nav = await getOne('page-nav');
      const intro = await getOne('intro');
      const sections: Record<string, Doc> = {
        hero: { content: { breadcrumb: [...(hero.content.breadcrumb as Item[]).slice(0, -1), { label: tag, href: '' }] }, updatedAt: hero.updatedAt },
        'page-nav': { content: { ...nav.content, links: [...(nav.content.links as Item[]).reverse(), { label: tag, href: '/audit/' }] }, updatedAt: nav.updatedAt },
        intro: { content: { ...intro.content, title: tag, description: `<p>${tag} <script>alert(1)</script><strong>description</strong></p>` }, updatedAt: intro.updatedAt },
      };
      if ('pagination' in page.sections) {
        const pg = await getOne('pagination');
        sections.pagination = { content: { links: [...(pg.content.links as Item[]), { label: '3', href: '/events/gallery/3/' }] }, updatedAt: pg.updatedAt };
      }
      const bulkRes = await fetch(adminBase, { method: 'PATCH', headers: h, body: JSON.stringify({ sections }) });
      assert.equal(bulkRes.status, 200, await bulkRes.clone().text());
      const bulk = ((await bulkRes.json()) as { data: Record<string, Doc> }).data;
      assert.equal(bulk.intro!.content.title, tag);
      assert.doesNotMatch(String(bulk.intro!.content.description), /<script/);
      assert.match(String(bulk.intro!.content.description), /<strong>description<\/strong>/);
      assert.equal((bulk['page-nav']!.content.links as Item[]).at(-1)?.label, tag);
      pass(`Bulk "Update ${page.navTitle} Page": breadcrumb, page links (reorder + add), heading + sanitised description${sections.pagination ? ', pagination (add page)' : ''}`);

      const badNav = await patchOne('page-nav', { content: { ...nav.content, links: [{ label: '', href: 'javascript:alert(1)' }] }, updatedAt: bulk['page-nav']!.updatedAt });
      assert.equal(badNav.status, 400);
      pass('Validation rejects an empty link label / unsafe link (400)');

      const heroMaster = await getOne('master-hero');
      const slides = structuredClone(heroMaster.content.items) as Item[];
      const banner = await upload(`events-${slug}-banner.png`);
      const withSlide = [
        ...slides,
        { ...slides[0], title: `${tag} banner`, image: { src: banner.src, alt: 'Audit banner', width: banner.width, height: banner.height }, enabled: false },
      ].reverse();
      const heroSaved = await saveOk('master-hero', { items: withSlide }, heroMaster.updatedAt);
      assert.deepEqual(heroSaved.content.items, withSlide);
      const pubHero = await publicPage(slug);
      assert(!pubHero.masters.hero!.items.some((s) => s.title === `${tag} banner`), 'Inactive banner hidden publicly');
      assert.equal(pubHero.sections.intro!.title, tag);
      pass('Page Banner: add slide with uploaded image, toggle inactive, reorder; public API reflects saved content');

      for (const master of Object.keys(page.masters).filter((k) => k !== 'hero')) {
        const mKey = `master-${master}`;
        const label = page.masterLabels[master]!;
        const doc = await getOne(mKey);
        const original = structuredClone(doc.content.items) as Item[];
        let added: Item;
        let invalid: Item;
        let edit: (item: Item) => Item;
        let isAdded: (item: Item) => boolean;

        if (master === 'albums') {
          const cover = await upload(`events-${slug}-cover.png`);
          const photo = await upload(`events-${slug}-photo.png`);
          const img = (src: string, alt: string) => ({ src, alt, width: cover.width, height: cover.height });
          added = { title: `${tag} album`, image: img(cover.src, 'Audit cover'), images: [img(cover.src, 'Audit photo 1'), img(photo.src, 'Audit photo 2')], enabled: true };
          isAdded = (item) => item.title === `${tag} album`;
          edit = (item) => ({ ...item, title: `${tag} album edited`, images: [...(item.images as Item[])].reverse(), enabled: false });
          invalid = { ...added, images: [{ ...img(photo.src, ''), alt: '' }] };
        } else if (master === 'photos') {
          const img = await upload(`events-${slug}-photo.png`);
          added = { src: img.src, alt: `${tag} photo`, width: img.width, height: img.height, enabled: true };
          isAdded = (item) => String(item.alt).startsWith(`${tag} photo`);
          edit = (item) => ({ ...item, alt: `${tag} photo edited`, enabled: false });
          invalid = { ...added, src: 'https://evil.example/x.png' };
        } else if (master === 'speakers') {
          added = { name: `${tag} speaker`, role: 'Audit role', enabled: true };
          isAdded = (item) => String(item.name).startsWith(`${tag} speaker`);
          edit = (item) => ({ ...item, role: 'Audit role edited', enabled: false });
          invalid = { ...added, name: '' };
        } else {
          added = { title: `${tag} video`, role: 'Audit role', videoUrl: 'https://vsmedu.com/wp-content/uploads/2025/09/IMG_9591.mp4', enabled: true };
          isAdded = (item) => String(item.title).startsWith(`${tag} video`);
          edit = (item) => ({ ...item, title: `${tag} video edited`, videoUrl: '/videos/audit.mp4', enabled: false });
          invalid = { ...added, videoUrl: '' };
        }

        let saved = await saveOk(mKey, { items: [...original, added] }, doc.updatedAt);
        const row = await prisma.websiteSetting.findUnique({ where: { key: `events.${slug}.${mKey}` } });
        assert(JSON.stringify(row?.value).includes(tag), `${mKey}: added item persisted`);

        const edited = (saved.content.items as Item[]).map((item) => (isAdded(item) ? edit(item) : item));
        const reordered = [edited.at(-1)!, ...edited.slice(0, -1)];
        saved = await saveOk(mKey, { items: reordered }, saved.updatedAt);
        const first = (saved.content.items as Item[])[0]!;
        assert.deepEqual(first, edit(added));
        assert.equal(first.enabled, false);

        const pub = await publicPage(slug);
        assert.equal(pub.masters[master]!.items.length, original.filter((i) => i.enabled !== false).length, 'Inactive item hidden publicly');
        assert(!pub.masters[master]!.items.some(isAdded));

        assert.equal((await patchOne(mKey, { content: { items: [invalid] }, updatedAt: saved.updatedAt })).status, 400, `${mKey}: invalid item rejected`);

        saved = await saveOk(mKey, { items: (saved.content.items as Item[]).slice(1) }, saved.updatedAt);
        assert.deepEqual(saved.content.items, original);
        const uploads = master === 'albums' ? ' (cover + nested photos uploaded and reordered)' : master === 'photos' ? ' (uploaded image)' : '';
        pass(`${label}: add${uploads}, edit, toggle, reorder, validation, delete`);

        const sectionKey = page.masterSections[master];
        if (sectionKey) {
          const s = await getOne(sectionKey);
          const ss = await saveOk(sectionKey, { ...s.content, title: `${tag} heading` }, s.updatedAt);
          assert.equal(ss.content.title, `${tag} heading`);
          pass(`${label}: section heading saves from master screen (${sectionKey})`);
        }
      }

      assert.deepEqual(await snapshot(otherPrefixes), othersBefore, 'Other Events pages unchanged');
      pass('Other Events pages unchanged (page isolation)');
    }

    console.info('');
    for (const k of OUTSIDE_KEYS) {
      const row = await prisma.websiteSetting.findUnique({ where: { key: k } });
      assert.equal(row?.updatedAt.toISOString() ?? null, outsideBefore.get(k) ?? null, `${k} unchanged`);
    }
    pass('Home / AICTE upcoming events, Placements and Admissions rows unchanged');

    assert.equal((await fetch(`${base}/api/v1/admin/events/not-a-page`, { headers: h })).status, 404);
    assert.equal((await fetch(`${base}/api/v1/admin/events/gallery/master-unknown`, { headers: h })).status, 404);
    pass('Unknown Events page / master returns 404');

    const audits = await prisma.auditLog.count({ where: { entityType: 'events', actor: { email: user.email } } });
    assert(audits >= guardedKeys.length);
    pass(`Saves write audit log (events × ${audits})`);

    console.info(`\n✓ Passed ${checks} Events CMS checks across ${eventsPageSlugs.length} pages`);
  } finally {
    const before = new Map(guarded.map((r) => [r.key, r]));
    for (const key of guardedKeys) {
      const prev = before.get(key);
      if (prev) {
        await prisma.websiteSetting.update({
          where: { key },
          data: { value: prev.value as object, isPublic: prev.isPublic, updatedAt: prev.updatedAt },
        });
      } else {
        await prisma.websiteSetting.deleteMany({ where: { key } });
      }
    }
    for (const name of uploadedNames) {
      await prisma.mediaAsset.deleteMany({ where: { storageKey: `home/${name}` } });
      await unlink(resolve(process.env.MEDIA_ROOT ?? 'uploads/home', name)).catch(() => undefined);
    }
    await cleanupUser();
  }
}

main()
  .catch((err) => {
    console.error('Verification failed:', err);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
