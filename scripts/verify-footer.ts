import 'dotenv/config';
import assert from 'node:assert/strict';
import { PrismaClient } from '@prisma/client';
import argon2 from 'argon2';
import { footerDefaults } from '@vsmedu/contracts/footer';

const prisma = new PrismaClient();
const base = process.env.API_BASE_URL ?? 'http://localhost:4000';
const origin = process.env.ADMIN_ORIGIN ?? 'http://localhost:5173';
const email = 'footer-test-admin@example.invalid';
const password = 'Temporary-Footer-Test!2026';

async function cleanup(userId?: number) {
  try {
    const user = userId ? await prisma.adminUser.findUnique({ where: { id: userId } }) : await prisma.adminUser.findUnique({ where: { email } });
    if (user) {
      await prisma.auditLog.deleteMany({ where: { actorId: user.id } });
      await prisma.adminUser.delete({ where: { id: user.id } });
    }
  } catch (err) {
    console.warn('Cleanup warning:', err);
  }
}

async function main() {
  console.info('=== Starting Footer Content Management CMS Verification ===');

  // 1. Ensure test admin user exists with editor permissions
  await prisma.adminUser.deleteMany({ where: { email } });

  const testUser = await prisma.adminUser.create({
    data: {
      email,
      name: 'Footer Test Admin',
      passwordHash: await argon2.hash(password),
      userRoles: { create: { role: { connect: { code: 'editor' } } } },
    },
  });

  // Log in as admin
  const loginRes = await fetch(`${base}/api/v1/auth/login`, {
    method: 'POST',
    headers: { Origin: origin, 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  assert.equal(loginRes.status, 200, 'Admin login must succeed');
  const cookie = loginRes.headers.get('set-cookie')!.split(';')[0]!;
  const adminHeaders = { Cookie: cookie, Origin: origin, 'Content-Type': 'application/json' };

  try {
    // -------------------------------------------------------------
    // TEST 1: Read initial Footer Settings via Admin API
    // -------------------------------------------------------------
    console.info('\n1. Verifying GET /api/v1/admin/settings/footer...');
    const getRes = await fetch(`${base}/api/v1/admin/settings/footer`, { headers: adminHeaders });
    assert.equal(getRes.status, 200, `Expected 200, got ${getRes.status}`);
    const getJson = await getRes.json();
    assert.ok(getJson.data, 'Response must contain data');
    assert.ok(getJson.data.content, 'Response must contain content');
    assert.equal(getJson.data.content.specialisations.heading, 'Specialisation');
    assert.equal(getJson.data.content.aboutUs.heading, 'About Us');
    assert.equal(getJson.data.content.contacts.email, 'info@vsmedu.in');
    assert.ok(getJson.data.content.bottomLinks.length >= 5, 'Should have initial bottom links');
    console.info('✓ Initial footer content retrieved successfully.');

    const initialUpdatedAt = getJson.data.updatedAt;

    // -------------------------------------------------------------
    // TEST 2: Update Footer Settings via PATCH /api/v1/admin/settings/footer
    // -------------------------------------------------------------
    console.info('\n2. Verifying PATCH /api/v1/admin/settings/footer (Updating text & adding links)...');
    const updatedContent = {
      ...getJson.data.content,
      about: {
        ...getJson.data.content.about,
        description: 'VSM stands as a premier educational institute in Mumbai, developing industry-ready business leaders.',
      },
      specialisations: {
        ...getJson.data.content.specialisations,
        links: [
          ...getJson.data.content.specialisations.links,
          { label: 'PGDM in FinTech', href: '/our-academics/fintech/', openInNewTab: false },
        ],
      },
      copyright: 'Copyright © 2026 | Cosmopolitan Education Society (Valia School of Management)',
    };

    const patchRes = await fetch(`${base}/api/v1/admin/settings/footer`, {
      method: 'PATCH',
      headers: adminHeaders,
      body: JSON.stringify({
        content: updatedContent,
        updatedAt: initialUpdatedAt,
      }),
    });
    assert.equal(patchRes.status, 200, `Expected 200 on PATCH, got ${patchRes.status}`);
    const patchJson = await patchRes.json();
    assert.ok(patchJson.data.updatedAt, 'Must return new updatedAt timestamp');
    assert.equal(patchJson.data.content.about.description, updatedContent.about.description);
    assert.equal(patchJson.data.content.copyright, updatedContent.copyright);
    assert.equal(patchJson.data.content.specialisations.links.length, getJson.data.content.specialisations.links.length + 1);
    console.info('✓ Footer content saved and updated via Admin API.');

    const newUpdatedAt = patchJson.data.updatedAt;

    // -------------------------------------------------------------
    // TEST 3: Verify MySQL Database Persistence
    // -------------------------------------------------------------
    console.info('\n3. Verifying Direct MySQL Persistence (prisma.websiteSetting)...');
    const dbRow = await prisma.websiteSetting.findUnique({ where: { key: 'global.footer' } });
    assert.ok(dbRow, 'global.footer row must exist in website_settings table');
    assert.equal(dbRow.isPublic, true, 'isPublic must be true');
    const dbValue = dbRow.value as typeof updatedContent;
    assert.equal(dbValue.copyright, updatedContent.copyright);
    assert.equal(dbValue.about.description, updatedContent.about.description);
    console.info('✓ Verified MySQL persistence in website_settings table.');

    // -------------------------------------------------------------
    // TEST 4: Concurrency Conflict Protection (Optimistic Locking)
    // -------------------------------------------------------------
    console.info('\n4. Verifying Optimistic Concurrency Conflict Protection (Stale updatedAt)...');
    const conflictRes = await fetch(`${base}/api/v1/admin/settings/footer`, {
      method: 'PATCH',
      headers: adminHeaders,
      body: JSON.stringify({
        content: updatedContent,
        updatedAt: initialUpdatedAt, // Stale timestamp!
      }),
    });
    assert.equal(conflictRes.status, 409, `Expected 409 Conflict for stale update, got ${conflictRes.status}`);
    console.info('✓ Concurrency conflict (HTTP 409) detected and prevented correctly.');

    // -------------------------------------------------------------
    // TEST 5: Verify Public Footer Endpoint
    // -------------------------------------------------------------
    console.info('\n5. Verifying GET /api/v1/public/footer...');
    const publicRes = await fetch(`${base}/api/v1/public/footer`);
    assert.equal(publicRes.status, 200, `Expected 200 on public endpoint, got ${publicRes.status}`);
    const publicJson = await publicRes.json();
    assert.equal(publicJson.data.content.copyright, updatedContent.copyright);
    console.info('✓ Public footer endpoint returns active updated configuration.');

    // -------------------------------------------------------------
    // TEST 6: Restore Defaults
    // -------------------------------------------------------------
    console.info('\n6. Restoring Clean Default Footer Content...');
    const restoreRes = await fetch(`${base}/api/v1/admin/settings/footer`, {
      method: 'PATCH',
      headers: adminHeaders,
      body: JSON.stringify({
        content: footerDefaults,
        updatedAt: newUpdatedAt,
      }),
    });
    assert.equal(restoreRes.status, 200);
    console.info('✓ Reset to pristine footer defaults.');

    console.info('\n=== ALL FOOTER CMS VERIFICATION TESTS PASSED SUCCESSFULLY! ===\n');
  } finally {
    await cleanup(testUser.id);
    await prisma.$disconnect();
  }
}

main().catch((err) => {
  console.error('Footer verification failed:', err);
  process.exit(1);
});

