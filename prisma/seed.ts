import 'dotenv/config';
import argon2 from 'argon2';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const permissions = ['dashboard.read', 'pages.read', 'pages.write', 'pages.publish', 'enquiries.read', 'enquiries.export', 'users.manage', 'settings.manage'];
const roleSeeds = [
  { code: 'super_admin', name: 'Super administrator', permissions },
  { code: 'editor', name: 'Editor', permissions: ['dashboard.read', 'pages.read', 'pages.write'] },
  { code: 'publisher', name: 'Publisher', permissions: ['dashboard.read', 'pages.read', 'pages.write', 'pages.publish'] },
  { code: 'admissions', name: 'Admissions', permissions: ['dashboard.read', 'enquiries.read', 'enquiries.export'] },
  { code: 'viewer', name: 'Viewer', permissions: ['dashboard.read', 'pages.read'] },
];

async function main() {
  const email = (process.env.SEED_ADMIN_EMAIL ?? 'admin@vsmedu.local').trim().toLowerCase();
  const password = process.env.SEED_ADMIN_PASSWORD ?? 'ChangeThisPassword!123';
  if (password.length < 12 || password === 'ChangeThisPassword!123' && process.env.NODE_ENV === 'production') throw new Error('Set a unique SEED_ADMIN_PASSWORD of at least 12 characters before production seeding.');
  const passwordHash = await argon2.hash(password, { type: argon2.argon2id });
  const admin = await prisma.adminUser.upsert({ where: { email }, update: {}, create: { email, name: 'VS Medu Administrator', passwordHash } });
  const permissionRows = await Promise.all(permissions.map((code) => prisma.permission.upsert({ where: { code }, update: {}, create: { code } })));
  for (const seed of roleSeeds) {
    const role = await prisma.role.upsert({ where: { code: seed.code }, update: { name: seed.name }, create: { code: seed.code, name: seed.name } });
    await prisma.userRole.upsert({ where: { userId_roleId: { userId: admin.id, roleId: role.id } }, update: {}, create: { userId: admin.id, roleId: role.id } });
    for (const code of seed.permissions) {
      const permission = permissionRows.find((item) => item.code === code)!;
      await prisma.rolePermission.upsert({ where: { roleId_permissionId: { roleId: role.id, permissionId: permission.id } }, update: {}, create: { roleId: role.id, permissionId: permission.id } });
    }
  }
  const category = await prisma.programmeCategory.upsert({ where: { slug: 'postgraduate-diploma' }, update: {}, create: { slug: 'postgraduate-diploma', name: 'Postgraduate Diploma' } });
  for (const name of ['Marketing', 'Finance', 'Human Resources', 'Business Analytics', 'Operations and Supply Chain Management']) {
    const slug = name.toLowerCase().replaceAll(' ', '-');
    await prisma.specialisation.upsert({ where: { slug }, update: {}, create: { slug, name } });
  }
  await prisma.programme.upsert({ where: { slug: 'pgdm' }, update: {}, create: { slug: 'pgdm', title: 'Post Graduate Diploma in Management', categoryId: category.id, durationMonths: 24, status: 'DRAFT' } });
  console.info(`Seeded admin account ${email}; change its password after first sign-in.`);
}

main().finally(async () => prisma.$disconnect());
