/**
 * Audits the Teaching Faculty page CMS (academics-faculty.* keys only).
 * Usage: tsx scripts/verify-academics-faculty.ts [--cleanup]
 *
 * PATCH → MySQL → GET for every section; bulk save; Page Banner + Faculty Profiles
 * add / edit / toggle / reorder / delete; image upload into a profile; public API;
 * isolation from Home Faculty Slider and other academic pages; audit log.
 * Restores all touched rows afterward. Requires API + MySQL.
 */
import 'dotenv/config';
import assert from 'node:assert/strict';
import { unlink } from 'node:fs/promises';
import { resolve } from 'node:path';
import { PrismaClient } from '@prisma/client';
import argon2 from 'argon2';
import { facultyMasterDefaults, facultyPageDefaults } from '../packages/contracts/src/academics-faculty';

const prisma = new PrismaClient();
const base = process.env.API_BASE_URL ?? 'http://localhost:4000';
const origin = process.env.ADMIN_ORIGIN ?? 'http://localhost:5173';
const PNG_1PX = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
  'base64'
);

const DB_PREFIX = 'academics-faculty.';
const ALL_KEYS = [
  ...Object.keys(facultyPageDefaults),
  ...Object.keys(facultyMasterDefaults).map((k) => `master-${k}`),
];
const ISOLATION_KEYS = [
  'home.master-faculty',
  'home.faculty',
  'academics.hero',
  'academics.master-hero',
  'academics-aima.master-hero',
];

const user = { email: 'faculty-audit@example.invalid', role: 'editor' as const };
const AUDIT_NAME = 'Temporary Faculty CMS audit';
const password = 'Temporary-Faculty-Audit!2026';

type Doc = { content: Record<string, unknown>; updatedAt: string | null };
type Profile = Record<string, unknown> & { name: string; enabled: boolean; image: Record<string, unknown> };

async function cleanupUser() {
  const u = await prisma.adminUser.findUnique({ where: { email: user.email } });
  if (u?.name === AUDIT_NAME) {
    await prisma.auditLog.deleteMany({ where: { actorId: u.id } });
    await prisma.adminUser.delete({ where: { id: u.id } });
  }
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

  const keysToGuard = ALL_KEYS.map((k) => `${DB_PREFIX}${k}`);
  const before = new Map((await prisma.websiteSetting.findMany({ where: { key: { in: keysToGuard } } })).map((r) => [r.key, r]));
  const isolationBefore = new Map(
    (await prisma.websiteSetting.findMany({ where: { key: { in: ISOLATION_KEYS } } })).map((r) => [r.key, r])
  );
  const uploadedNames: string[] = [];
  const checks: string[] = [];
  const pass = (name: string) => {
    checks.push(name);
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

    const adminBase = `${base}/api/v1/admin/academics/faculty`;
    const getOne = async (key: string): Promise<Doc> => {
      const res = await fetch(`${adminBase}/${key}`, { headers: h });
      assert.equal(res.status, 200, `GET ${key}: ${res.status}`);
      return ((await res.json()) as { data: Doc }).data;
    };
    const patchOne = (key: string, body: unknown) =>
      fetch(`${adminBase}/${key}`, { method: 'PATCH', headers: h, body: JSON.stringify(body) });

    const listed = (await (await fetch(adminBase, { headers: h })).json()) as { data: Record<string, Doc> };
    assert.deepEqual(Object.keys(listed.data).sort(), [...ALL_KEYS].sort(), 'List must return every Faculty document');
    const profilesListed = listed.data['master-profiles'].content.items as Profile[];
    assert.equal(profilesListed.length >= 1, true, 'Existing faculty profiles load into CMS');
    pass(`GET list returns all ${ALL_KEYS.length} documents (${profilesListed.length} faculty profiles loaded)`);

    for (const key of ALL_KEYS) {
      const doc = await getOne(key);
      const res = await patchOne(key, { content: doc.content, updatedAt: doc.updatedAt });
      assert.equal(res.status, 200, `${key}: save unchanged → ${await res.clone().text()}`);
      const saved = (await res.json()) as { data: Doc };
      assert.deepEqual(saved.data.content, doc.content, `${key}: round-trip`);
      assert.equal((await patchOne(key, { content: doc.content, updatedAt: doc.updatedAt })).status, 409, `${key}: stale 409`);
      const row = await prisma.websiteSetting.findUnique({ where: { key: `${DB_PREFIX}${key}` } });
      assert(row, `${key}: persisted in MySQL`);
    }
    pass('Every section and master saves to MySQL, round-trips, and rejects stale updatedAt (409)');

    const glance = await getOne('glance');
    const intro = await getOne('intro');
    const experience = await getOne('experience');
    const tabs = await getOne('tabs');
    const bulkRes = await fetch(adminBase, {
      method: 'PATCH',
      headers: h,
      body: JSON.stringify({
        sections: {
          glance: { content: { ...glance.content, title: 'Audit glance title' }, updatedAt: glance.updatedAt },
          intro: { content: { ...intro.content, title: 'Audit intro title' }, updatedAt: intro.updatedAt },
          experience: {
            content: { ...experience.content, body: '<p>Audit <script>alert(1)</script><strong>body</strong></p>' },
            updatedAt: experience.updatedAt,
          },
          tabs: {
            content: { ...tabs.content, links: [...(tabs.content.links as unknown[]), { label: 'Audit tab', anchor: 'audit-tab' }] },
            updatedAt: tabs.updatedAt,
          },
        },
      }),
    });
    assert.equal(bulkRes.status, 200, await bulkRes.clone().text());
    const bulkSaved = (await bulkRes.json()) as { data: Record<string, Doc> };
    assert.equal(bulkSaved.data.glance.content.title, 'Audit glance title');
    assert.doesNotMatch(String(bulkSaved.data.experience.content.body), /<script/);
    assert.match(String(bulkSaved.data.experience.content.body), /<strong>body<\/strong>/);
    assert.equal((bulkSaved.data.tabs.content.links as unknown[]).length, (tabs.content.links as unknown[]).length + 1);
    pass('Bulk "Update Faculty Page": glance, intro, experience (sanitised), tabs (repeatable add)');

    const badTab = await patchOne('tabs', {
      content: { links: [{ label: '', anchor: 'Bad Anchor' }] },
      updatedAt: bulkSaved.data.tabs.updatedAt,
    });
    assert.equal(badTab.status, 400, 'Invalid tab rejected');
    pass('Validation rejects empty labels / invalid anchors (400)');

    const hero = await getOne('master-hero');
    const heroItems = structuredClone(hero.content.items) as Record<string, unknown>[];
    heroItems.push({ ...heroItems[0], title: 'Audit banner', enabled: false });
    heroItems.reverse();
    const heroRes = await patchOne('master-hero', { content: { items: heroItems }, updatedAt: hero.updatedAt });
    assert.equal(heroRes.status, 200, await heroRes.clone().text());
    assert.deepEqual(((await heroRes.json()) as { data: Doc }).data.content.items, heroItems);
    pass('Page Banner master: add, toggle, reorder');

    const up = await fetch(`${base}/api/v1/admin/home-media`, {
      method: 'POST',
      headers: { ...h, 'Content-Type': 'image/png', 'X-File-Name': 'faculty-audit.png' },
      body: PNG_1PX,
    });
    assert.equal(up.status, 201, await up.clone().text());
    const uploaded = ((await up.json()) as { data: { src: string; width: number; height: number } }).data;
    uploadedNames.push(uploaded.src.split('/').pop()!);
    pass(`Image upload returns ${uploaded.src}`);

    let profiles = await getOne('master-profiles');
    const original = structuredClone(profiles.content.items) as Profile[];
    const added: Profile = {
      ...structuredClone(original[0]),
      name: 'Audit Faculty Member',
      expertise: 'Audit expertise',
      role: 'Audit Professor',
      experience: '10+ years',
      previous: 'Audit Co.',
      organisations: 'Org A, Org B',
      academic: 'Visiting faculty',
      image: { src: uploaded.src, alt: 'Portrait of Audit Faculty Member', width: uploaded.width, height: uploaded.height },
      enabled: true,
    };
    let res = await patchOne('master-profiles', { content: { items: [...original, added] }, updatedAt: profiles.updatedAt });
    assert.equal(res.status, 200, await res.clone().text());
    profiles = ((await res.json()) as { data: Doc }).data;
    const rowAfterAdd = await prisma.websiteSetting.findUnique({ where: { key: `${DB_PREFIX}master-profiles` } });
    assert(JSON.stringify(rowAfterAdd?.value).includes(uploaded.src), 'Uploaded profile image persisted in MySQL');
    pass('Faculty Profiles: add profile with uploaded photo (persisted)');

    const edited = (profiles.content.items as Profile[]).map((p) =>
      p.name === 'Audit Faculty Member' ? { ...p, role: 'Audit Dean', enabled: false } : p
    );
    const reordered = [edited[edited.length - 1]!, ...edited.slice(0, -1)];
    res = await patchOne('master-profiles', { content: { items: reordered }, updatedAt: profiles.updatedAt });
    assert.equal(res.status, 200, await res.clone().text());
    profiles = ((await res.json()) as { data: Doc }).data;
    const first = (profiles.content.items as Profile[])[0]!;
    assert.equal(first.name, 'Audit Faculty Member');
    assert.equal(first.role, 'Audit Dean');
    assert.equal(first.enabled, false);
    pass('Faculty Profiles: edit designation, toggle inactive, reorder to first');

    const pub = await fetch(`${base}/api/v1/public/academics/faculty`);
    assert.equal(pub.status, 200);
    const pubData = ((await pub.json()) as { data: { sections: Record<string, Record<string, unknown>>; masters: { profiles: { items: Profile[] } } } }).data;
    assert(!pubData.masters.profiles.items.some((p) => p.name === 'Audit Faculty Member'), 'Inactive profile hidden publicly');
    assert.equal(pubData.sections.glance.title, 'Audit glance title');
    assert.equal(typeof pubData.sections.hero.title, 'string');
    pass('Public API /public/academics/faculty serves saved sections and hides inactive profiles');

    const missingName = await patchOne('master-profiles', {
      content: { items: [{ ...original[0], name: '' }] },
      updatedAt: profiles.updatedAt,
    });
    assert.equal(missingName.status, 400, 'Profile without name rejected');
    pass('Validation rejects a profile without a name (400)');

    res = await patchOne('master-profiles', {
      content: { items: (profiles.content.items as Profile[]).filter((p) => p.name !== 'Audit Faculty Member') },
      updatedAt: profiles.updatedAt,
    });
    assert.equal(res.status, 200, await res.clone().text());
    assert.deepEqual(((await res.json()) as { data: Doc }).data.content.items, original);
    pass('Faculty Profiles: delete profile restores original list');

    for (const k of ISOLATION_KEYS) {
      const row = await prisma.websiteSetting.findUnique({ where: { key: k } });
      assert.equal(row?.updatedAt.toISOString() ?? null, isolationBefore.get(k)?.updatedAt.toISOString() ?? null, `${k} unchanged`);
    }
    pass('Home Faculty Slider, AICTE and AIMA rows unchanged (isolation)');

    const audits = await prisma.auditLog.count({ where: { entityType: 'academics_faculty', actor: { email: user.email } } });
    assert(audits >= ALL_KEYS.length, 'Audit log entries for academics_faculty');
    pass(`Saves write audit log (academics_faculty × ${audits})`);

    console.info(`✓ Passed ${checks.length} Faculty CMS checks`);
  } finally {
    for (const key of keysToGuard) {
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
