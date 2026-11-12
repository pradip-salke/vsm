import 'dotenv/config';
import assert from 'node:assert/strict';
import { PrismaClient } from '@prisma/client';
import argon2 from 'argon2';
import sharp from 'sharp';
import { unlink } from 'node:fs/promises';
import { resolve } from 'node:path';
import { homeDefaults, homeMasterDefaults } from '../packages/contracts/src/home';

const prisma = new PrismaClient();
const base = process.env.API_BASE_URL ?? 'http://localhost:4000';
const origin = process.env.ADMIN_ORIGIN ?? 'http://localhost:5173';
const email = 'home-cms-audit@example.invalid';
const password = 'Temporary-Home-CMS-Audit!2026';
async function cleanup() {
  const user = await prisma.adminUser.findUnique({ where: { email } });
  if (user?.name === 'Temporary Home CMS audit') {
    const documents = await prisma.websiteSetting.findMany({ where: { key: { startsWith: 'home.' } }, select: { value: true } });
    const assets = await prisma.mediaAsset.findMany({ where: { originalName: 'home-cms-ui-audit.png', createdAt: { gte: user.createdAt } } });
    for (const asset of assets) {
      const filename = asset.storageKey.slice(5);
      if (!/^home\/[a-f0-9-]+\.webp$/.test(asset.storageKey) || documents.some(doc => JSON.stringify(doc.value).includes(`/cms-media/${filename}`))) continue;
      await prisma.mediaAsset.delete({ where: { id: asset.id } });
      await unlink(resolve(process.env.MEDIA_ROOT ?? 'uploads/home', filename)).catch(() => undefined);
    }
    await prisma.auditLog.deleteMany({ where: { actorId: user.id } });
    await prisma.adminUser.delete({ where: { id: user.id } });
  }
}
async function main() {
  if (process.argv.includes('--cleanup')) { await cleanup(); return; }
  assert.equal(await prisma.adminUser.count({ where: { email } }), 0, 'Audit account must not already exist');
  await prisma.adminUser.create({ data: { email, name: 'Temporary Home CMS audit', passwordHash: await argon2.hash(password), userRoles: { create: { role: { connect: { code: 'editor' } } } } } });
  const login = await fetch(`${base}/api/v1/auth/login`, { method: 'POST', headers: { Origin: origin, 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password }) });
  assert.equal(login.status, 200);
  const cookie = login.headers.get('set-cookie')!.split(';')[0]!;
  const headers = { Cookie: cookie, Origin: origin, 'Content-Type': 'application/json' };
  const get = async (key: string) => (await (await fetch(`${base}/api/v1/admin/home/${key}`, { headers })).json()).data;
  const save = (key: string, document: unknown) => fetch(`${base}/api/v1/admin/home/${key}`, { method: 'PATCH', headers, body: JSON.stringify(document) });
  let documents = 0;
  const keys = [...Object.keys(homeDefaults), ...Object.keys(homeMasterDefaults).map(key => `master-${key}`)];
  for (const key of keys) {
    const original = await get(key);
    try {
      const edited = structuredClone(original.content);
      if (Array.isArray(edited.items)) {
        const item = structuredClone(edited.items[0]);
        edited.items.push(item); // create/push
        edited.items.reverse(); // ordering
        if (item && typeof item === 'object' && 'enabled' in item) edited.items[0].enabled = false;
      }
      if (typeof edited.title === 'string') edited.title += ' [audit]';
      if (typeof edited.body === 'string') edited.body += '\nCMS audit';
      const response = await save(key, { content: edited, updatedAt: original.updatedAt });
      assert.equal(response.status, 200, `${key}: ${await response.clone().text()}`);
      const saved = (await response.json()).data;
      assert.deepEqual(saved.content, edited, `${key} persisted fields`);
      const publicResult = (await (await fetch(`${base}/api/v1/public/home`)).json()).data;
      assert.deepEqual(key.startsWith('master-') ? publicResult.masters[key.slice(7)] : publicResult.sections[key], edited, `${key} public update`);
      assert.equal((await save(key, { content: edited, updatedAt: original.updatedAt })).status, 409, 'Stale saves rejected');
      if (Array.isArray(edited.items)) {
        edited.items.pop(); // remove
        assert.equal((await save(key, { content: edited, updatedAt: saved.updatedAt })).status, 200);
      }
      documents++;
    } finally { const current = await get(key); assert.equal((await save(key, { content: original.content, updatedAt: current.updatedAt })).status, 200, `Restore ${key}`); }
  }
  assert.equal((await save('about', { content: { ...homeDefaults.about, buttonHref: 'javascript:alert(1)' }, updatedAt: (await get('about')).updatedAt })).status, 400);
  assert.equal((await fetch(`${base}/api/v1/admin/home/about`)).status, 401);
  const assets: { id: number; src: string }[] = [];
  const originalCta = await get('cta');
  try {
    for (const color of ['red', 'blue']) {
      const image = await sharp({ create: { width: 40, height: 30, channels: 3, background: color } }).png().toBuffer();
      const response = await fetch(`${base}/api/v1/admin/home-media`, { method: 'POST', headers: { ...headers, 'Content-Type': 'image/png', 'X-File-Name': 'cms-audit.png' }, body: image });
      assert.equal(response.status, 201, await response.clone().text());
      const asset = (await response.json()).data; assets.push(asset);
      assert.equal(asset.width, 40); assert.equal(asset.height, 30);
      assert.equal((await fetch(`${base}${asset.src}`)).status, 200);
      const current = await get('cta');
      assert.equal((await save('cta', { content: { ...current.content, image: { src: asset.src, alt: 'audit', width: asset.width, height: asset.height } }, updatedAt: current.updatedAt })).status, 200);
    }
    const invalid = await fetch(`${base}/api/v1/admin/home-media`, { method: 'POST', headers: { ...headers, 'Content-Type': 'image/png' }, body: 'not an image' });
    assert.equal(invalid.status, 400);
  } finally {
    const current = await get('cta'); await save('cta', { content: originalCta.content, updatedAt: current.updatedAt });
    for (const asset of assets) { await prisma.mediaAsset.delete({ where: { id: asset.id } }); await unlink(resolve(process.env.MEDIA_ROOT ?? 'uploads/home', asset.src.split('/').at(-1)!)); }
  }
  console.info(`Passed: ${documents} document round-trips, ordered list add/remove, active states, conflicts, authentication, URL validation, image upload/replacement and public reads. Original content restored.`);
}
main().finally(async () => { if (!process.argv.includes('--keep-user')) await cleanup(); await prisma.$disconnect(); });
