// Audits the AIMA PGDM page CMS against the running API and MySQL. Restores DB rows after run.
import 'dotenv/config';
import assert from 'node:assert/strict';
import { unlink } from 'node:fs/promises';
import { resolve } from 'node:path';
import { PrismaClient } from '@prisma/client';
import argon2 from 'argon2';
import { aimaDefaults, aimaMasterDefaults } from '../packages/contracts/src/academics-aima';

const prisma = new PrismaClient();
const base = process.env.API_BASE_URL ?? 'http://localhost:4000';
const origin = process.env.ADMIN_ORIGIN ?? 'http://localhost:5173';
const password = 'Temporary-Aima-Academics-Audit!2026';
const users = [
  { email: 'aima-academics-audit@example.invalid', role: 'editor' },
  { email: 'aima-academics-viewer-audit@example.invalid', role: 'viewer' },
];
const AUDIT_NAME = 'Temporary AIMA Academics audit';
const PNG_1PX = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
  'base64'
);

const sectionKeys = Object.keys(aimaDefaults);
const masterKeys = Object.keys(aimaMasterDefaults).map((k) => `master-${k}`);
const allKeys = [...sectionKeys, ...masterKeys];
const DB_PREFIX = 'academics-aima.';
const AICTE_ISOLATION_KEYS = ['academics.hero', 'academics.faq', 'academics.master-hero'];
const HOME_ISOLATION_KEYS = ['home.hero', 'home.why', 'home.faq'];

type Doc = { content: unknown; updatedAt: string | null };

async function requireJson<T>(res: Response, label: string): Promise<T> {
  const text = await res.text();
  if (!res.ok) {
    throw new Error(`${label}: HTTP ${res.status} ${res.statusText}. Body: ${text.slice(0, 500)}`);
  }
  try {
    return JSON.parse(text) as T;
  } catch {
    throw new Error(`${label}: expected JSON, got: ${text.slice(0, 200)}`);
  }
}

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
      data: {
        email,
        name: AUDIT_NAME,
        passwordHash: await argon2.hash(password),
        userRoles: { create: { role: { connect: { code: role } } } },
      },
    });
  }

  const keysToGuard = [...allKeys.map((k) => `${DB_PREFIX}${k}`), ...AICTE_ISOLATION_KEYS, ...HOME_ISOLATION_KEYS];
  const before = new Map((await prisma.websiteSetting.findMany({ where: { key: { in: keysToGuard } } })).map((r) => [r.key, r]));
  const aicteProbe = await fetch(`${base}/api/v1/public/academics`);
  const aicteBefore = await requireJson<{ data: { sections: unknown } }>(aicteProbe, 'GET /public/academics');
  const homeProbe = await fetch(`${base}/api/v1/public/home`);
  const homeBefore = await requireJson<{ data: { sections: unknown } }>(homeProbe, 'GET /public/home');
  const uploadedNames: string[] = [];
  const checks: string[] = [];
  const pass = (name: string) => {
    checks.push(name);
    console.info(`  ✓ ${name}`);
  };

  try {
    const aimaRes = await fetch(`${base}/api/v1/public/academics/aima`);
    const pub = (await requireJson<{ data: { sections: Record<string, unknown>; masters: Record<string, unknown> } }>(aimaRes, 'GET /public/academics/aima')).data;
    assert.deepEqual(Object.keys(pub.sections).sort(), [...sectionKeys].sort());
    assert.deepEqual(Object.keys(pub.masters).sort(), Object.keys(aimaMasterDefaults).sort());
    pass('Public AIMA endpoint returns every section key and master key');

    assert.equal((await fetch(`${base}/api/v1/admin/academics/aima`)).status, 401);
    const viewer = await login(users[1].email);
    const viewerHeroRes = await fetch(`${base}/api/v1/admin/academics/aima/hero`, { headers: viewer });
    assert.equal(viewerHeroRes.status, 200);
    const viewerHero: Doc = (await requireJson<{ data: Doc }>(viewerHeroRes, 'admin GET aima/hero')).data;
    assert.equal(
      (await fetch(`${base}/api/v1/admin/academics/aima/hero`, { method: 'PATCH', headers: viewer, body: JSON.stringify(viewerHero) })).status,
      403
    );
    pass('Unauthenticated 401; viewer can read AIMA but not PATCH');

    const h = await login(users[0].email);
    const get = async (key: string): Promise<Doc> =>
      (await requireJson<{ data: Doc }>(await fetch(`${base}/api/v1/admin/academics/aima/${key}`, { headers: h }), `admin GET aima/${key}`)).data;
    const patch = (key: string, body: unknown) =>
      fetch(`${base}/api/v1/admin/academics/aima/${key}`, { method: 'PATCH', headers: h, body: JSON.stringify(body) });
    const bulk = (sections: Record<string, Doc>) =>
      fetch(`${base}/api/v1/admin/academics/aima`, { method: 'PATCH', headers: h, body: JSON.stringify({ sections }) });

    const list = (await requireJson<{ data: Record<string, Doc> }>(await fetch(`${base}/api/v1/admin/academics/aima`, { headers: h }), 'admin GET aima list')).data;
    assert.deepEqual(Object.keys(list).sort(), [...allKeys].sort());
    for (const key of allKeys) {
      const doc = await get(key);
      assert.deepEqual(doc.content, list[key].content, `${key}: single read matches list`);
      const res = await patch(key, doc);
      assert.equal(res.status, 200, `${key}: save unchanged: ${await res.clone().text()}`);
      const saved: Doc = (await requireJson<{ data: Doc }>(res, `${key} PATCH`)).data;
      assert.deepEqual(saved.content, doc.content, `${key}: round-trip`);
      assert.equal((await patch(key, doc)).status, 409, `${key}: stale updatedAt must conflict`);
    }
    pass(`All ${allKeys.length} AIMA documents load, save, reject stale saves`);

    const masterHero = await get('master-hero');
    const hero = await get('hero');
    const fees = await get('fees');
    const courseMod = await get('course-modules');
    const editedSlides = {
      ...masterHero.content,
      items: [...(masterHero.content as { items: unknown[] }).items].reverse(),
    };
    (editedSlides.items as { enabled?: boolean }[])[0].enabled = !(editedSlides.items as { enabled?: boolean }[])[0].enabled;
    const editedHero = {
      ...hero.content,
      breadcrumb: [...(hero.content as { breadcrumb: unknown[] }).breadcrumb, { label: 'Audit', href: '/contact-us/' }],
    };
    const editedFees = {
      ...(fees.content as object),
      rows: [...(fees.content as { rows: unknown[] }).rows, { label: 'Audit Fee Row', amount: 'INR 1/-' }],
    };
    const editedCourse = structuredClone(courseMod.content) as {
      year1Module1Heading: string;
      year1Rows: { left: string; right: string }[];
    };
    editedCourse.year1Module1Heading += ' Audit';
    editedCourse.year1Rows.push({ left: 'Audit L', right: 'Audit R' });
    const bulkRes = await bulk({
      'master-hero': { content: editedSlides, updatedAt: masterHero.updatedAt },
      hero: { content: editedHero, updatedAt: hero.updatedAt },
      fees: { content: editedFees, updatedAt: fees.updatedAt },
      'course-modules': { content: editedCourse, updatedAt: courseMod.updatedAt },
    });
    assert.equal(bulkRes.status, 200, await bulkRes.clone().text());
    const bulkSaved = (await requireJson<{ data: Record<string, Doc> }>(bulkRes, 'aima bulk PATCH')).data;
    assert.equal((bulkSaved.fees.content as { rows: unknown[] }).rows.length, (fees.content as { rows: unknown[] }).rows.length + 1);
    assert.match(String((bulkSaved['course-modules'].content as { year1Module1Heading: string }).year1Module1Heading), /Audit/);
    pass('Bulk PATCH: banner items reorder/toggle, breadcrumb row, fee row, course-modules heading + row');

    const faq = await get('faq');
    const badFaq = { ...(faq.content as object), title: '  ' };
    assert.equal((await bulk({ faq: { content: badFaq, updatedAt: faq.updatedAt } })).status, 400);
    pass('Validation rejects invalid FAQ title');

    const up = await fetch(`${base}/api/v1/admin/home-media`, {
      method: 'POST',
      headers: { ...h, 'Content-Type': 'image/png', 'X-File-Name': 'aima-audit.png' },
      body: PNG_1PX,
    });
    assert.equal(up.status, 201, await up.clone().text());
    const asset = (await requireJson<{ data: { src: string; width: number; height: number } }>(up, 'home-media upload')).data;
    uploadedNames.push(asset.src.split('/').pop());
    const od = await get('other-details');
    const withCert = {
      ...(od.content as object),
      certificateImage: {
        ...(od.content as { certificateImage: { src: string; alt: string; width: number; height: number } }).certificateImage,
        src: asset.src,
        width: asset.width,
        height: asset.height,
      },
    };
    const imgSave = await patch('other-details', { content: withCert, updatedAt: od.updatedAt });
    assert.equal(imgSave.status, 200);
    assert.equal(
      (await requireJson<{ data: { content: { certificateImage: { src: string } } } }>(imgSave, 'other-details PATCH')).data.content.certificateImage
        .src,
      asset.src
    );
    pass('Uploaded /cms-media image persists on AIMA other-details.certificateImage');

    const aicteAfterRes = await fetch(`${base}/api/v1/public/academics`);
    const aicteAfter = await requireJson<{ data: { sections: unknown } }>(aicteAfterRes, 'GET /public/academics (after)');
    assert.deepEqual(aicteAfter.data.sections, aicteBefore.data.sections, 'AICTE public payload unchanged');
    const homeAfterRes = await fetch(`${base}/api/v1/public/home`);
    const homeAfter = await requireJson<{ data: { sections: unknown } }>(homeAfterRes, 'GET /public/home (after)');
    assert.deepEqual(homeAfter.data.sections, homeBefore.data.sections, 'Home public payload unchanged');
    for (const key of AICTE_ISOLATION_KEYS) {
      const row = await prisma.websiteSetting.findUnique({ where: { key } });
      assert.equal(row?.updatedAt.toISOString() ?? null, before.get(key)?.updatedAt.toISOString() ?? null, `${key} untouched`);
    }
    for (const key of HOME_ISOLATION_KEYS) {
      const row = await prisma.websiteSetting.findUnique({ where: { key } });
      assert.equal(row?.updatedAt.toISOString() ?? null, before.get(key)?.updatedAt.toISOString() ?? null, `${key} untouched`);
    }
    pass('AICTE and Home rows unchanged by AIMA audit');

    const aimaLogs = await prisma.auditLog.count({
      where: { entityType: 'academics_aima', actor: { email: users[0].email } },
    });
    assert(aimaLogs > 4, 'Audit log entries for academics_aima');
    pass('Saves write audit entries with entityType academics_aima');
  } finally {
    for (const key of keysToGuard) {
      const original = before.get(key);
      if (original) {
        await prisma.websiteSetting.update({
          where: { key },
          data: { value: original.value as object, isPublic: original.isPublic },
        });
      } else {
        await prisma.websiteSetting.deleteMany({ where: { key } });
      }
    }
    for (const name of uploadedNames) {
      await prisma.mediaAsset.deleteMany({ where: { storageKey: `home/${name}` } });
      await unlink(resolve(process.env.MEDIA_ROOT ?? 'uploads/home', name)).catch(() => undefined);
    }
  }
  console.info(`✓ Passed ${checks.length} AIMA PGDM CMS checks.`);
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
