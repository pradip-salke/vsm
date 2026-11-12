import { Router } from 'express';
import { changePassword, login, logout, me, patchProfile } from '../modules/auth/auth.controller.js';
import { requireAuth, requireTrustedOrigin } from '../middleware/auth.js';

export const authRouter = Router();
authRouter.post('/login', requireTrustedOrigin, login);
authRouter.post('/logout', requireTrustedOrigin, requireAuth, logout);
authRouter.patch('/profile', requireTrustedOrigin, requireAuth, patchProfile);
authRouter.post('/password', requireTrustedOrigin, requireAuth, changePassword);
authRouter.get('/me', requireAuth, me);
