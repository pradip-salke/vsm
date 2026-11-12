/**
 * Audits every Placements page CMS (placements.<page>.* keys only).
 * Usage: tsx scripts/verify-placements.ts [--cleanup]
 *
 * Per page: list, PATCH → MySQL → GET round-trip + stale 409 for every document, bulk save,
 * master add / edit / toggle / reorder / delete (with image upload for image masters),
 * table and repeatable rows, validation, public API, isolation from other pages and other CMS areas.
 * Restores all touched rows afterward. Requires API + MySQL.
 */
import 'dotenv/config';
import assert from 'node:assert/strict';
import { unlink } from 'node:fs/promises';
import { resolve } from 'node:path';
import { PrismaClient } from '@prisma/client';
import argon2 from 'argon2';
import { placementsPages, placementsPageSlugs, type PlacementsPageSlug } from '../packages/contracts/src/placements';

const prisma = new PrismaClient();
const base = process.env.API_BASE_URL ?? 'http://localhost:4000';
const origin = process.env.ADMIN_ORIGIN ?? 'http://localhost:5173';
const PNG_1PX = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
  'base64'
);
const OUTSIDE_KEYS = [
  'home.master-recruiters',
  'home.recruiters',
  'admissions.mba-pgdm-admissions-process.master-hero',
  'admissions.pgdm-fee-structure.fees',
  'academics.master-hero',
];

const user = { email: 'placements-audit@example.invalid', role: 'editor' as const };
const AUDIT_NAME = 'Temporary Placements CMS audit';
const password = 'Temporary-Placements-Audit!2026';

type Doc = { content: Record<string, unknown>; updatedAt: string | null };
type Item = Record<string, unknown>;

const docKeys = (slug: PlacementsPageSlug) => [
  ...Object.keys(placementsPages[slug].sections),
  ...Object.keys(placementsPages[slug].masters).map((k) => `master-${k}`),
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

  const guarded = await prisma.websiteSetting.findMany({ where: { key: { startsWith: 'placements.' } } });
  const guardedKeys = placementsPageSlugs.flatMap((slug) => docKeys(slug).map((k) => `placements.${slug}.${k}`));
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

    for (const slug of placementsPageSlugs) {
      const page = placementsPages[slug];
      console.info(`\n${page.navTitle} (${page.path})`);
      const adminBase = `${base}/api/v1/admin/placements/${slug}`;
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

      const otherPrefixes = placementsPageSlugs.filter((s) => s !== slug).map((s) => `placements.${s}.`);
      const othersBefore = await snapshot(otherPrefixes);
      const keys = docKeys(slug);

      const listed = (await (await fetch(adminBase, { headers: h })).json()) as { data: Record<string, Doc> };
      assert.deepEqual(Object.keys(listed.data).sort(), [...keys].sort());
      pass(`List returns all ${keys.length} documents with existing content`);

      for (const key of keys) {
        const doc = await getOne(key);
        const saved = await saveOk(key, doc.content, doc.updatedAt);
        assert.deepEqual(saved.content, doc.content, `${slug}/${key}: round-trip`);
        assert.equal((await patchOne(key, { content: doc.content, updatedAt: doc.updatedAt })).status, 409, `${slug}/${key}: stale 409`);
        assert(await prisma.websiteSetting.findUnique({ where: { key: `placements.${slug}.${key}` } }), `${slug}/${key}: in MySQL`);
      }
      pass('Every section and master persists to MySQL, round-trips and rejects stale saves (409)');

      const hero = await getOne('hero');
      const nav = await getOne('page-nav');
      const firstTitled = Object.keys(page.sections).find((k) => typeof (page.sections as Record<string, Item>)[k].title === 'string' && k !== 'page-nav')!;
      const titled = await getOne(firstTitled);
      const tag = `Audit ${slug}`;
      const bulkRes = await fetch(adminBase, {
        method: 'PATCH',
        headers: h,
        body: JSON.stringify({
          sections: {
            hero: { content: { breadcrumb: [...(hero.content.breadcrumb as Item[]).slice(0, -1), { label: tag, href: '' }] }, updatedAt: hero.updatedAt },
            'page-nav': { content: { ...nav.content, links: [...(nav.content.links as Item[]), { label: tag, href: '/audit/' }] }, updatedAt: nav.updatedAt },
            [firstTitled]: { content: { ...titled.content, title: tag }, updatedAt: titled.updatedAt },
          },
        }),
      });
      assert.equal(bulkRes.status, 200, await bulkRes.clone().text());
      const bulk = ((await bulkRes.json()) as { data: Record<string, Doc> }).data;
      assert.equal(bulk[firstTitled].content.title, tag);
      assert.equal((bulk['page-nav'].content.links as Item[]).at(-1)?.label, tag);
      pass(`Bulk "Update ${page.navTitle} Page": breadcrumb, page links (add row), ${firstTitled} heading`);

      if ('intro' in page.sections) {
        const intro = await getOne('intro');
        const saved = await saveOk('intro', { ...intro.content, body: '<p>Audit <script>alert(1)</script><strong>body</strong></p>' }, intro.updatedAt);
        assert.doesNotMatch(String(saved.content.body), /<script/);
        assert.match(String(saved.content.body), /<strong>body<\/strong>/);
        pass('Rich-text intro saves sanitised HTML');
      }

      for (const key of ['highlights', 'cards', 'specialisation-table', 'salary-table'] as const) {
        if (!(key in page.sections)) continue;
        const doc = await getOne(key);
        const listKey = key.endsWith('table') ? 'rows' : 'items';
        const rows = structuredClone(doc.content[listKey]) as Item[];
        const added = Object.fromEntries(Object.entries(rows[0]!).map(([k, v]) => [k, k === 'href' ? '/audit/' : `${String(v)} audit`]));
        const next = [added, ...rows.slice(1).reverse(), rows[0]!];
        const saved = await saveOk(key, { ...doc.content, [listKey]: next }, doc.updatedAt);
        assert.deepEqual(saved.content[listKey], next);
        const trimmed = await saveOk(key, { ...doc.content, [listKey]: rows.slice(1) }, saved.updatedAt);
        assert.equal((trimmed.content[listKey] as Item[]).length, rows.length - 1);
        pass(`${page.labels[key as keyof typeof page.labels]}: add, reorder and delete rows`);
      }

      if ('specialisation-table' in page.sections) {
        const doc = await getOne('specialisation-table');
        const bad = await patchOne('specialisation-table', { content: { ...doc.content, rows: [{ specialisation: '', percentage: '1%', count: '1' }] }, updatedAt: doc.updatedAt });
        assert.equal(bad.status, 400);
        pass('Validation rejects a table row without a specialization (400)');
      }

      const heroMaster = await getOne('master-hero');
      const slides = structuredClone(heroMaster.content.items) as Item[];
      const banner = await upload(`placements-${slug}-banner.png`);
      const withSlide = [
        ...slides,
        { ...slides[0], title: `${tag} banner`, image: { src: banner.src, alt: 'Audit banner', width: banner.width, height: banner.height }, enabled: false },
      ].reverse();
      const heroSaved = await saveOk('master-hero', { items: withSlide }, heroMaster.updatedAt);
      assert.deepEqual(heroSaved.content.items, withSlide);
      pass('Page Banner: add slide with uploaded image, toggle inactive, reorder');

      const pubBanner = await fetch(`${base}/api/v1/public/placements/${slug}`);
      assert.equal(pubBanner.status, 200);
      const pubData = ((await pubBanner.json()) as { data: { sections: Record<string, Item>; masters: Record<string, { items: Item[] }> } }).data;
      assert(!pubData.masters.hero.items.some((s) => s.title === `${tag} banner`), 'Inactive banner hidden publicly');
      assert.equal(pubData.sections[firstTitled].title, tag);
      assert.equal(typeof pubData.sections.hero.title, 'string');
      pass('Public API serves saved sections and hides inactive banner slides');

      for (const master of Object.keys(page.masters).filter((k) => k !== 'hero')) {
        const mKey = `master-${master}`;
        const doc = await getOne(mKey);
        const original = structuredClone(doc.content.items) as Item[];
        const isAlumni = master === 'alumni';
        let added: Item;
        if (isAlumni) {
          added = { name: `${tag} alumnus`, qualification: 'PGDM', bio: 'Audit bio', enabled: true };
        } else {
          const img = await upload(`placements-${slug}-${master}.png`);
          added = { src: img.src, alt: `${tag} ${master}`, width: img.width, height: img.height, enabled: true };
        }
        const label = isAlumni ? String(added.name) : String(added.alt);
        const field = isAlumni ? 'name' : 'alt';

        let saved = await saveOk(mKey, { items: [...original, added] }, doc.updatedAt);
        const row = await prisma.websiteSetting.findUnique({ where: { key: `placements.${slug}.${mKey}` } });
        assert(JSON.stringify(row?.value).includes(label), `${mKey}: added item persisted`);

        const edited = (saved.content.items as Item[]).map((item) =>
          item[field] === label ? { ...item, ...(isAlumni ? { qualification: 'Audit edit' } : { alt: `${label} edited` }), enabled: false } : item
        );
        const reordered = [edited.at(-1)!, ...edited.slice(0, -1)];
        saved = await saveOk(mKey, { items: reordered }, saved.updatedAt);
        const first = (saved.content.items as Item[])[0]!;
        assert.equal(first.enabled, false);
        assert.equal(isAlumni ? first.qualification : first.alt, isAlumni ? 'Audit edit' : `${label} edited`);

        const pub = ((await (await fetch(`${base}/api/v1/public/placements/${slug}`)).json()) as { data: { masters: Record<string, { items: Item[] }> } }).data;
        assert.equal(pub.masters[master].items.length, original.filter((i) => i.enabled !== false).length, 'Inactive item hidden publicly');

        const invalid = isAlumni ? { ...added, name: '' } : { ...added, src: 'https://evil.example/x.png' };
        assert.equal((await patchOne(mKey, { content: { items: [invalid] }, updatedAt: saved.updatedAt })).status, 400, `${mKey}: invalid item rejected`);

        saved = await saveOk(mKey, { items: (saved.content.items as Item[]).slice(1) }, saved.updatedAt);
        assert.deepEqual(saved.content.items, original);
        pass(`${page.masterLabels[master as keyof typeof page.masterLabels]}: add${isAlumni ? '' : ' with upload'}, edit, toggle, reorder, validation, delete`);

        const sectionKey = (page.masterSections as Record<string, string>)[master];
        if (sectionKey) {
          const s = await getOne(sectionKey);
          const ss = await saveOk(sectionKey, { ...s.content, title: `${tag} heading` }, s.updatedAt);
          assert.equal(ss.content.title, `${tag} heading`);
          pass(`${page.masterLabels[master as keyof typeof page.masterLabels]}: section heading saves (${sectionKey})`);
        }
      }

      const othersAfter = await snapshot(otherPrefixes);
      assert.deepEqual(othersAfter, othersBefore, 'Other Placements pages unchanged');
      pass('Other Placements pages unchanged (page isolation)');
    }

    console.info('');
    for (const k of OUTSIDE_KEYS) {
      const row = await prisma.websiteSetting.findUnique({ where: { key: k } });
      assert.equal(row?.updatedAt.toISOString() ?? null, outsideBefore.get(k) ?? null, `${k} unchanged`);
    }
    pass('Home recruiters, Admissions and AICTE rows unchanged');

    assert.equal((await fetch(`${base}/api/v1/admin/placements/not-a-page`, { headers: h })).status, 404);
    pass('Unknown Placements page returns 404');

    const audits = await prisma.auditLog.count({ where: { entityType: 'placements', actor: { email: user.email } } });
    assert(audits >= guardedKeys.length);
    pass(`Saves write audit log (placements × ${audits})`);

    console.info(`\n✓ Passed ${checks} Placements CMS checks across ${placementsPageSlugs.length} pages`);
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
