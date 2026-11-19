import { Router } from 'express';
import argon2 from 'argon2';
import { z } from 'zod';
import { prisma } from '../../lib/prisma.js';
import { HttpError } from '../../middleware/errors.js';

const router = Router();
const input = z.object({ name: z.string().trim().min(1).max(160), email: z.email().max(254).transform(v => v.trim().toLowerCase()), password: z.string().max(128).optional().default(''), roleId: z.number().int().positive(), status: z.enum(['ACTIVE', 'DISABLED']) });
router.use((req, _res, next) => req.auth?.roles.includes('super_admin') ? next() : next(new HttpError(403, 'FORBIDDEN', 'Administrator access required')));
router.get('/roles', async (_req, res) => { res.json({ data: await prisma.role.findMany({ select: { id: true, code: true, name: true }, orderBy: { name: 'asc' } }) }); });
router.get('/', async (req, res) => {
  const search = String(req.query.search ?? '').trim().slice(0, 160); const page = Math.max(1, Number.parseInt(String(req.query.page), 10) || 1); const size = Math.min(100, Math.max(1, Number.parseInt(String(req.query.size), 10) || 10));
  const where = { deletedAt: null, ...(search ? { OR: [{ name: { contains: search } }, { email: { contains: search } }] } : {}) };
  const [total, users] = await Promise.all([prisma.adminUser.count({ where }), prisma.adminUser.findMany({ where, skip: (page - 1) * size, take: size, orderBy: { id: 'asc' }, select: { id: true, name: true, email: true, status: true, lastLoginAt: true, userRoles: { select: { role: { select: { id: true, code: true, name: true } } } } } })]);
  res.json({ data: users, total, page, size });
});
router.post('/', async (req, res) => {
  const data = input.parse(req.body); if (data.password.length < 8) throw new HttpError(400, 'INVALID_PASSWORD', 'Password must contain at least 8 characters');
  const role = await prisma.role.findUnique({ where: { id: data.roleId } }); if (!role) throw new HttpError(400, 'INVALID_ROLE', 'Select an existing role');
  if (await prisma.adminUser.findUnique({ where: { email: data.email } })) throw new HttpError(409, 'EMAIL_IN_USE', 'Email is already in use');
  const passwordHash = await argon2.hash(data.password, { type: argon2.argon2id });
  const user = await prisma.adminUser.create({ data: { name: data.name, email: data.email, passwordHash, status: data.status, userRoles: { create: { roleId: role.id } } }, select: { id: true } }); res.status(201).json({ data: user });
});
router.put('/:id', async (req, res) => {
  const id = Number(req.params.id); const data = input.parse(req.body); if (!Number.isSafeInteger(id) || id < 1) throw new HttpError(400, 'INVALID_USER', 'Invalid user');
  if (data.password && data.password.length < 8) throw new HttpError(400, 'INVALID_PASSWORD', 'Password must contain at least 8 characters');
  const [user, role, duplicate] = await Promise.all([prisma.adminUser.findFirst({ where: { id, deletedAt: null }, include: { userRoles: { include: { role: true } } } }), prisma.role.findUnique({ where: { id: data.roleId } }), prisma.adminUser.findUnique({ where: { email: data.email } })]);
  if (!user) throw new HttpError(404, 'NOT_FOUND', 'User not found'); if (!role) throw new HttpError(400, 'INVALID_ROLE', 'Select an existing role'); if (duplicate && duplicate.id !== id) throw new HttpError(409, 'EMAIL_IN_USE', 'Email is already in use');
  if (id === req.auth!.userId && (data.status !== 'ACTIVE' || role.code !== 'super_admin')) throw new HttpError(400, 'SELF_LOCKOUT', 'You cannot disable your own account or remove your administrator role');
  const passwordHash = data.password ? await argon2.hash(data.password, { type: argon2.argon2id }) : undefined;
  await prisma.$transaction(async tx => { await tx.adminUser.update({ where: { id }, data: { name: data.name, email: data.email, status: data.status, ...(passwordHash ? { passwordHash } : {}) } }); if (!user.userRoles.some(item => item.roleId === role.id)) { await tx.userRole.deleteMany({ where: { userId: id } }); await tx.userRole.create({ data: { userId: id, roleId: role.id } }); } if (data.status === 'DISABLED' || passwordHash) await tx.session.deleteMany({ where: { userId: id } }); });
  res.json({ data: { id } });
});
export { router as usersRouter };
