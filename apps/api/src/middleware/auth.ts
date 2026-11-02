import type { RequestHandler } from 'express';
import { env } from '../config/env.js';
import { HttpError } from './errors.js';
import { authRepository } from '../modules/auth/auth.repository.js';

const safeOrigins = new Set([env.WEB_ORIGIN, env.ADMIN_ORIGIN]);
export const requireTrustedOrigin: RequestHandler = (req, _res, next) => {
  if (req.method === 'GET' || req.method === 'HEAD' || req.method === 'OPTIONS') { next(); return; }
  const origin = req.get('origin');
  if (!origin || !safeOrigins.has(origin)) { next(new HttpError(403, 'CSRF_REJECTED', 'Request origin is not allowed')); return; }
  next();
};

export const requireAuth: RequestHandler = async (req, _res, next) => {
  try {
    const token = req.headers.cookie?.split(';').map((part) => part.trim()).find((part) => part.startsWith(`${env.SESSION_COOKIE_NAME}=`))?.slice(env.SESSION_COOKIE_NAME.length + 1);
    if (!token) throw new HttpError(401, 'UNAUTHENTICATED', 'Please sign in');
    const session = await authRepository.findSession(token);
    if (!session || session.expiresAt <= new Date() || session.user.status !== 'ACTIVE') {
      if (session) await authRepository.revokeSession(token);
      throw new HttpError(401, 'UNAUTHENTICATED', 'Please sign in');
    }
    const roles = session.user.userRoles.map(({ role }) => role.code);
    const permissions = [...new Set(session.user.userRoles.flatMap(({ role }) => role.rolePermissions.map(({ permission }) => permission.code)))];
    req.auth = { userId: session.user.id, email: session.user.email, roles, permissions };
    next();
  } catch (error) { next(error); }
};

export function requirePermission(permission: string): RequestHandler {
  return (req, _res, next) => {
    if (!req.auth?.permissions.includes(permission) && !req.auth?.roles.includes('super_admin')) {
      next(new HttpError(403, 'FORBIDDEN', 'You do not have permission to perform this action'));
      return;
    }
    next();
  };
}
