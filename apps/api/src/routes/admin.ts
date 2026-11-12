import { Router, raw } from 'express';
import { uploadHomeImage, uploadProgramVideo } from '../modules/content/home-media.js';
import { requireAuth, requirePermission, requireTrustedOrigin } from '../middleware/auth.js';
import { dashboard, createPage, listPages } from '../modules/admin/admin.controller.js';
import {
  homeDocument,
  saveHomeDocument,
  listHomeSections,
  saveHomeSections,
  getGlobalSettings,
  saveGlobalSettings,
} from '../modules/content/home.controller.js';
import {
  getFooterAdmin,
  saveFooterAdmin,
} from '../modules/content/footer.controller.js';
import {
  listAcademicsSections,
  academicsDocument,
  saveAcademicsDocument,
  saveAcademicsSections,
} from '../modules/content/academics.controller.js';
import {
  listAimaSections,
  aimaDocument,
  saveAimaDocument,
  aimaMasterDocument,
  saveAimaMasterDocument,
  saveAimaSections,
} from '../modules/content/academics-aima.controller.js';
import {
  listSpecSections,
  listSpecSlugSections,
  specDocument,
  saveSpecDocument,
  specMasterDocument,
  saveSpecMasterDocument,
  saveSpecSlugSections,
} from '../modules/content/academics-specialisations.controller.js';
import {
  listFacultySections,
  saveFacultySections,
  facultyDocument,
  saveFacultyDocument,
  facultyMasterDocument,
  saveFacultyMasterDocument,
} from '../modules/content/academics-faculty.controller.js';
import {
  listAdmissionsSections,
  saveAdmissionsSections,
  admissionsDocument,
  saveAdmissionsDocument,
  admissionsMasterDocument,
  saveAdmissionsMasterDocument,
} from '../modules/content/admissions.controller.js';
import {
  listPlacementsSections,
  savePlacementsSections,
  placementsDocument,
  savePlacementsDocument,
  placementsMasterDocument,
  savePlacementsMasterDocument,
} from '../modules/content/placements.controller.js';
import {
  listEventsSections,
  saveEventsSections,
  eventsDocument,
  saveEventsDocument,
  eventsMasterDocument,
  saveEventsMasterDocument,
} from '../modules/content/events.controller.js';
import { aboutStore, blogPagesStore, careerStore } from '../modules/content/site-pages.stores.js';
import {
  seoNoStore,
  seoOverview,
  seoListPages,
  seoReadPage,
  seoSavePage,
  seoResetPage,
  seoReadGlobal,
  seoSaveGlobal,
  seoReadTracking,
  seoSaveTracking,
  seoReadRobots,
  seoSaveRobots,
  seoAudit,
} from '../modules/content/seo.controller.js';
import {
  adminCreateBlogPost,
  adminDeleteBlogPost,
  adminGetBlogPost,
  adminListBlogPosts,
  adminSetBlogPostStatus,
  adminUpdateBlogPost,
} from '../modules/content/blog-posts.controller.js';
import {
  getCareerEnquiries,
  getGeneralEnquiries,
  getApplications,
  setEnquiryStatus,
  setApplicationStatus,
  removeEnquiry,
  removeApplication,
} from '../modules/enquiries/enquiries.controller.js';

export const adminRouter = Router();
adminRouter.use(requireTrustedOrigin, requireAuth);

adminRouter.get('/dashboard', requirePermission('dashboard.read'), dashboard);

// Enquiries Management endpoints
adminRouter.get('/enquiries/career', requirePermission('enquiries.read', 'pages.read'), getCareerEnquiries);
adminRouter.get('/enquiries/general', requirePermission('enquiries.read', 'pages.read'), getGeneralEnquiries);
adminRouter.get('/enquiries/applications', requirePermission('enquiries.read', 'pages.read'), getApplications);
adminRouter.patch('/enquiries/:id/status', requirePermission('enquiries.export', 'pages.write'), setEnquiryStatus);
adminRouter.delete('/enquiries/:id', requirePermission('enquiries.export', 'pages.write'), removeEnquiry);
adminRouter.patch('/applications/:id/status', requirePermission('enquiries.export', 'pages.write'), setApplicationStatus);
adminRouter.delete('/applications/:id', requirePermission('enquiries.export', 'pages.write'), removeApplication);

// Bulk Home Page endpoints (must come before /home/:key)
adminRouter.get('/home', requirePermission('pages.read'), listHomeSections);
adminRouter.patch('/home', requirePermission('pages.write'), saveHomeSections);

// Single Home Section endpoints (for backwards compatibility & masters)
adminRouter.get('/home/:key', requirePermission('pages.read'), homeDocument);
adminRouter.patch('/home/:key', requirePermission('pages.write'), saveHomeDocument);

// AICTE PGDM page endpoints (bulk routes must come before /academics/:key)
adminRouter.get('/academics', requirePermission('pages.read'), listAcademicsSections);
adminRouter.patch('/academics', requirePermission('pages.write'), saveAcademicsSections);

// Teaching Faculty page (academics-faculty.* keys); master routes before /:key
adminRouter.get('/academics/faculty', requirePermission('pages.read'), listFacultySections);
adminRouter.patch('/academics/faculty', requirePermission('pages.write'), saveFacultySections);
adminRouter.get('/academics/faculty/master-:masterKey', requirePermission('pages.read'), facultyMasterDocument);
adminRouter.patch('/academics/faculty/master-:masterKey', requirePermission('pages.write'), saveFacultyMasterDocument);
adminRouter.get('/academics/faculty/:key', requirePermission('pages.read'), facultyDocument);
adminRouter.patch('/academics/faculty/:key', requirePermission('pages.write'), saveFacultyDocument);

// AIMA PGDM page (academics-aima.* keys)
adminRouter.get('/academics/aima', requirePermission('pages.read'), listAimaSections);
adminRouter.patch('/academics/aima', requirePermission('pages.write'), saveAimaSections);

// In-demand specialisations – full admin dump (optional)
adminRouter.get('/academics/specialisations', requirePermission('pages.read'), listSpecSections);

// Per-slug specialisation pages (use /page/:slug so "hero" is never parsed as a slug)
adminRouter.get(
  '/academics/specialisations/page/:slug',
  requirePermission('pages.read'),
  listSpecSlugSections
);
adminRouter.patch(
  '/academics/specialisations/page/:slug',
  requirePermission('pages.write'),
  saveSpecSlugSections
);
adminRouter.get(
  '/academics/specialisations/page/:slug/master-:masterKey',
  requirePermission('pages.read'),
  specMasterDocument
);
adminRouter.patch(
  '/academics/specialisations/page/:slug/master-:masterKey',
  requirePermission('pages.write'),
  saveSpecMasterDocument
);
adminRouter.get(
  '/academics/specialisations/page/:slug/:section',
  requirePermission('pages.read'),
  specDocument
);
adminRouter.patch(
  '/academics/specialisations/page/:slug/:section',
  requirePermission('pages.write'),
  saveSpecDocument
);

// Master routes must be registered before /:key so paths like master-hero are not parsed as a section key
adminRouter.get('/academics/aima/master-:masterKey', requirePermission('pages.read'), aimaMasterDocument);
adminRouter.patch('/academics/aima/master-:masterKey', requirePermission('pages.write'), saveAimaMasterDocument);
adminRouter.get('/academics/aima/:key', requirePermission('pages.read'), aimaDocument);
adminRouter.patch('/academics/aima/:key', requirePermission('pages.write'), saveAimaDocument);

adminRouter.get('/academics/:key', requirePermission('pages.read'), academicsDocument);
adminRouter.patch('/academics/:key', requirePermission('pages.write'), saveAcademicsDocument);

// Admissions pages (admissions.<page>.* keys); master routes before /:key
adminRouter.get('/admissions/:page', requirePermission('pages.read'), listAdmissionsSections);
adminRouter.patch('/admissions/:page', requirePermission('pages.write'), saveAdmissionsSections);
adminRouter.get('/admissions/:page/master-:masterKey', requirePermission('pages.read'), admissionsMasterDocument);
adminRouter.patch('/admissions/:page/master-:masterKey', requirePermission('pages.write'), saveAdmissionsMasterDocument);
adminRouter.get('/admissions/:page/:key', requirePermission('pages.read'), admissionsDocument);
adminRouter.patch('/admissions/:page/:key', requirePermission('pages.write'), saveAdmissionsDocument);
// Placements pages (placements.<page>.* keys); master routes before /:key
adminRouter.get('/placements/:page', requirePermission('pages.read'), listPlacementsSections);
adminRouter.patch('/placements/:page', requirePermission('pages.write'), savePlacementsSections);
adminRouter.get('/placements/:page/master-:masterKey', requirePermission('pages.read'), placementsMasterDocument);
adminRouter.patch('/placements/:page/master-:masterKey', requirePermission('pages.write'), savePlacementsMasterDocument);
adminRouter.get('/placements/:page/:key', requirePermission('pages.read'), placementsDocument);
adminRouter.patch('/placements/:page/:key', requirePermission('pages.write'), savePlacementsDocument);
// Events pages (events.<page>.* keys); master routes before /:key
adminRouter.get('/events/:page', requirePermission('pages.read'), listEventsSections);
adminRouter.patch('/events/:page', requirePermission('pages.write'), saveEventsSections);
adminRouter.get('/events/:page/master-:masterKey', requirePermission('pages.read'), eventsMasterDocument);
adminRouter.patch('/events/:page/master-:masterKey', requirePermission('pages.write'), saveEventsMasterDocument);
adminRouter.get('/events/:page/:key', requirePermission('pages.read'), eventsDocument);
adminRouter.patch('/events/:page/:key', requirePermission('pages.write'), saveEventsDocument);
// About Us / Career / Blogs page settings (<group>.<page>.* keys); master routes before /:key
for (const [base, store] of [
  ['/about', aboutStore],
  ['/career', careerStore],
  ['/blogs/pages', blogPagesStore],
] as const) {
  adminRouter.get(`${base}/:page`, requirePermission('pages.read'), store.handlers.list);
  adminRouter.patch(`${base}/:page`, requirePermission('pages.write'), store.handlers.bulk);
  adminRouter.get(`${base}/:page/master-:masterKey`, requirePermission('pages.read'), store.handlers.readMaster);
  adminRouter.patch(`${base}/:page/master-:masterKey`, requirePermission('pages.write'), store.handlers.saveMaster);
  adminRouter.get(`${base}/:page/:key`, requirePermission('pages.read'), store.handlers.read);
  adminRouter.patch(`${base}/:page/:key`, requirePermission('pages.write'), store.handlers.save);
}
// Blog posts (blog_posts table)
adminRouter.get('/blog-posts', requirePermission('pages.read'), adminListBlogPosts);
adminRouter.post('/blog-posts', requirePermission('pages.write'), adminCreateBlogPost);
adminRouter.get('/blog-posts/:id', requirePermission('pages.read'), adminGetBlogPost);
adminRouter.patch('/blog-posts/:id', requirePermission('pages.write'), adminUpdateBlogPost);
adminRouter.patch('/blog-posts/:id/status', requirePermission('pages.write'), adminSetBlogPostStatus);
adminRouter.delete('/blog-posts/:id', requirePermission('pages.write'), adminDeleteBlogPost);

// SEO Studio (website_settings rows: seo.global, seo.tracking, seo.robots, seo.page.<hash>)
adminRouter.use('/seo', seoNoStore);
adminRouter.get('/seo/overview', requirePermission('pages.read'), seoOverview);
adminRouter.get('/seo/pages', requirePermission('pages.read'), seoListPages);
adminRouter.get('/seo/page', requirePermission('pages.read'), seoReadPage);
adminRouter.patch('/seo/page', requirePermission('pages.write'), seoSavePage);
adminRouter.delete('/seo/page', requirePermission('pages.write'), seoResetPage);
adminRouter.get('/seo/global', requirePermission('pages.read'), seoReadGlobal);
adminRouter.patch('/seo/global', requirePermission('pages.write'), seoSaveGlobal);
adminRouter.get('/seo/tracking', requirePermission('pages.read'), seoReadTracking);
adminRouter.patch('/seo/tracking', requirePermission('pages.write'), seoSaveTracking);
adminRouter.get('/seo/robots', requirePermission('pages.read'), seoReadRobots);
adminRouter.patch('/seo/robots', requirePermission('pages.write'), seoSaveRobots);
adminRouter.get('/seo/audit', requirePermission('pages.read'), seoAudit);

// Global Settings endpoints
adminRouter.get('/settings/global', requirePermission('pages.read'), getGlobalSettings);
adminRouter.patch('/settings/global', requirePermission('pages.write'), saveGlobalSettings);

// Footer Settings endpoints
adminRouter.get('/settings/footer', requirePermission('pages.read'), getFooterAdmin);
adminRouter.patch('/settings/footer', requirePermission('pages.write'), saveFooterAdmin);
adminRouter.put('/settings/footer', requirePermission('pages.write'), saveFooterAdmin);

adminRouter.post('/home-media', requirePermission('pages.write'), raw({ type: ['image/png', 'image/jpeg', 'image/webp', 'image/avif', 'image/svg+xml'], limit: '2mb' }), uploadHomeImage);
adminRouter.post('/academics/video-media', requirePermission('pages.write'), raw({ type: ['video/mp4', 'video/webm', 'video/ogg'], limit: '100mb' }), uploadProgramVideo);
adminRouter.post('/pages', requirePermission('pages.write'), createPage);
adminRouter.get('/pages', requirePermission('pages.read'), listPages);
