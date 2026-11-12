// Audits the Admissions page CMS (all pages) against the running API and MySQL. Restores DB rows after run.
import 'dotenv/config';
import assert from 'node:assert/strict';
import { unlink } from 'node:fs/promises';
import { resolve } from 'node:path';
import { PrismaClient } from '@prisma/client';
import argon2 from 'argon2';
import { admissionsPages } from '../packages/contracts/src/admissions';

const prisma = new PrismaClient();
const base = process.env.API_BASE_URL ?? 'http://localhost:4000';
const origin = process.env.ADMIN_ORIGIN ?? 'http://localhost:5173';
const password = 'Temporary-Admissions-Audit!2026';
const users = [
  { email: 'admissions-audit@example.invalid', role: 'editor' },
  { email: 'admissions-viewer-audit@example.invalid', role: 'viewer' },
];
const AUDIT_NAME = 'Temporary Admissions audit';
const PNG_1PX = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
  'base64'
);
const OTHER_ISOLATION_KEYS = ['academics.hero', 'academics.faq', 'academics.master-hero', 'academics-aima.faq', 'academics-aima.master-hero', 'home.hero', 'home.faq'];

type Doc = { content: unknown; updatedAt: string | null };
type Slide = { image: { src: string; alt: string; width: number; height: number }; title: string; enabled: boolean } & Record<string, unknown>;
const slugs = Object.keys(admissionsPages) as (keyof typeof admissionsPages)[];
const keysOf = (slug: keyof typeof admissionsPages) => [
  ...Object.keys(admissionsPages[slug].sections),
  ...Object.keys(admissionsPages[slug].masters).map((k) => `master-${k}`),
];

async function requireJson<T>(res: Response, label: string): Promise<T> {
  const text = await res.text();
  if (!res.ok) throw new Error(`${label}: HTTP ${res.status} ${res.statusText}. Body: ${text.slice(0, 500)}`);
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

  const before = new Map(
    (await prisma.websiteSetting.findMany({ where: { OR: [{ key: { startsWith: 'admissions.' } }, { key: { in: OTHER_ISOLATION_KEYS } }] } })).map((r) => [r.key, r])
  );
  const publicOf = async (slug: string) =>
    (await requireJson<{ data: { path: string; sections: Record<string, unknown>; masters: Record<string, unknown> } }>(await fetch(`${base}/api/v1/public/admissions/${slug}`), `GET public ${slug}`)).data;
  const aimaBefore = await requireJson<{ data: unknown }>(await fetch(`${base}/api/v1/public/academics/aima`), 'GET public aima');
  const homeBefore = await requireJson<{ data: { sections: unknown } }>(await fetch(`${base}/api/v1/public/home`), 'GET public home');
  const uploadedNames: string[] = [];
  const checks: string[] = [];
  const pass = (name: string) => {
    checks.push(name);
    console.info(`  ✓ ${name}`);
  };

  try {
    for (const slug of slugs) {
      const pub = await publicOf(slug);
      assert.equal(pub.path, admissionsPages[slug].path);
      assert.deepEqual(Object.keys(pub.sections).sort(), Object.keys(admissionsPages[slug].sections).sort());
      assert.deepEqual(Object.keys(pub.masters), ['hero']);
      assert.equal((pub.sections.hero as { title?: string }).title, admissionsPages[slug].masters.hero.items[0].title, `${slug}: public hero merges banner slide`);
    }
    assert.equal((await fetch(`${base}/api/v1/public/admissions/not-a-page`)).status, 404);
    pass(`Public endpoint serves all ${slugs.length} Admissions pages (sections + banner master); unknown page 404`);

    assert.equal((await fetch(`${base}/api/v1/admin/admissions/refund-policy`)).status, 401);
    const viewer = await login(users[1].email);
    const vDocRes = await fetch(`${base}/api/v1/admin/admissions/refund-policy/policy`, { headers: viewer });
    const vDoc = (await requireJson<{ data: Doc }>(vDocRes, 'viewer GET policy')).data;
    assert.equal((await fetch(`${base}/api/v1/admin/admissions/refund-policy/policy`, { method: 'PATCH', headers: viewer, body: JSON.stringify(vDoc) })).status, 403);
    pass('Unauthenticated 401; viewer can read but not PATCH');

    const h = await login(users[0].email);
    const api = (slug: string, key = '') => `${base}/api/v1/admin/admissions/${slug}${key ? `/${key}` : ''}`;
    const get = async (slug: string, key: string): Promise<Doc> => (await requireJson<{ data: Doc }>(await fetch(api(slug, key), { headers: h }), `GET ${slug}/${key}`)).data;
    const patch = (slug: string, key: string, body: unknown) => fetch(api(slug, key), { method: 'PATCH', headers: h, body: JSON.stringify(body) });
    const bulk = (slug: string, sections: Record<string, Doc>) => fetch(api(slug), { method: 'PATCH', headers: h, body: JSON.stringify({ sections }) });

    assert.equal((await fetch(api('not-a-page'), { headers: h })).status, 404);
    assert.equal((await fetch(api('pgdm-fee-structure', 'eligibility'), { headers: h })).status, 404, 'section of another page is not addressable');
    pass('Admin: unknown page 404; sections of one page are not reachable from another');

    let docCount = 0;
    for (const slug of slugs) {
      const list = (await requireJson<{ data: Record<string, Doc> }>(await fetch(api(slug), { headers: h }), `GET ${slug} list`)).data;
      assert.deepEqual(Object.keys(list).sort(), keysOf(slug).sort());
      for (const key of keysOf(slug)) {
        const doc = await get(slug, key);
        assert.deepEqual(doc.content, list[key].content, `${slug}/${key}: single read matches list`);
        const res = await patch(slug, key, doc);
        assert.equal(res.status, 200, `${slug}/${key}: save unchanged: ${await res.clone().text()}`);
        const saved = (await requireJson<{ data: Doc }>(res, `${slug}/${key} PATCH`)).data;
        assert.deepEqual(saved.content, doc.content, `${slug}/${key}: round-trip unchanged`);
        assert.equal((await patch(slug, key, doc)).status, 409, `${slug}/${key}: stale updatedAt must conflict`);
        docCount++;
      }
    }
    pass(`All ${docCount} Admissions documents load existing content, save unchanged, reject stale saves (409)`);

    // Admissions Process: add + reorder eligibility, edit steps, rich CTA lead
    {
      const slug = 'mba-pgdm-admissions-process';
      const elig = await get(slug, 'eligibility');
      const steps = await get(slug, 'steps');
      const cta = await get(slug, 'apply-cta');
      const e = structuredClone(elig.content) as { items: { label: string; detail: string }[] };
      e.items.push({ label: 'Audit Criterion', detail: 'Audit text' });
      e.items.reverse();
      const s = structuredClone(steps.content) as { items: { title: string; text: string }[] };
      s.items.splice(1, 1);
      s.items[0].title = 'Audit Step Title';
      const c = { ...(cta.content as object), lead: '<p>Audit <strong>lead</strong> <a href="mailto:admissions@vsmedu.in">mail</a></p>' };
      const res = await bulk(slug, {
        eligibility: { content: e, updatedAt: elig.updatedAt },
        steps: { content: s, updatedAt: steps.updatedAt },
        'apply-cta': { content: c, updatedAt: cta.updatedAt },
      });
      assert.equal(res.status, 200, await res.clone().text());
      const after = await publicOf(slug);
      const ae = after.sections.eligibility as { items: { label: string }[] };
      assert.equal(ae.items[0].label, 'Audit Criterion');
      assert.equal(ae.items.length, 5);
      assert.equal((after.sections.steps as { items: unknown[] }).items.length, 4);
      assert.match((after.sections['apply-cta'] as { lead: string }).lead, /<strong>lead<\/strong>.*mailto:admissions@vsmedu\.in/);
      pass('Admissions Process: eligibility add + reorder, step delete + edit, rich CTA lead with mailto persist');
    }

    // Fees Structure: fee table row add/delete/edit + note + intro rich body
    {
      const slug = 'pgdm-fee-structure';
      const fees = await get(slug, 'fees');
      const intro = await get(slug, 'intro');
      const f = structuredClone(fees.content) as { rows: { label: string; amount: string }[]; note: string; columnValue: string };
      f.rows.splice(0, 1);
      f.rows.push({ label: 'Audit Hostel', amount: 'INR 1/-' });
      f.note = '* Audit note';
      f.columnValue = 'Audit Column';
      const i = { ...(intro.content as object), body: '<p>Audit intro <script>alert(1)</script><em>kept</em></p>' };
      const res = await bulk(slug, { fees: { content: f, updatedAt: fees.updatedAt }, intro: { content: i, updatedAt: intro.updatedAt } });
      assert.equal(res.status, 200, await res.clone().text());
      const saved = (await requireJson<{ data: Record<string, Doc> }>(res, 'fees bulk')).data;
      const body = (saved.intro.content as { body: string }).body;
      assert.doesNotMatch(body, /script/);
      assert.match(body, /<em>kept<\/em>/);
      const after = await publicOf(slug);
      const af = after.sections.fees as typeof f;
      assert.equal(af.rows.at(-1)!.label, 'Audit Hostel');
      assert.equal(af.rows.length, admissionsPages[slug].sections.fees.rows.length);
      assert.equal(af.note, '* Audit note');
      assert.equal(af.columnValue, 'Audit Column');
      pass('Fees Structure: fee rows add/delete, column heading + note edit, intro rich text sanitised (script stripped)');
    }

    // Application Form: FAQ add / delete / reorder / rich answer, form headings
    {
      const slug = 'application-form';
      const faq = await get(slug, 'faq');
      const form = await get(slug, 'form-section');
      const q = structuredClone(faq.content) as { title: string; items: { question: string; answer: string }[] };
      q.items.splice(2, 1);
      [q.items[0], q.items[1]] = [q.items[1], q.items[0]];
      q.items.push({ question: 'Audit question?', answer: '<ul><li>Audit <strong>answer</strong></li></ul>' });
      const fs = { ...(form.content as object), subheading: 'Audit Form Subheading' };
      const res = await bulk(slug, { faq: { content: q, updatedAt: faq.updatedAt }, 'form-section': { content: fs, updatedAt: form.updatedAt } });
      assert.equal(res.status, 200, await res.clone().text());
      const after = await publicOf(slug);
      const af = after.sections.faq as typeof q;
      assert.equal(af.items.length, 5);
      assert.equal(af.items[0].question, admissionsPages[slug].sections.faq.items[1].question);
      assert.equal(af.items.at(-1)!.answer, '<ul><li>Audit <strong>answer</strong></li></ul>');
      assert.equal((after.sections['form-section'] as { subheading: string }).subheading, 'Audit Form Subheading');
      const blankQ = structuredClone(af);
      blankQ.items[0].question = ' ';
      const cur = await get(slug, 'faq');
      assert.equal((await patch(slug, 'faq', { content: blankQ, updatedAt: cur.updatedAt })).status, 400);
      const extraKey = { ...af, eyebrow: 'not part of this page' };
      assert.equal((await patch(slug, 'faq', { content: extraKey, updatedAt: cur.updatedAt })).status, 400);
      pass('Application Form: FAQ add/delete/reorder with rich answers; blank question and foreign fields rejected (400)');
    }

    // Refund Policy: clause add with link, reorder, refund table row edit/add
    {
      const slug = 'refund-policy';
      const policy = await get(slug, 'policy');
      const table = await get(slug, 'refund-table');
      const p = structuredClone(policy.content) as { clauses: { body: string }[]; note: string };
      p.clauses.push({ body: '<p>Audit clause <a href="/contact-us/">contact</a></p>' });
      [p.clauses[0], p.clauses[1]] = [p.clauses[1], p.clauses[0]];
      p.note = 'Audit closing note';
      const t = structuredClone(table.content) as { refundRows: { particular: string; deduction: string; refund: string }[]; refundHeading: string };
      t.refundRows.push({ particular: 'Audit particular', deduction: '0', refund: 'Full' });
      t.refundHeading = 'Audit Refund';
      const res = await bulk(slug, { policy: { content: p, updatedAt: policy.updatedAt }, 'refund-table': { content: t, updatedAt: table.updatedAt } });
      assert.equal(res.status, 200, await res.clone().text());
      const after = await publicOf(slug);
      const ap = after.sections.policy as typeof p;
      assert.equal(ap.clauses.length, 6);
      assert.match(ap.clauses[0].body, /mailto:admissions@vsmedu\.in/);
      assert.equal(ap.note, 'Audit closing note');
      const at = after.sections['refund-table'] as typeof t;
      assert.equal(at.refundRows.length, 4);
      assert.equal(at.refundHeading, 'Audit Refund');
      const badHref = await get(slug, 'page-nav');
      const bad = structuredClone(badHref.content) as { links: { href: string }[] };
      bad.links[0].href = 'javascript:alert(1)';
      assert.equal((await patch(slug, 'page-nav', { content: bad, updatedAt: badHref.updatedAt })).status, 400);
      pass('Refund Policy: clause add/reorder (mailto preserved), table row add + heading edit; javascript: link rejected');
    }

    // Banner master: upload image, add slide, reorder, toggle, delete — per page
    const up = await fetch(`${base}/api/v1/admin/home-media`, {
      method: 'POST',
      headers: { ...h, 'Content-Type': 'image/png', 'X-File-Name': 'admissions-audit.png' },
      body: PNG_1PX,
    });
    assert.equal(up.status, 201, await up.clone().text());
    const asset = (await requireJson<{ data: { src: string; width: number; height: number } }>(up, 'upload')).data;
    uploadedNames.push(asset.src.split('/').pop()!);
    {
      const slug = 'pgdm-fee-structure';
      const m = await get(slug, 'master-hero');
      const items = structuredClone((m.content as { items: Slide[] }).items);
      const added: Slide = { ...items[0], title: 'Audit Banner', image: { ...items[0].image, src: asset.src, width: asset.width, height: asset.height } };
      let res = await patch(slug, 'master-hero', { content: { items: [added, ...items] }, updatedAt: m.updatedAt });
      assert.equal(res.status, 200, await res.clone().text());
      let saved = (await requireJson<{ data: Doc }>(res, 'add slide')).data;
      assert.equal((saved.content as { items: Slide[] }).items[0].image.src, asset.src);
      assert.equal(((await publicOf(slug)).sections.hero as { title: string }).title, 'Audit Banner', 'first enabled slide drives public hero');
      const toggled = structuredClone((saved.content as { items: Slide[] }).items);
      toggled[0].enabled = false;
      res = await patch(slug, 'master-hero', { content: { items: toggled }, updatedAt: saved.updatedAt });
      saved = (await requireJson<{ data: Doc }>(res, 'toggle slide')).data;
      assert.equal(((await publicOf(slug)).sections.hero as { title: string }).title, admissionsPages[slug].masters.hero.items[0].title, 'disabled slide skipped');
      const reordered = [...(saved.content as { items: Slide[] }).items].reverse();
      res = await patch(slug, 'master-hero', { content: { items: reordered }, updatedAt: saved.updatedAt });
      saved = (await requireJson<{ data: Doc }>(res, 'reorder slides')).data;
      assert.equal((saved.content as { items: Slide[] }).items.at(-1)!.title, 'Audit Banner');
      res = await patch(slug, 'master-hero', { content: { items: (saved.content as { items: Slide[] }).items.slice(0, -1) }, updatedAt: saved.updatedAt });
      saved = (await requireJson<{ data: Doc }>(res, 'delete slide')).data;
      assert.equal((saved.content as { items: Slide[] }).items.length, items.length);
      const missingImg = structuredClone((saved.content as { items: Slide[] }).items);
      missingImg[0].image.src = '';
      assert.equal((await patch(slug, 'master-hero', { content: { items: missingImg }, updatedAt: saved.updatedAt })).status, 400);
      pass('Banner master: uploaded /cms-media image on new slide, toggle, reorder, delete persist; empty image rejected');
    }

    // Independence: edits on one page never touch another page's rows/public payload
    {
      const proc = await get('mba-pgdm-admissions-process', 'page-nav');
      const refundNavBefore = await prisma.websiteSetting.findUnique({ where: { key: 'admissions.refund-policy.page-nav' } });
      const n = structuredClone(proc.content) as { title: string };
      n.title = 'Audit nav title (process page only)';
      assert.equal((await patch('mba-pgdm-admissions-process', 'page-nav', { content: n, updatedAt: proc.updatedAt })).status, 200);
      for (const other of slugs.filter((s) => s !== 'mba-pgdm-admissions-process')) {
        assert.notEqual(((await publicOf(other)).sections['page-nav'] as { title: string }).title, n.title, `${other} page-nav independent`);
      }
      const refundNavAfter = await prisma.websiteSetting.findUnique({ where: { key: 'admissions.refund-policy.page-nav' } });
      assert.equal(refundNavAfter?.updatedAt.toISOString(), refundNavBefore?.updatedAt.toISOString());
      const otherFees = await publicOf('application-form');
      assert.equal('fees' in otherFees.sections, false);
      pass('Page independence: same-named section on another page is unaffected by edits');
    }

    for (const key of OTHER_ISOLATION_KEYS) {
      const row = await prisma.websiteSetting.findUnique({ where: { key } });
      assert.equal(row?.updatedAt.toISOString() ?? null, before.get(key)?.updatedAt.toISOString() ?? null, `${key} untouched`);
    }
    assert.deepEqual((await requireJson<{ data: unknown }>(await fetch(`${base}/api/v1/public/academics/aima`), 'aima after')).data, aimaBefore.data);
    assert.deepEqual((await requireJson<{ data: { sections: unknown } }>(await fetch(`${base}/api/v1/public/home`), 'home after')).data.sections, homeBefore.data.sections);
    pass('AICTE, AIMA and Home content untouched by Admissions edits');

    const logs = await prisma.auditLog.findMany({ where: { entityType: 'admissions', actor: { email: users[0].email } }, select: { entityId: true, action: true } });
    for (const slug of slugs) assert(logs.some((l) => l.entityId.startsWith(`${slug}.`)), `audit entries for ${slug}`);
    assert(logs.some((l) => l.action === 'admissions.bulk_update') && logs.some((l) => l.action === 'admissions.update'));
    pass(`Audit log: ${logs.length} admissions entries covering every page (single + bulk saves)`);
  } finally {
    const now = await prisma.websiteSetting.findMany({ where: { key: { startsWith: 'admissions.' } } });
    for (const row of now) if (!before.has(row.key)) await prisma.websiteSetting.delete({ where: { key: row.key } });
    for (const [key, original] of before) {
      if (!key.startsWith('admissions.')) continue;
      await prisma.websiteSetting.update({ where: { key }, data: { value: original.value as object, isPublic: original.isPublic } });
    }
    for (const name of uploadedNames) {
      await prisma.mediaAsset.deleteMany({ where: { storageKey: `home/${name}` } });
      await unlink(resolve(process.env.MEDIA_ROOT ?? 'uploads/home', name)).catch(() => undefined);
    }
  }
  console.info(`✓ Passed ${checks.length} Admissions CMS checks.`);
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
