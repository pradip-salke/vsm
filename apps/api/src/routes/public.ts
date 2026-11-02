import { Router } from 'express';
import { getPage, getProgrammes, submitEnquiry } from '../modules/content/content.controller.js';

export const publicRouter = Router();
publicRouter.get('/pages/:slug', getPage);
publicRouter.get('/programmes', getProgrammes);
publicRouter.post('/enquiries', submitEnquiry);
