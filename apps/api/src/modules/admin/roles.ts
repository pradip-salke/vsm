import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../../lib/prisma.js';
import { HttpError } from '../../middleware/errors.js';
import { Prisma } from '@prisma/client';

const router = Router();
const input = z.object({ name: z.string().trim().min(1).max(120), code: z.string().trim().regex(/^[a-z][a-z0-9_]*$/).max(80), description: z.string().trim().max(500), isActive: z.boolean().default(true), permissionIds: z.array(z.number().int().positive()).max(100), menuVisibility: z.array(z.string().regex(/^\/(?!\/)/).max(300)).max(500).nullable().optional() });
router.use((req, _res, next) => req.auth?.roles.includes('super_admin') ? next() : next(new HttpError(403, 'FORBIDDEN', 'Administrator access required')));
router.get('/permissions', async (_req, res) => res.json({ data: await prisma.permission.findMany({ orderBy: { code: 'asc' }, select: { id: true, code: true, description: true } }) }));
router.get('/', async (_req, res) => res.json({ data: await prisma.role.findMany({ orderBy: { name: 'asc' }, include: { _count: { select: { userRoles: true } }, rolePermissions: { select: { permissionId: true } } } }) }));
router.post('/', async (req, res) => {
  const data = input.parse(req.body);
  if (await prisma.role.findUnique({ where: { code: data.code } })) throw new HttpError(409, 'ROLE_EXISTS', 'Role code already exists');
  const ids = [...new Set(data.permissionIds)];
  if (await prisma.permission.count({ where: { id: { in: ids } } }) !== ids.length) throw new HttpError(400, 'INVALID_PERMISSION', 'A permission does not exist');
  const role = await prisma.role.create({ data: { code: data.code, name: data.name, description: data.description, isActive: data.isActive, ...(data.menuVisibility !== undefined ? { menuVisibility: data.menuVisibility ?? Prisma.DbNull } : {}), rolePermissions: { create: ids.map(permissionId => ({ permissionId })) } }, select: { id: true } });
  res.status(201).json({ data: role });
});
router.put('/:id', async (req, res) => {
  const id = Number(req.params.id); const data = input.parse(req.body);
  if (!Number.isSafeInteger(id) || id < 1) throw new HttpError(400, 'INVALID_ROLE', 'Invalid role');
  const role = await prisma.role.findUnique({ where: { id } });
  if (!role) throw new HttpError(404, 'NOT_FOUND', 'Role not found');
  if (role.code === 'super_admin' || data.code === 'super_admin') throw new HttpError(403, 'PROTECTED_ROLE', 'The super administrator role cannot be changed');
  const ids = [...new Set(data.permissionIds)];
  if (await prisma.permission.count({ where: { id: { in: ids } } }) !== ids.length) throw new HttpError(400, 'INVALID_PERMISSION', 'A permission does not exist');
  const duplicate = await prisma.role.findUnique({ where: { code: data.code } });
  if (duplicate && duplicate.id !== id) throw new HttpError(409, 'ROLE_EXISTS', 'Role code already exists');
  await prisma.$transaction(async tx => { await tx.role.update({ where: { id }, data: { name: data.name, code: data.code, description: data.description, isActive: data.isActive, ...(data.menuVisibility !== undefined ? { menuVisibility: data.menuVisibility ?? Prisma.DbNull } : {}) } }); await tx.rolePermission.deleteMany({ where: { roleId: id } }); if (ids.length) await tx.rolePermission.createMany({ data: ids.map(permissionId => ({ roleId: id, permissionId })) }); });
  res.json({ data: { id } });
});
router.delete('/:id', async (req, res) => {
  const id = Number(req.params.id); if (!Number.isSafeInteger(id) || id < 1) throw new HttpError(400, 'INVALID_ROLE', 'Invalid role');
  const { replacementRoleId } = z.object({ replacementRoleId: z.number().int().positive().optional() }).parse(req.body ?? {});
  await prisma.$transaction(async tx => {
    const role = await tx.role.findUnique({ where: { id }, include: { userRoles: { select: { userId: true } } } });
    if (!role) throw new HttpError(404, 'NOT_FOUND', 'Role not found');
    if (role.code === 'super_admin') throw new HttpError(403, 'PROTECTED_ROLE', 'The super administrator role cannot be deleted');
    if (role.userRoles.length) {
      if (!replacementRoleId || replacementRoleId === id) throw new HttpError(409, 'ROLE_IN_USE', 'Select a different active role for assigned users');
      const replacement = await tx.role.findUnique({ where: { id: replacementRoleId } });
      if (!replacement?.isActive) throw new HttpError(400, 'INVALID_REPLACEMENT', 'Replacement role must be active');
      for (const { userId } of role.userRoles) await tx.userRole.upsert({ where: { userId_roleId: { userId, roleId: replacementRoleId } }, update: {}, create: { userId, roleId: replacementRoleId } });
    }
    await tx.role.delete({ where: { id } });
  });
  res.status(204).end();
});
export { router as rolesRouter };
