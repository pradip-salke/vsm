// Verifies FAQ CMS persistence for AICTE, AIMA, and one specialisation page: admin PATCH → MySQL → admin GET.
// Restores website_setting rows to their pre-test state. Requires API + MySQL (same as verify-academics).
import 'dotenv/config';
import assert from 'node:assert/strict';
import { PrismaClient } from '@prisma/client';
import argon2 from 'argon2';
import { academicsDefaults } from '../packages/contracts/src/academics';
import { aimaDefaults } from '../packages/contracts/src/academics-aima';
import { academicsSpecialisationDefaults } from '../packages/contracts/src/academics-specialisations';

const prisma = new PrismaClient();
const base = process.env.API_BASE_URL ?? 'http://localhost:4000';
const origin = process.env.ADMIN_ORIGIN ?? 'http://localhost:5173';
const password = 'Temporary-Academic-FAQ-Audit!2026';
const users = [{ email: 'academic-faq-audit@example.invalid', role: 'editor' }];
const AUDIT_NAME = 'Temporary Academic FAQ audit';

const SPEC_SLUG = 'financial-management-specialisation';

const KEYS = {
  aicte: 'academics.faq',
  aima: 'academics-aima.faq',
  spec: `academics-specs.${SPEC_SLUG}.faq`,
  homeFaq: 'home.faq',
} as const;

type Doc = { content: Record<string, unknown>; updatedAt: string | null };

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

function expectKeysEqual(a: Record<string, unknown>, b: Record<string, unknown>, label: string) {
  const ka = Object.keys(a).sort();
  const kb = Object.keys(b).sort();
  assert.deepEqual(ka, kb, `${label}: top-level keys`);
}

async function main() {
  await cleanup();
  if (process.argv.includes('--cleanup')) return;

  await prisma.adminUser.create({
    data: {
      email: users[0].email,
      name: AUDIT_NAME,
      passwordHash: await argon2.hash(password),
      userRoles: { create: { role: { connect: { code: users[0].role } } } },
    },
  });

  const keysToGuard = [KEYS.aicte, KEYS.aima, KEYS.spec, KEYS.homeFaq];
  const before = new Map((await prisma.websiteSetting.findMany({ where: { key: { in: keysToGuard } } })).map((r) => [r.key, r]));

  const homeFaqBefore = before.get(KEYS.homeFaq);

  try {
    const h = await login(users[0].email);

    const getAicte = async (): Promise<Doc> => {
      const res = await fetch(`${base}/api/v1/admin/academics/faq`, { headers: h });
      const j = (await res.json()) as { data?: Doc; error?: unknown };
      if (res.status === 404)
        throw new Error(
          'GET AICTE faq: 404 — the API build does not know section "faq" yet. Run `npm run build` in `packages/contracts` and `apps/api`, restart the API, then run `npm run db:ensure:academic-faq` if the row was missing.'
        );
      if (!res.ok) throw new Error(`GET AICTE faq: ${res.status} ${JSON.stringify(j)}`);
      assert(j.data?.content, 'GET AICTE faq: expected data.content');
      return j.data!;
    };
    const patchAicte = (body: unknown) =>
      fetch(`${base}/api/v1/admin/academics/faq`, { method: 'PATCH', headers: h, body: JSON.stringify(body) });

    const getAima = async (): Promise<Doc> => {
      const res = await fetch(`${base}/api/v1/admin/academics/aima/faq`, { headers: h });
      const j = (await res.json()) as { data?: Doc; error?: unknown };
      if (!res.ok) throw new Error(`GET AIMA faq: ${res.status} ${JSON.stringify(j)}`);
      assert(j.data?.content, 'GET AIMA faq: expected data.content');
      return j.data!;
    };
    const patchAima = (body: unknown) =>
      fetch(`${base}/api/v1/admin/academics/aima/faq`, { method: 'PATCH', headers: h, body: JSON.stringify(body) });

    const getSpec = async (): Promise<Doc> => {
      const res = await fetch(`${base}/api/v1/admin/academics/specialisations/page/${encodeURIComponent(SPEC_SLUG)}/faq`, { headers: h });
      const j = (await res.json()) as { data?: Doc; error?: unknown };
      if (!res.ok) throw new Error(`GET spec faq: ${res.status} ${JSON.stringify(j)}`);
      assert(j.data?.content, 'GET spec faq: expected data.content');
      return j.data!;
    };
    const patchSpec = (body: unknown) =>
      fetch(`${base}/api/v1/admin/academics/specialisations/page/${encodeURIComponent(SPEC_SLUG)}/faq`, {
        method: 'PATCH',
        headers: h,
        body: JSON.stringify(body),
      });

    const tag = `FAQ-AUDIT-${Date.now()}`;

    // --- AICTE
    let doc = await getAicte();
    const aicteDefault = academicsDefaults.faq as unknown as Record<string, unknown>;
    expectKeysEqual(doc.content, aicteDefault, 'AICTE list default');
    const aicteEdited = {
      ...doc.content,
      title: `${String(doc.content.title)} [${tag}]`,
      description: `${String(doc.content.description)} [${tag}]`,
      buttonText: `${String(doc.content.buttonText)} [${tag}]`,
      items: [
        ...(doc.content.items as { question: string; answer: string }[]).slice(0, 2),
        { question: `Audit Q1 ${tag}`, answer: `Audit A1 ${tag}` },
        { question: `Audit Q2 ${tag}`, answer: `Audit A2 ${tag}` },
      ],
    };
    let res = await patchAicte({ content: aicteEdited, updatedAt: doc.updatedAt });
    const aictePatchBody = (await res.json()) as { data?: Doc; error?: unknown };
    assert.equal(res.status, 200, `AICTE save: ${res.status} ${JSON.stringify(aictePatchBody)}`);
    let saved = aictePatchBody.data as Doc;
    assert.equal(saved.content.title, aicteEdited.title);
    const row = await prisma.websiteSetting.findUnique({ where: { key: KEYS.aicte } });
    assert(row, 'AICTE row exists');
    assert.equal((row!.value as { title?: string }).title, aicteEdited.title, 'MySQL AICTE faq title');
    doc = await getAicte();
    assert.equal(doc.content.title, aicteEdited.title, 'AICTE reopen GET');

    // --- AIMA
    doc = await getAima();
    const aimaDefault = aimaDefaults.faq as unknown as Record<string, unknown>;
    expectKeysEqual(doc.content, aimaDefault, 'AIMA list default');
    const aimaEdited = {
      ...doc.content,
      eyebrow: `${String(doc.content.eyebrow)} [${tag}]`,
      buttonHref: '/admissions/mba-pgdm-admissions-process/',
      items: [...(doc.content.items as { question: string; answer: string }[]), { question: `AIMA audit ${tag}`, answer: 'x' }].slice(
        0,
        99
      ),
    };
    res = await patchAima({ content: aimaEdited, updatedAt: doc.updatedAt });
    const aimaPatchBody = (await res.json()) as { data?: Doc; error?: unknown };
    assert.equal(res.status, 200, `AIMA save: ${res.status} ${JSON.stringify(aimaPatchBody)}`);
    saved = aimaPatchBody.data as Doc;
    assert.equal(saved.content.eyebrow, aimaEdited.eyebrow);
    const rowAima = await prisma.websiteSetting.findUnique({ where: { key: KEYS.aima } });
    assert(rowAima, 'AIMA row exists after save');
    assert.equal((rowAima!.value as { eyebrow?: string }).eyebrow, aimaEdited.eyebrow);
    doc = await getAima();
    assert.equal(doc.content.eyebrow, aimaEdited.eyebrow);

    // --- Specialisation
    doc = await getSpec();
    const specDefault = academicsSpecialisationDefaults[SPEC_SLUG as keyof typeof academicsSpecialisationDefaults].faq as unknown as Record<
      string,
      unknown
    >;
    expectKeysEqual(doc.content, specDefault, 'Spec list default');
    const items = [...(doc.content.items as { question: string; answer: string }[])];
    const [first, second] = items;
    assert(first && second);
    // Reorder: swap first two (tests order persistence)
    const specEdited = {
      ...doc.content,
      items: [second, first, ...items.slice(2), { question: `Spec audit ${tag}`, answer: `Answer ${tag}` }],
    };
    res = await patchSpec({ content: specEdited, updatedAt: doc.updatedAt });
    const specPatchBody = (await res.json()) as { data?: Doc; error?: unknown };
    assert.equal(res.status, 200, `Spec save: ${res.status} ${JSON.stringify(specPatchBody)}`);
    saved = specPatchBody.data as Doc;
    assert.equal((saved.content.items as { question: string }[])[0].question, second.question);
    const rowSpec = await prisma.websiteSetting.findUnique({ where: { key: KEYS.spec } });
    assert(rowSpec, 'Spec row exists');
    assert.equal((rowSpec!.value as { items: { question: string }[] }).items[0].question, second.question);
    doc = await getSpec();
    assert.equal((doc.content.items as { question: string }[])[0].question, second.question);

    // Home FAQ must not change
    const homeFaqAfter = await prisma.websiteSetting.findUnique({ where: { key: KEYS.homeFaq } });
    if (homeFaqBefore) {
      assert.equal(homeFaqAfter?.updatedAt.toISOString(), homeFaqBefore.updatedAt.toISOString(), 'home.faq row untouched');
    }

    console.info('✓ Academic FAQ audit: AICTE, AIMA, specialisation PATCH → MySQL → GET; Home FAQ row unchanged.');
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
    await cleanup();
  }
}

main()
  .catch((err) => {
    console.error('Verification failed:', err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
