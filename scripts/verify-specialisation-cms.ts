/**
 * Audits one in-demand specialisation page CMS (academics-specs.* keys only).
 * Usage: tsx scripts/verify-specialisation-cms.ts <slug>
 * Example: tsx scripts/verify-specialisation-cms.ts mba-pgdm-in-human-resources-mumbai
 *
 * PATCH → MySQL → GET; hero master CRUD; bulk save; image upload; FAQ row edit.
 * Restores all touched rows afterward. Requires API + MySQL (same as verify-academics).
 */
import 'dotenv/config';
import assert from 'node:assert/strict';
import { unlink } from 'node:fs/promises';
import { resolve } from 'node:path';
import { PrismaClient } from '@prisma/client';
import argon2 from 'argon2';
import { academicsSpecialisationDefaults } from '../packages/contracts/src/academics-specialisations';

const prisma = new PrismaClient();
const base = process.env.API_BASE_URL ?? 'http://localhost:4000';
const origin = process.env.ADMIN_ORIGIN ?? 'http://localhost:5173';
const PNG_1PX = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
  'base64'
);

const DB_PREFIX = 'academics-specs.';

const sectionSuffixes = [
  'meta',
  'hero',
  'tabs',
  'glance',
  'overview',
  'why',
  'careers',
  'curriculum',
  'admission',
  'faq',
  'internships',
  'testimonials',
] as const;

/** Other programme slugs whose DB rows must not change during this audit (FAQ + hero sample). */
const SIBLINGS: Record<string, string[]> = {
  'financial-management-specialisation': ['mba-pgdm-in-human-resources-mumbai'],
  'mba-pgdm-in-human-resources-mumbai': ['financial-management-specialisation'],
};

const GLOBAL_ISOLATION_KEYS = ['academics.hero', 'academics.faq', 'home.faq', 'academics-aima.faq'];

type Doc = { content: Record<string, unknown>; updatedAt: string | null };

function siblingIsolationKeys(slug: string): string[] {
  const others = SIBLINGS[slug] ?? [];
  const keys: string[] = [];
  for (const o of others) {
    keys.push(`${DB_PREFIX}${o}.faq`, `${DB_PREFIX}${o}.overview`, `${DB_PREFIX}master-${o}.hero`);
  }
  return keys;
}

function allApiKeysForSlug(slug: string) {
  if (!(slug in academicsSpecialisationDefaults)) {
    throw new Error(`Unknown specialisation slug (not in contracts): ${slug}`);
  }
  return [...sectionSuffixes.map((s) => `${slug}.${s}`), `master-${slug}.hero`, `master-${slug}.internships`, `master-${slug}.testimonials`];
}

async function cleanupUser(email: string, auditName: string) {
  const u = await prisma.adminUser.findUnique({ where: { email } });
  if (u?.name === auditName) {
    await prisma.auditLog.deleteMany({ where: { actorId: u.id } });
    await prisma.adminUser.delete({ where: { id: u.id } });
  }
}

function dbKey(apiKey: string) {
  return `${DB_PREFIX}${apiKey}`;
}

async function main() {
  const slugArg = process.argv[2] ?? process.env.SPEC_SLUG;
  if (!slugArg || slugArg.startsWith('--')) {
    console.error('Usage: tsx scripts/verify-specialisation-cms.ts <slug> [--cleanup]');
    process.exitCode = 1;
    return;
  }
  const SPEC_SLUG = slugArg.trim();
  const allApiKeys = allApiKeysForSlug(SPEC_SLUG);

  const shortTag = SPEC_SLUG.split('-').slice(0, 2).join('-');
  const password = `Temporary-Spec-Audit-${shortTag}!2026`;
  const user = { email: `spec-audit-${SPEC_SLUG.replace(/[^a-z0-9-]/gi, '')}@example.invalid`, role: 'editor' as const };
  const AUDIT_NAME = `Temporary Spec audit (${SPEC_SLUG})`;

  await cleanupUser(user.email, AUDIT_NAME);
  if (process.argv.includes('--cleanup')) return;

  await prisma.adminUser.create({
    data: {
      email: user.email,
      name: AUDIT_NAME,
      passwordHash: await argon2.hash(password),
      userRoles: { create: { role: { connect: { code: user.role } } } },
    },
  });

  const keysToGuard = allApiKeys.map(dbKey);
  const before = new Map((await prisma.websiteSetting.findMany({ where: { key: { in: keysToGuard } } })).map((r) => [r.key, r]));
  const globalIsolation = [...GLOBAL_ISOLATION_KEYS, ...siblingIsolationKeys(SPEC_SLUG)];
  const isolationBefore = new Map(
    (await prisma.websiteSetting.findMany({ where: { key: { in: globalIsolation } } })).map((r) => [r.key, r])
  );
  const uploadedNames: string[] = [];
  const checks: string[] = [];
  const pass = (name: string) => {
    checks.push(name);
    console.info(`  ✓ ${name}`);
  };

  async function login() {
    const res = await fetch(`${base}/api/v1/auth/login`, {
      method: 'POST',
      headers: { Origin: origin, 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: user.email, password }),
    });
    assert.equal(res.status, 200, 'Login must succeed');
    return { Cookie: res.headers.get('set-cookie')!.split(';')[0]!, Origin: origin, 'Content-Type': 'application/json' };
  }

  try {
    const h = await login();
    const listUrl = `${base}/api/v1/admin/academics/specialisations/page/${encodeURIComponent(SPEC_SLUG)}`;
    const bulk = (sections: Record<string, Doc>) =>
      fetch(listUrl, { method: 'PATCH', headers: h, body: JSON.stringify({ sections }) });

    const specBase = `${base}/api/v1/admin/academics/specialisations/page/${encodeURIComponent(SPEC_SLUG)}`;
    const urlForKey = (apiKey: string) => {
      if (apiKey.startsWith(`master-${SPEC_SLUG}.`)) return `${specBase}/master-${apiKey.slice(`master-${SPEC_SLUG}.`.length)}`;
      if (apiKey.startsWith(`${SPEC_SLUG}.`)) return `${specBase}/${apiKey.slice(SPEC_SLUG.length + 1)}`;
      throw new Error(`Unknown apiKey: ${apiKey}`);
    };

    const getOne = async (apiKey: string): Promise<Doc> => {
      const res = await fetch(urlForKey(apiKey), { headers: h });
      const j = (await res.json()) as { data?: Doc };
      assert.equal(res.status, 200, `GET ${apiKey}: ${res.status}`);
      assert(j.data?.content, `GET ${apiKey}: expected content`);
      return j.data!;
    };

    const patchOne = (apiKey: string, body: unknown) =>
      fetch(urlForKey(apiKey), { method: 'PATCH', headers: h, body: JSON.stringify(body) });

    const listed = (await (await fetch(listUrl, { headers: h })).json()) as { data: Record<string, Doc> };
    const listedKeys = Object.keys(listed.data).sort();
    assert.deepEqual(listedKeys, [...allApiKeys].sort(), 'List must return every document key for slug');
    pass(`GET slug list returns all ${allApiKeys.length} documents`);

    for (const key of allApiKeys) {
      const doc = await getOne(key);
      const res = await patchOne(key, { content: doc.content, updatedAt: doc.updatedAt });
      assert.equal(res.status, 200, `${key}: save unchanged`);
      const saved = (await res.json()) as { data: Doc };
      assert.deepEqual(saved.data.content, doc.content, `${key}: round-trip`);
      assert.equal((await patchOne(key, { content: doc.content, updatedAt: doc.updatedAt })).status, 409, `${key}: stale 409`);
    }
    pass('Every document saves, round-trips, and rejects stale updatedAt');

    const auditLabel = shortTag.toUpperCase();
    const overview = await getOne(`${SPEC_SLUG}.overview`);
    const why = await getOne(`${SPEC_SLUG}.why`);
    const careers = await getOne(`${SPEC_SLUG}.careers`);
    const editedOverview = {
      ...overview.content,
      body: `${String(overview.content.body ?? '')}<p>Audit <script>alert(1)</script><strong>${auditLabel}</strong></p>`,
    };
    const editedWhy = {
      ...why.content,
      items: [
        ...(why.content.items as { icon: string; text: string; iconSize: number }[]),
        { icon: '/images/figma/icon-neutral.svg', iconSize: 32, text: `Audit why (${auditLabel})` },
      ],
    };
    const editedCareers = {
      ...careers.content,
      roles: [{ icon: '/images/figma/icon-neutral.svg', iconSize: 32, text: `Audit role (${auditLabel})` }, ...((careers.content.roles as { icon: string; iconSize: number; text: string }[]) ?? [])],
    };
    const bulkRes = await bulk({
      [`${SPEC_SLUG}.overview`]: { content: editedOverview as unknown as Record<string, unknown>, updatedAt: overview.updatedAt },
      [`${SPEC_SLUG}.why`]: { content: editedWhy as unknown as Record<string, unknown>, updatedAt: why.updatedAt },
      [`${SPEC_SLUG}.careers`]: { content: editedCareers as unknown as Record<string, unknown>, updatedAt: careers.updatedAt },
    });
    assert.equal(bulkRes.status, 200, await bulkRes.clone().text());
    const bulkSaved = (await bulkRes.json()) as { data: Record<string, Doc> };
    assert.match(String(bulkSaved.data[`${SPEC_SLUG}.overview`].content.body), new RegExp(`Audit <strong>${auditLabel}</strong>`));
    pass('Bulk save: overview (sanitised), why items, careers roles');

    const mKey = `master-${SPEC_SLUG}.hero`;
    const heroDoc = await getOne(mKey);
    const items = structuredClone(heroDoc.content.items) as Record<string, unknown>[];
    items.push({
      image: { src: '/images/figma/academics-banner.webp', alt: 'Audit slide', width: 1918, height: 820 },
      imagePosition: '50% 50%',
      mobileImagePosition: '50% 50%',
      title: `Audit banner (${auditLabel})`,
      subtitle: 'Audit',
      primaryText: 'Apply',
      primaryHref: '/admissions/application-form/',
      secondaryText: 'Enquire',
      secondaryHref: '#enquire-now',
      enabled: true,
    });
    items[0] = { ...items[0], enabled: !(items[0] as { enabled?: boolean }).enabled };
    items.reverse();
    const mRes = await patchOne(mKey, { content: { items }, updatedAt: heroDoc.updatedAt });
    assert.equal(mRes.status, 200, await mRes.clone().text());
    const mSaved = (await mRes.json()) as { data: Doc };
    assert.deepEqual(mSaved.data.content.items, items);
    await patchOne(mKey, { content: heroDoc.content, updatedAt: mSaved.data.updatedAt });
    pass('Page Banner master: add, toggle, reorder, restore');

    const up = await fetch(`${base}/api/v1/admin/home-media`, {
      method: 'POST',
      headers: { ...h, 'Content-Type': 'image/png', 'X-File-Name': `spec-audit-${SPEC_SLUG}.png` },
      body: PNG_1PX,
    });
    assert.equal(up.status, 201, await up.clone().text());
    const asset = (await up.json()) as { data: { src: string; width: number; height: number } };
    const uploaded = asset.data;
    uploadedNames.push(uploaded.src.split('/').pop()!);
    const meta = await getOne(`${SPEC_SLUG}.meta`);
    const withIcon = {
      ...meta.content,
      cardIcon: { src: uploaded.src, alt: 'Audit icon', width: uploaded.width, height: uploaded.height },
    };
    const metaSave = await patchOne(`${SPEC_SLUG}.meta`, { content: withIcon, updatedAt: meta.updatedAt });
    assert.equal(metaSave.status, 200);
    assert.equal((await getOne(`${SPEC_SLUG}.meta`)).content.cardIcon.src, uploaded.src);
    pass('Image upload saved into meta.cardIcon');

    const faq = await getOne(`${SPEC_SLUG}.faq`);
    const faqTag = `Audit-FAQ-${auditLabel}`;
    const faqEdited = {
      ...faq.content,
      items: [...((faq.content.items as { question: string; answer: string }[]) ?? []), { question: `${faqTag}?`, answer: 'Yes.' }],
    };
    const faqRes = await patchOne(`${SPEC_SLUG}.faq`, { content: faqEdited, updatedAt: faq.updatedAt });
    assert.equal(faqRes.status, 200);
    const faqRow = await prisma.websiteSetting.findUnique({ where: { key: dbKey(`${SPEC_SLUG}.faq`) } });
    assert(String(JSON.stringify(faqRow?.value)).includes(faqTag), 'FAQ persisted under academics-specs');
    pass('FAQ section saves under academics-specs (isolated per slug)');

    for (const k of globalIsolation) {
      const row = await prisma.websiteSetting.findUnique({ where: { key: k } });
      const prev = isolationBefore.get(k);
      assert.equal(row?.updatedAt.toISOString() ?? null, prev?.updatedAt.toISOString() ?? null, `${k} updatedAt unchanged`);
    }
    pass('Global + sibling specialisation rows unchanged (isolation)');

    const audits = await prisma.auditLog.count({
      where: { entityType: 'academics_specs', actor: { email: user.email } },
    });
    assert(audits >= allApiKeys.length, 'Audit log entries for academics_specs');
    pass('Saves write audit log (academics_specs)');

    console.info(`✓ Passed ${checks.length} checks for specialisation: ${SPEC_SLUG}`);
  } finally {
    for (const key of keysToGuard) {
      const original = before.get(key);
      if (original) {
        await prisma.websiteSetting.update({
          where: { key },
          data: { value: original.value as object, isPublic: original.isPublic, updatedAt: original.updatedAt },
        });
      } else {
        await prisma.websiteSetting.deleteMany({ where: { key } });
      }
    }
    for (const name of uploadedNames) {
      await prisma.mediaAsset.deleteMany({ where: { storageKey: `home/${name}` } });
      await unlink(resolve(process.env.MEDIA_ROOT ?? 'uploads/home', name)).catch(() => undefined);
    }
    await cleanupUser(user.email, AUDIT_NAME);
  }
}

main()
  .catch((err) => {
    console.error('Verification failed:', err);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
