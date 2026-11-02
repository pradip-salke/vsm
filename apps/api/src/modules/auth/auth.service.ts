import argon2 from 'argon2';
import { env } from '../../config/env.js';
import { HttpError } from '../../middleware/errors.js';
import { createSessionToken, hashSessionToken } from '../../security/session.js';
import { authRepository } from './auth.repository.js';

export const authService = {
  async login(input: { email: string; password: string; userAgent?: string; ipAddress?: string; requestId?: string }) {
    const user = await authRepository.findUserByEmail(input.email.trim().toLowerCase());
    const valid = user?.status === 'ACTIVE' && await argon2.verify(user.passwordHash, input.password).catch(() => false);
    if (!user || !valid) throw new HttpError(401, 'INVALID_CREDENTIALS', 'Email or password is incorrect');
    const token = createSessionToken();
    const expiresAt = new Date(Date.now() + env.SESSION_TTL_HOURS * 60 * 60 * 1000);
    await authRepository.createSession({ tokenHash: hashSessionToken(token), userId: user.id, expiresAt, userAgent: input.userAgent?.slice(0, 500), ipAddress: input.ipAddress, requestId: input.requestId });
    return { token, expiresAt, user: { id: user.id, name: user.name, email: user.email } };
  },
  async changePassword(userId: number, currentPassword: string, newPassword: string, requestId?: string) {
    const user = await authRepository.findUserById(userId);
    if (!user || user.status !== 'ACTIVE' || !await argon2.verify(user.passwordHash, currentPassword).catch(() => false)) {
      throw new HttpError(400, 'CURRENT_PASSWORD_INVALID', 'Current password is incorrect');
    }
    if (currentPassword === newPassword) throw new HttpError(400, 'PASSWORD_UNCHANGED', 'Choose a different password');
    const passwordHash = await argon2.hash(newPassword, { type: argon2.argon2id });
    await authRepository.updatePassword(userId, passwordHash, requestId);
  },
  revokeSession: (token: string) => authRepository.revokeSession(token),
};
