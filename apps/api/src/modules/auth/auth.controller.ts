import type { RequestHandler } from 'express';
import { z } from 'zod';
import { env } from '../../config/env.js';
import { authService } from './auth.service.js';

const LoginSchema = z.object({ email: z.email().max(254), password: z.string().min(1).max(256) });
function cookieToken(req: Parameters<RequestHandler>[0]) {
  return req.headers.cookie?.split(';').map((part) => part.trim()).find((part) => part.startsWith(`${env.SESSION_COOKIE_NAME}=`))?.slice(env.SESSION_COOKIE_NAME.length + 1);
}

export const login: RequestHandler = async (req, res) => {
  const input = LoginSchema.parse(req.body);
  const result = await authService.login({ email: input.email, password: input.password, userAgent: req.get('user-agent'), ipAddress: req.ip, requestId: req.requestId });
  res.cookie(env.SESSION_COOKIE_NAME, result.token, { httpOnly: true, secure: env.COOKIE_SECURE, sameSite: 'lax', path: '/api/v1', expires: result.expiresAt });
  res.json({ data: result.user });
};

export const logout: RequestHandler = async (req, res) => {
  const token = cookieToken(req);
  if (token) await authService.revokeSession(token);
  res.clearCookie(env.SESSION_COOKIE_NAME, { httpOnly: true, secure: env.COOKIE_SECURE, sameSite: 'lax', path: '/api/v1' });
  res.status(204).end();
};

export const me: RequestHandler = (req, res) => res.json({ data: req.auth });

const ChangePasswordSchema = z.object({ currentPassword: z.string().min(1).max(256), newPassword: z.string().min(12).max(256) });
export const changePassword: RequestHandler = async (req, res) => {
  const input = ChangePasswordSchema.parse(req.body);
  await authService.changePassword(req.auth!.userId, input.currentPassword, input.newPassword, req.requestId);
  res.clearCookie(env.SESSION_COOKIE_NAME, { httpOnly: true, secure: env.COOKIE_SECURE, sameSite: 'lax', path: '/api/v1' });
  res.status(204).end();
};
