// Career page (/career/) — CMS defaults mirroring the current static page.
import { homeDefaults } from './home.js';
import { BANNER_BREADCRUMB_SUBTITLE, SEO_SUBTITLE, innerBannerSlide, type SitePageDefinition } from './site-pages.js';

export const careerPages = {
  career: {
    path: '/career/',
    navTitle: 'Career',
    sections: {
      hero: { breadcrumb: [{ label: 'Home', href: '/' }, { label: 'Career', href: '' }] },
      application: {
        image: { src: 'https://vsmedu.com/wp-content/uploads/2025/11/2150917138.jpg', alt: 'Professionals collaborating in a modern workplace', width: 800, height: 1000 },
        captionEyebrow: 'Build your future',
        captionTitle: 'Grow with VSM',
        formTitle: 'Apply for a position',
        formIntro: 'Share your details and resume with our team.',
      },
      cta: structuredClone(homeDefaults.cta),
      seo: {
        metaTitle: 'Career | Valia School of Management',
        metaDescription: 'Explore career opportunities at Valia School of Management and apply for a position.',
      },
    },
    masters: {
      hero: { items: [innerBannerSlide('Start your career with VSM', 'VSM Career Opportunities', { text: 'Apply for a position', href: '#career-application' })] },
    },
    labels: {
      hero: 'Page Banner Breadcrumb',
      application: 'Application Section',
      cta: 'Apply Now Banner (Career page)',
      seo: 'SEO Settings',
    },
    subtitles: {
      hero: BANNER_BREADCRUMB_SUBTITLE,
      application: 'Image with caption beside the application form, and the form heading / intro. Form fields are managed in code; submissions appear under Enquiries → Career.',
      cta: 'Closing banner on the Career page only (independent of the Home page banner).',
      seo: SEO_SUBTITLE,
    },
  },
} satisfies Record<string, SitePageDefinition>;

export type CareerPageSlug = keyof typeof careerPages;
export const careerPageSlugs = Object.keys(careerPages) as CareerPageSlug[];
