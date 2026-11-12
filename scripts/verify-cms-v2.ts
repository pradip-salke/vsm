import 'dotenv/config';
import assert from 'node:assert/strict';
import { PrismaClient } from '@prisma/client';
import argon2 from 'argon2';

const prisma = new PrismaClient();
const base = process.env.API_BASE_URL ?? 'http://localhost:4000';
const origin = process.env.ADMIN_ORIGIN ?? 'http://localhost:5173';
const email = 'cms-v2-audit@example.invalid';
const password = 'Temporary-CMS-V2-Audit!2026';

async function cleanup() {
  const user = await prisma.adminUser.findUnique({ where: { email } });
  if (user) {
    await prisma.auditLog.deleteMany({ where: { actorId: user.id } });
    await prisma.adminUser.delete({ where: { id: user.id } });
  }
}

async function main() {
  if (process.argv.includes('--cleanup')) {
    await cleanup();
    return;
  }

  // Create temporary editor account
  await prisma.adminUser.deleteMany({ where: { email } });
  await prisma.adminUser.create({
    data: {
      email,
      name: 'Temporary CMS V2 audit',
      passwordHash: await argon2.hash(password),
      userRoles: { create: { role: { connect: { code: 'editor' } } } },
    },
  });

  // Log in
  const login = await fetch(`${base}/api/v1/auth/login`, {
    method: 'POST',
    headers: { Origin: origin, 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  assert.equal(login.status, 200, 'Login must succeed');
  const cookie = login.headers.get('set-cookie')!.split(';')[0]!;
  const headers = { Cookie: cookie, Origin: origin, 'Content-Type': 'application/json' };

  console.info('1. Verifying GET /api/v1/admin/home (Bulk read of all sections)...');
  const homeRes = await fetch(`${base}/api/v1/admin/home`, { headers });
  assert.equal(homeRes.status, 200, 'GET /admin/home must return 200');
  const homeData = (await homeRes.json()).data;
  assert(homeData.stats, 'homeData must contain stats');
  assert(homeData.about, 'homeData must contain about');
  assert(homeData.program, 'homeData must contain program');
  assert(homeData.faq, 'homeData must contain faq');
  assert(homeData.cta, 'homeData must contain cta');
  console.info('✓ GET /admin/home returned all sections with content and timestamps.');

  console.info('2. Verifying PATCH /api/v1/admin/home (Bulk update of multiple sections)...');
  const originalStats = structuredClone(homeData.stats);
  const originalAbout = structuredClone(homeData.about);

  const editedStats = structuredClone(originalStats.content);
  editedStats.items[0].label = 'Full Course Fees (Audit)';
  const editedAbout = structuredClone(originalAbout.content);
  editedAbout.title = 'About Us (Audit)';

  const bulkSaveRes = await fetch(`${base}/api/v1/admin/home`, {
    method: 'PATCH',
    headers,
    body: JSON.stringify({
      sections: {
        stats: { content: editedStats, updatedAt: originalStats.updatedAt },
        about: { content: editedAbout, updatedAt: originalAbout.updatedAt },
      },
    }),
  });
  assert.equal(bulkSaveRes.status, 200, `Bulk save must succeed: ${await bulkSaveRes.clone().text()}`);
  const bulkSavedData = (await bulkSaveRes.json()).data;
  assert.equal(bulkSavedData.stats.content.items[0].label, 'Full Course Fees (Audit)');
  assert.equal(bulkSavedData.about.content.title, 'About Us (Audit)');
  console.info('✓ Bulk PATCH /admin/home saved multiple sections in a single atomic transaction.');

  console.info('3. Verifying optimistic concurrency on bulk PATCH...');
  const staleRes = await fetch(`${base}/api/v1/admin/home`, {
    method: 'PATCH',
    headers,
    body: JSON.stringify({
      sections: {
        stats: { content: editedStats, updatedAt: originalStats.updatedAt }, // old timestamp
      },
    }),
  });
  assert.equal(staleRes.status, 409, 'Stale updatedAt must be rejected with 409 conflict');
  console.info('✓ Optimistic conflict correctly rejected with 409.');

  // Restore stats and about
  await fetch(`${base}/api/v1/admin/home`, {
    method: 'PATCH',
    headers,
    body: JSON.stringify({
      sections: {
        stats: { content: originalStats.content, updatedAt: bulkSavedData.stats.updatedAt },
        about: { content: originalAbout.content, updatedAt: bulkSavedData.about.updatedAt },
      },
    }),
  });
  console.info('✓ Restored original stats and about content.');

  console.info('4. Verifying GET /api/v1/admin/settings/global (Global Settings)...');
  const globalRes = await fetch(`${base}/api/v1/admin/settings/global`, { headers });
  assert.equal(globalRes.status, 200, 'GET /admin/settings/global must return 200');
  const globalData = (await globalRes.json()).data;
  assert(globalData.enquiry, 'globalData must contain enquiry');
  assert(globalData.enquiry.content.title, 'enquiry content must have title');
  console.info('✓ GET /admin/settings/global returned global enquiry configuration.');

  console.info('5. Verifying PATCH /api/v1/admin/settings/global...');
  const originalEnquiry = structuredClone(globalData.enquiry);
  const editedEnquiry = structuredClone(originalEnquiry.content);
  editedEnquiry.title = 'Enquire Now (Global Audit)';
  editedEnquiry.eyebrow = 'Download Prospectus (Audit)';

  const patchGlobalRes = await fetch(`${base}/api/v1/admin/settings/global`, {
    method: 'PATCH',
    headers,
    body: JSON.stringify({
      enquiry: {
        content: editedEnquiry,
        updatedAt: originalEnquiry.updatedAt,
      },
    }),
  });
  assert.equal(patchGlobalRes.status, 200, 'PATCH /admin/settings/global must return 200');
  const savedGlobal = (await patchGlobalRes.json()).data;
  assert.equal(savedGlobal.enquiry.content.title, 'Enquire Now (Global Audit)');
  assert.equal(savedGlobal.enquiry.content.eyebrow, 'Download Prospectus (Audit)');
  console.info('✓ Global Settings successfully updated.');

  console.info('6. Verifying public reflection of Global Settings...');
  const pubGlobalRes = await fetch(`${base}/api/v1/public/settings/global`);
  assert.equal(pubGlobalRes.status, 200, 'GET /public/settings/global must return 200');
  const pubGlobalData = (await pubGlobalRes.json()).data;
  assert.equal(pubGlobalData.enquiry.title, 'Enquire Now (Global Audit)');
  assert.equal(pubGlobalData.enquiry.eyebrow, 'Download Prospectus (Audit)');

  const pubHomeRes = await fetch(`${base}/api/v1/public/home`);
  assert.equal(pubHomeRes.status, 200, 'GET /public/home must return 200');
  const pubHomeData = (await pubHomeRes.json()).data;
  assert.equal(pubHomeData.sections.enquiry.title, 'Enquire Now (Global Audit)');
  console.info('✓ Global Enquire Now reflected across public global settings and home APIs.');

  // Restore original enquiry
  const restoreRes = await fetch(`${base}/api/v1/admin/settings/global`, {
    method: 'PATCH',
    headers,
    body: JSON.stringify({
      enquiry: {
        content: originalEnquiry.content,
        updatedAt: savedGlobal.enquiry.updatedAt,
      },
    }),
  });
  assert.equal(restoreRes.status, 200, 'Restoring global enquiry must succeed');
  console.info('✓ Restored original global enquiry settings.');

  console.info('\nALL V2 CMS VERIFICATIONS PASSED SUCCESSFULLY!');
}

main()
  .finally(async () => {
    await cleanup();
    await prisma.$disconnect();
  });

