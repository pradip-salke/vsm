import { aboutPages } from '@vsmedu/contracts/about-pages';
import { careerPages } from '@vsmedu/contracts/career-page';
import { blogPages } from '@vsmedu/contracts/blogs';
import { createSitePageStore } from './site-page-store.js';

export const aboutStore = createSitePageStore({
  group: 'about',
  label: 'About Us',
  registry: aboutPages,
  richKeys: ['subtitle', 'body', 'intro', 'closing'],
  requiredKeys: ['metaTitle'],
});

export const careerStore = createSitePageStore({
  group: 'career',
  label: 'Career',
  registry: careerPages,
  richKeys: ['subtitle', 'intro'],
  requiredKeys: ['metaTitle', 'formTitle', 'buttonText'],
});

export const blogPagesStore = createSitePageStore({
  group: 'blogs',
  label: 'Blogs',
  registry: blogPages,
  richKeys: ['subtitle', 'intro'],
  requiredKeys: ['metaTitle', 'readMoreText', 'backLinkText'],
});
