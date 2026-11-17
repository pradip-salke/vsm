import { Router } from 'express';
import { readSliderVisibility } from '../modules/content/slider-visibility.service.js';
import { readCommonSlides } from '../modules/content/common-slides.service.js';
import { readPublicGallery } from '../modules/content/gallery.service.js';
import { readTestimonialMaster } from '../modules/content/testimonial-masters.service.js';
import { getPage, getProgrammes } from '../modules/content/content.controller.js';
import { publicHome, publicGlobalSettings } from '../modules/content/home.controller.js';
import { getPublicFooter } from '../modules/content/footer.controller.js';
import { publicAcademics, publicProgramVideos } from '../modules/content/academics.controller.js';
import { publicAima } from '../modules/content/academics-aima.controller.js';
import { publicSpecPage } from '../modules/content/academics-specialisations.controller.js';
import { publicFaculty } from '../modules/content/academics-faculty.controller.js';
import { publicAdmissions } from '../modules/content/admissions.controller.js';
import { publicPlacements } from '../modules/content/placements.controller.js';
import { publicEvents } from '../modules/content/events.controller.js';
import { aboutStore, blogPagesStore, careerStore } from '../modules/content/site-pages.stores.js';
import { publicGetBlogPost, publicListBlogPosts } from '../modules/content/blog-posts.controller.js';
import { publicRobotsTxt, publicSeo, publicSitemap } from '../modules/content/seo.controller.js';
import {
  submitGeneralEnquiry,
  submitCareerEnquiry,
  submitApplication,
  uploadResumeMiddleware,
} from '../modules/enquiries/enquiries.controller.js';

export const publicRouter = Router();
publicRouter.get('/common-slides/:scope', async (req, res) => { res.setHeader('Cache-Control', 'no-store'); res.json({ data: await readCommonSlides(String(req.params.scope)) }); });
publicRouter.get('/gallery/:page', async (req, res) => { res.setHeader('Cache-Control', 'no-store'); res.json({ data: await readPublicGallery(String(req.params.page)) }); });
publicRouter.get('/slider-visibility/:master', async (req, res) => { res.setHeader('Cache-Control', 'no-store'); res.json({ data: await readSliderVisibility(String(req.params.master)) }); });
publicRouter.get('/testimonials/:scope/:kind', async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  res.json({ data: await readTestimonialMaster(String(req.params.scope), String(req.params.kind)) });
});
publicRouter.get('/home', publicHome);
publicRouter.get('/settings/global', publicGlobalSettings);
publicRouter.get('/footer', getPublicFooter);
publicRouter.get('/academics', publicAcademics);
publicRouter.get('/academics/aima', publicAima);
publicRouter.get('/academics/specialisations/:slug', publicSpecPage);
publicRouter.get('/academics/faculty', publicFaculty);
publicRouter.get('/academics/program-videos', publicProgramVideos);
publicRouter.get('/admissions/:page', publicAdmissions);
publicRouter.get('/placements/:page', publicPlacements);
publicRouter.get('/events/:page', publicEvents);
publicRouter.get('/about/:page', aboutStore.handlers.publicPage);
publicRouter.get('/career/:page', careerStore.handlers.publicPage);
publicRouter.get('/blogs', publicListBlogPosts);
publicRouter.get('/blogs/pages/:page', blogPagesStore.handlers.publicPage);
publicRouter.get('/blogs/:slug', publicGetBlogPost);
publicRouter.get('/pages/:slug', getPage);
publicRouter.get('/programmes', getProgrammes);
publicRouter.get('/seo', publicSeo);
publicRouter.get('/seo/robots.txt', publicRobotsTxt);
publicRouter.get('/seo/:file', publicSitemap);

// Form submission endpoints
publicRouter.post('/enquiries', submitGeneralEnquiry);
publicRouter.post('/career', uploadResumeMiddleware, submitCareerEnquiry);
publicRouter.post('/applications', submitApplication);
