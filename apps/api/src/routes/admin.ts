import { Router } from 'express';
import { requireAuth, requirePermission, requireTrustedOrigin } from '../middleware/auth.js';
import { dashboard, createPage, listPages } from '../modules/admin/admin.controller.js';

export const adminRouter = Router();
adminRouter.use(requireTrustedOrigin, requireAuth);

adminRouter.get('/dashboard', requirePermission('dashboard.read'), dashboard);
adminRouter.post('/pages', requirePermission('pages.write'), createPage);
adminRouter.get('/pages', requirePermission('pages.read'), listPages);
