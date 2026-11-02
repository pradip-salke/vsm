import { prisma } from '../../lib/prisma.js';
import { hashSessionToken } from '../../security/session.js';

export const authRepository = {
  findUserByEmail: (email: string) => prisma.adminUser.findUnique({ where: { email } }),
  findUserById: (id: number) => prisma.adminUser.findUnique({ where: { id } }),
  createSession: (input: { tokenHash: string; userId: number; expiresAt: Date; userAgent?: string; ipAddress?: string; requestId?: string }) => prisma.$transaction([
    prisma.session.create({ data: { tokenHash: input.tokenHash, userId: input.userId, expiresAt: input.expiresAt, userAgent: input.userAgent, ipAddress: input.ipAddress } }),
    prisma.adminUser.update({ where: { id: input.userId }, data: { lastLoginAt: new Date() } }),
    prisma.auditLog.create({ data: { actorId: input.userId, action: 'auth.login', entityType: 'admin_user', entityId: String(input.userId), requestId: input.requestId } }),
  ]),
  findSession: (token: string) => prisma.session.findUnique({
    where: { tokenHash: hashSessionToken(token) },
    include: {
      user: {
        include: {
          userRoles: {
            include: {
              role: {
                include: {
                  rolePermissions: { include: { permission: true } },
                },
              },
            },
          },
        },
      },
    },
  }),
  revokeSession: (token: string) => prisma.session.deleteMany({ where: { tokenHash: hashSessionToken(token) } }),
  async updatePassword(userId: number, passwordHash: string, requestId?: string) {
    await prisma.$transaction([
      prisma.adminUser.update({ where: { id: userId }, data: { passwordHash } }),
      prisma.session.deleteMany({ where: { userId } }),
      prisma.auditLog.create({ data: { actorId: userId, action: 'auth.password_change', entityType: 'admin_user', entityId: String(userId), requestId } }),
    ]);
  },
};
