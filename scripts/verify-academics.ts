// Audits the AICTE PGDM page CMS against the running API and MySQL. Leaves saved content as it found it.
import 'dotenv/config';
import assert from 'node:assert/strict';
import { unlink } from 'node:fs/promises';
import { resolve } from 'node:path';
import { PrismaClient } from '@prisma/client';
import argon2 from 'argon2';
import { academicsDefaults, academicsMasterDefaults } from '../packages/contracts/src/academics';

const prisma = new PrismaClient();
const base = process.env.API_BASE_URL ?? 'http://localhost:4000';
const origin = process.env.ADMIN_ORIGIN ?? 'http://localhost:5173';
const password = 'Temporary-Academics-Audit!2026';
const users = [
  { email: 'academics-audit@example.invalid', role: 'editor' },
  { email: 'academics-viewer-audit@example.invalid', role: 'viewer' },
];
const AUDIT_NAME = 'Temporary Academics audit';
const PNG_1PX = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==', 'base64');

const sectionKeys = Object.keys(academicsDefaults);
const masterKeys = Object.keys(academicsMasterDefaults).map((key) => `master-${key}`);
const allKeys = [...sectionKeys, ...masterKeys];
const HOME_ISOLATION_KEYS = ['home.hero', 'home.why', 'home.faculty', 'home.events', 'home.tabs', 'home.about', 'home.fees', 'home.gallery'];

type Doc = { content: any; updatedAt: string | null };

async function cleanup() {
  for (const { email } of users) {
    const user = await prisma.adminUser.findUnique({ where: { email } });
    if (user?.name === AUDIT_NAME) {
      await prisma.auditLog.deleteMany({ where: { actorId: user.id } });
      await prisma.adminUser.delete({ where: { id: user.id } });
    }
  }
}

async function login(email: string) {
  const res = await fetch(`${base}/api/v1/auth/login`, {
    method: 'POST',
    headers: { Origin: origin, 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  assert.equal(res.status, 200, `Login must succeed for ${email}`);
  return { Cookie: res.headers.get('set-cookie')!.split(';')[0]!, Origin: origin, 'Content-Type': 'application/json' };
}

async function main() {
  await cleanup();
  if (process.argv.includes('--cleanup')) return;
  for (const { email, role } of users) {
    await prisma.adminUser.create({
      data: { email, name: AUDIT_NAME, passwordHash: await argon2.hash(password), userRoles: { create: { role: { connect: { code: role } } } } },
    });
  }

  // Snapshot so every row the audit touches can be restored or removed afterwards.
  const keysToGuard = [...allKeys.map((k) => `academics.${k}`), 'home.program-videos', 'home.master-program-videos', ...HOME_ISOLATION_KEYS];
  const before = new Map((await prisma.websiteSetting.findMany({ where: { key: { in: keysToGuard } } })).map((r) => [r.key, r]));
  const homeBefore = await (await fetch(`${base}/api/v1/public/home`)).json();
  const uploadedNames: string[] = [];
  const checks: string[] = [];
  const pass = (name: string) => { checks.push(name); console.info(`  ✓ ${name}`); };

  try {
    // Public endpoints
    const pub = (await (await fetch(`${base}/api/v1/public/academics`)).json()).data;
    assert.deepEqual(Object.keys(pub.sections).sort(), [...sectionKeys].sort());
    assert.deepEqual(Object.keys(pub.masters).sort(), Object.keys(academicsMasterDefaults).sort());
    const pv = (await (await fetch(`${base}/api/v1/public/academics/program-videos`)).json()).data;
    assert.equal(pv.section.title, pub.sections['program-videos'].title);
    pass('Public AICTE PGDM endpoints return every section and master');

    // Auth and permissions
    assert.equal((await fetch(`${base}/api/v1/admin/academics`)).status, 401);
    assert.equal((await fetch(`${base}/api/v1/admin/academics/hero`)).status, 401);
    const viewer = await login(users[1].email);
    assert.equal((await fetch(`${base}/api/v1/admin/academics/hero`, { headers: viewer })).status, 200);
    const viewerHero: Doc = (await (await fetch(`${base}/api/v1/admin/academics/hero`, { headers: viewer })).json()).data;
    assert.equal((await fetch(`${base}/api/v1/admin/academics/hero`, { method: 'PATCH', headers: viewer, body: JSON.stringify(viewerHero) })).status, 403);
    assert.equal((await fetch(`${base}/api/v1/admin/academics`, { method: 'PATCH', headers: viewer, body: JSON.stringify({ sections: {} }) })).status, 403);
    pass('Unauthenticated requests get 401; read-only role can read but not save (403)');

    const h = await login(users[0].email);
    const get = async (key: string): Promise<Doc> => (await (await fetch(`${base}/api/v1/admin/academics/${key}`, { headers: h })).json()).data;
    const patch = (key: string, body: unknown) => fetch(`${base}/api/v1/admin/academics/${key}`, { method: 'PATCH', headers: h, body: JSON.stringify(body) });
    const bulk = (sections: Record<string, Doc>) => fetch(`${base}/api/v1/admin/academics`, { method: 'PATCH', headers: h, body: JSON.stringify({ sections }) });

    // Admin list and per-section round trip of the current content (validates every field of every section)
    const list = (await (await fetch(`${base}/api/v1/admin/academics`, { headers: h })).json()).data;
    assert.deepEqual(Object.keys(list).sort(), [...allKeys].sort());
    for (const key of allKeys) {
      const doc = await get(key);
      assert.deepEqual(doc.content, list[key].content, `${key}: single read matches list`);
      const res = await patch(key, doc);
      assert.equal(res.status, 200, `${key}: saving unchanged content must validate: ${await res.clone().text()}`);
      const saved: Doc = (await res.json()).data;
      assert.deepEqual(saved.content, doc.content, `${key}: content round-trips unchanged`);
      assert.equal((await patch(key, doc)).status, 409, `${key}: stale updatedAt must conflict`);
    }
    pass(`All ${allKeys.length} documents (${sectionKeys.length} sections + ${masterKeys.length} masters) load, save and reject stale saves`);

    // Bulk update across sections: text, repeatable items, nested tables, banner slide rich subtitle
    const masterHero = await get('master-hero');
    const hero = await get('hero');
    const fees = await get('fees');
    const curriculum = await get('curriculum');
    const glance = await get('glance');
    const editedHeroSlides = {
      ...masterHero.content,
      items: masterHero.content.items.map((item: { subtitle?: string }, index: number) =>
        index === 0 ? { ...item, subtitle: 'Audit <script>alert(1)</script><strong>tagline</strong>' } : item
      ),
    };
    const editedHeroBreadcrumb = { ...hero.content, breadcrumb: [...hero.content.breadcrumb, { label: 'Audit', href: '/contact-us/' }] };
    const editedFees = { ...fees.content, rows: [...fees.content.rows, { label: 'Audit Fee', amount: 'INR 1/-' }] };
    const editedCurriculum = structuredClone(curriculum.content);
    editedCurriculum.years[1].rows[0].cells[1] += '\nAudit Elective (3)';
    const editedGlance = { ...glance.content, facts: glance.content.facts.slice(0, -1) };
    const bulkRes = await bulk({
      'master-hero': { content: editedHeroSlides, updatedAt: masterHero.updatedAt },
      hero: { content: editedHeroBreadcrumb, updatedAt: hero.updatedAt },
      fees: { content: editedFees, updatedAt: fees.updatedAt },
      curriculum: { content: editedCurriculum, updatedAt: curriculum.updatedAt },
      glance: { content: editedGlance, updatedAt: glance.updatedAt },
    });
    assert.equal(bulkRes.status, 200, await bulkRes.clone().text());
    const bulkSaved = (await bulkRes.json()).data;
    assert.equal(bulkSaved['master-hero'].content.items[0].subtitle, 'Audit <strong>tagline</strong>', 'Rich subtitle is sanitised server-side');
    assert.equal(bulkSaved.hero.content.breadcrumb.length, editedHeroBreadcrumb.breadcrumb.length);
    assert.equal(bulkSaved.fees.content.rows.length, fees.content.rows.length + 1);
    assert.match(bulkSaved.curriculum.content.years[1].rows[0].cells[1], /Audit Elective/);
    assert.equal(bulkSaved.glance.content.facts.length, glance.content.facts.length - 1);
    const reread = (await (await fetch(`${base}/api/v1/admin/academics`, { headers: h })).json()).data;
    assert.equal(reread['master-hero'].content.items[0].subtitle, 'Audit <strong>tagline</strong>', 'Bulk save persisted to MySQL');
    assert.equal((await bulk({ 'master-hero': { content: editedHeroSlides, updatedAt: masterHero.updatedAt } })).status, 409);
    pass('Bulk "Update AICTE PGDM Page" saves several sections atomically, adds/removes repeatable rows, edits nested tables, sanitises rich text');

    // Atomicity: a valid change plus an invalid one must save nothing
    const aboutNow = await get('about');
    const feesNow = await get('fees');
    const atomic = await bulk({
      fees: { content: { ...feesNow.content, title: 'Should not persist' }, updatedAt: feesNow.updatedAt },
      about: { content: { ...aboutNow.content, title: '' }, updatedAt: aboutNow.updatedAt },
    });
    assert.equal(atomic.status, 400);
    assert.notEqual((await get('fees')).content.title, 'Should not persist');
    pass('A bulk save with one invalid section saves nothing');

    // Validation
    const expect400 = async (label: string, key: string, content: unknown, path: RegExp) => {
      const doc = await get(key);
      const res = await bulk({ [key]: { content, updatedAt: doc.updatedAt } });
      const body = await res.json();
      assert.equal(res.status, 400, `${label}: expected 400`);
      assert(body.error.details.some((d: { path: string[] }) => path.test(d.path.join('.'))), `${label}: error path ${JSON.stringify(body.error.details)}`);
    };
    await expect400('Empty heading', 'about', { ...(await get('about')).content, title: '  ' }, /^about\.title$/);
    await expect400('Bad tab anchor', 'tabs', { links: [{ label: 'X', anchor: 'Not Valid!' }] }, /^tabs\.links\.0\.anchor$/);
    await expect400('Unsafe image path', 'why', { ...(await get('why')).content, image: { src: 'javascript:alert(1)', alt: '', width: 1, height: 1 } }, /^why\.image\.src$/);
    await expect400('Unsafe link', 'glance', { ...(await get('glance')).content, buttonHref: 'javascript:alert(1)' }, /^glance\.buttonHref$/);
    await expect400('Unknown field', 'fees', { ...(await get('fees')).content, extra: 'x' }, /^fees$/);
    await expect400('Missing step icon', 'admission', { ...(await get('admission')).content, steps: [{ icon: '', iconSize: 30, text: 'x' }] }, /^admission\.steps\.0\.icon$/);
    const unknown = await bulk({ nope: { content: {}, updatedAt: null } });
    assert.equal(unknown.status, 404);
    assert.equal((await fetch(`${base}/api/v1/admin/academics/nope`, { headers: h })).status, 404);
    pass('Validation rejects empty headings, bad anchors, unsafe image paths/links, unknown fields, missing icons and unknown sections');

    // Masters: add, toggle, reorder, delete; caption optional for gallery, videoLink for events, required caption for program videos
    for (const master of Object.keys(academicsMasterDefaults)) {
      const doc = await get(`master-${master}`);
      const items = structuredClone(doc.content.items);
      if (master === 'hero') {
        items.push({
          image: { src: '/images/figma/academics-banner.webp', alt: 'Audit slide', width: 1918, height: 820 },
          imagePosition: '50% 50%',
          mobileImagePosition: '50% 50%',
          title: 'Audit banner',
          subtitle: 'Audit',
          primaryText: 'Apply',
          primaryHref: '/admissions/application-form/',
          secondaryText: 'Enquire',
          secondaryHref: '#enquire-now',
          enabled: true,
        });
      } else {
        const slideBase = { image: { src: '/images/figma/life-vsm.webp', alt: 'Audit slide', width: 768, height: 432 }, href: '', enabled: true };
        if (master === 'program-videos') {
          items.push({ ...slideBase, caption: 'Audit caption' });
        } else if (master === 'events') {
          items.push({ ...slideBase, videoLink: '' });
        } else {
          items.push({ ...slideBase, caption: '' });
        }
      }
      items[0].enabled = !items[0].enabled;
      items.reverse();
      const res = await patch(`master-${master}`, { content: { items }, updatedAt: doc.updatedAt });
      assert.equal(res.status, 200, `${master}: ${await res.clone().text()}`);
      const saved: Doc = (await res.json()).data;
      assert.deepEqual(saved.content.items, items);
      const restored = await patch(`master-${master}`, { content: doc.content, updatedAt: saved.updatedAt });
      assert.equal(restored.status, 200);
    }
    const pvDoc = await get('master-program-videos');
    const noCaption = structuredClone(pvDoc.content.items);
    noCaption[0].caption = '';
    assert.equal((await patch('master-program-videos', { content: { items: noCaption }, updatedAt: pvDoc.updatedAt })).status, 400);
    pass('Program Videos, Gallery and Events masters support add, status toggle, reorder and delete');

    // Legacy program-video mirror is still kept in sync for the Home endpoint
    const legacy = await prisma.websiteSetting.findUnique({ where: { key: 'home.master-program-videos' } });
    assert.deepEqual(legacy?.value, (await get('master-program-videos')).content);
    pass('Legacy home.master-program-videos stays in sync');

    // Image upload → stored as media asset → usable in a section → served publicly
    const up = await fetch(`${base}/api/v1/admin/home-media`, { method: 'POST', headers: { ...h, 'Content-Type': 'image/png', 'X-File-Name': 'academics-audit.png' }, body: PNG_1PX });
    assert.equal(up.status, 201, await up.clone().text());
    const asset = (await up.json()).data;
    uploadedNames.push(asset.src.split('/').pop());
    assert.match(asset.src, /^\/cms-media\/.+\.webp$/);
    assert.equal((await fetch(`${base}${asset.src}`)).status, 200);
    const whyDoc = await get('why');
    const withImage = { ...whyDoc.content, image: { ...whyDoc.content.image, src: asset.src, width: asset.width, height: asset.height } };
    const imgSave = await patch('why', { content: withImage, updatedAt: whyDoc.updatedAt });
    assert.equal(imgSave.status, 200);
    assert.equal((await imgSave.json()).data.content.image.src, asset.src);
    const badUpload = await fetch(`${base}/api/v1/admin/home-media`, { method: 'POST', headers: { ...h, 'Content-Type': 'image/png' }, body: Buffer.from('not an image') });
    assert.equal(badUpload.status, 400);
    pass('Image upload is stored, served from /cms-media, saved into a section image, and invalid files are rejected');

    // Home page content is untouched and Home validation still uses Home's own schema
    const homeAfter = await (await fetch(`${base}/api/v1/public/home`)).json();
    assert.deepEqual(homeAfter.data.sections, homeBefore.data.sections, 'Home sections unchanged');
    for (const key of HOME_ISOLATION_KEYS) {
      const row = await prisma.websiteSetting.findUnique({ where: { key } });
      assert.equal(row?.updatedAt.toISOString() ?? null, before.get(key)?.updatedAt.toISOString() ?? null, `${key} untouched`);
    }
    const homeWhy = (await (await fetch(`${base}/api/v1/admin/home/why`, { headers: h })).json()).data;
    const staleHome = await fetch(`${base}/api/v1/admin/home`, { method: 'PATCH', headers: h, body: JSON.stringify({ sections: { why: { content: homeWhy.content, updatedAt: '2000-01-01T00:00:00.000Z' } } }) });
    assert.equal(staleHome.status, 409, 'Home "why" content still passes Home validation (reaches the conflict check)');
    pass('Home page rows and public Home content are untouched; Home validation unaffected');

    const logs = await prisma.auditLog.count({ where: { entityType: 'academics', actor: { email: users[0].email } } });
    assert(logs > allKeys.length, 'Audit log entries recorded');
    pass('Every save writes an audit log entry');
  } finally {
    // Restore the exact rows that existed before, and remove rows the audit created.
    for (const key of keysToGuard) {
      const original = before.get(key);
      if (original) await prisma.websiteSetting.update({ where: { key }, data: { value: original.value as object, isPublic: original.isPublic } });
      else await prisma.websiteSetting.deleteMany({ where: { key } });
    }
    for (const name of uploadedNames) {
      await prisma.mediaAsset.deleteMany({ where: { storageKey: `home/${name}` } });
      await unlink(resolve(process.env.MEDIA_ROOT ?? 'uploads/home', name)).catch(() => undefined);
    }
  }
  console.info(`✓ Passed ${checks.length} AICTE PGDM CMS checks.`);
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
