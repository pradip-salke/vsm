// SEO Studio — page-wise SEO overrides, global search settings, tracking codes, robots.txt and sitemaps.
import { seoGalleryAlbumPages, seoSpecialisationPages } from './seo-pages-data.js';

export const SEO_ROBOTS_OPTIONS = ['index, follow', 'noindex, follow', 'index, nofollow', 'noindex, nofollow'] as const;
export type SeoRobots = (typeof SEO_ROBOTS_OPTIONS)[number];

/** Per-URL overrides. Empty strings keep the page's own value. */
export type SeoPageOverride = {
  focusKeyword: string;
  metaTitle: string;
  metaDescription: string;
  canonicalUrl: string;
  robots: SeoRobots;
  metaKeywords: string;
  ogTitle: string;
  ogDescription: string;
  ogImage: string;
  schemaJson: string;
};

export const seoPageOverrideDefaults: SeoPageOverride = {
  focusKeyword: '',
  metaTitle: '',
  metaDescription: '',
  canonicalUrl: '',
  robots: 'index, follow',
  metaKeywords: '',
  ogTitle: '',
  ogDescription: '',
  ogImage: '',
  schemaJson: '',
};

/** True when the override changes anything the website outputs. */
export function seoOverrideIsActive(o: Partial<SeoPageOverride> | null | undefined): boolean {
  if (!o) return false;
  return Boolean(o.metaTitle || o.metaDescription || o.canonicalUrl || o.metaKeywords || o.ogTitle || o.ogDescription || o.ogImage || o.schemaJson || (o.robots && o.robots !== 'index, follow'));
}

export type SeoGlobalSettings = {
  googleVerification: string;
  bingVerification: string;
  yandexVerification: string;
  pinterestVerification: string;
  facebookVerification: string;
  enableOrgSchema: boolean;
  orgName: string;
  websiteUrl: string;
  orgLogo: string;
  contactEmail: string;
  contactPhone: string;
  socialUrls: string;
  enableSitelinksSearchbox: boolean;
  siteSearchUrl: string;
  defaultShareImage: string;
  twitterHandle: string;
};

export const seoGlobalDefaults: SeoGlobalSettings = {
  googleVerification: '',
  bingVerification: '',
  yandexVerification: '',
  pinterestVerification: '',
  facebookVerification: '',
  enableOrgSchema: true,
  orgName: 'Valia School of Management',
  websiteUrl: '',
  orgLogo: '/images/brand/vsm-logo.svg',
  contactEmail: 'info@vsmedu.in',
  contactPhone: '+91 730 434 3478',
  socialUrls: [
    'https://www.facebook.com/profile.php?id=61569771774772',
    'https://twitter.com/ValiaSOM',
    'https://www.instagram.com/vsom_official/',
    'https://www.linkedin.com/company/108657561/',
    'https://www.youtube.com/@valiaschoolofmanagement',
  ].join('\n'),
  enableSitelinksSearchbox: false,
  siteSearchUrl: '',
  defaultShareImage: '',
  twitterHandle: '@ValiaSOM',
};

export const SEO_VERIFICATION_KEYS = ['googleVerification', 'bingVerification', 'yandexVerification', 'pinterestVerification', 'facebookVerification'] as const;

export type SeoTrackingSettings = {
  googleAnalyticsId: string;
  gtmContainerId: string;
  metaPixelId: string;
  clarityProjectId: string;
  customHeadCode: string;
  customBodyStartCode: string;
  customBodyEndCode: string;
};

export const seoTrackingDefaults: SeoTrackingSettings = {
  googleAnalyticsId: '',
  gtmContainerId: '',
  metaPixelId: '',
  clarityProjectId: '',
  customHeadCode: '',
  customBodyStartCode: '',
  customBodyEndCode: '',
};

export const SEO_TRACKING_PATTERNS = {
  googleAnalyticsId: /^G-[A-Z0-9]{4,16}$/,
  gtmContainerId: /^GTM-[A-Z0-9]{4,12}$/,
  metaPixelId: /^\d{8,20}$/,
  clarityProjectId: /^[a-z0-9]{6,20}$/,
} as const;

export type SeoPageGroup = 'main' | 'specialisations' | 'gallery' | 'blogs';
export type SeoPageEntry = { path: string; label: string; group: SeoPageGroup };

export const seoPageGroups: { id: SeoPageGroup; label: string }[] = [
  { id: 'main', label: 'Main pages' },
  { id: 'specialisations', label: 'Specialisations' },
  { id: 'gallery', label: 'Gallery albums' },
  { id: 'blogs', label: 'Blog posts' },
];

const main = (path: string, label: string): SeoPageEntry => ({ path, label, group: 'main' });

/** Every public URL except blog posts, which are read from the blog_posts table. */
export const seoStaticPages: SeoPageEntry[] = [
  main('/', 'Home'),
  main('/about-us/about-vsm-mba-pgdm-colleges-in-mumbai/', 'About VSM'),
  main('/about-us/our-philosophy/', 'Our Philosophy'),
  main('/about-us/academic-advisory-board/', 'Academic Advisory Board'),
  main('/about-us/trustee-message/', 'Trustee Message'),
  main('/about-us/vice-chairman-message/', 'Vice Chairman Message'),
  main('/about-us/director-message/', "Director's Message"),
  main('/about-us/affiliation-industry-leadership/', 'Affiliation & Industry Leadership'),
  main('/about-us/infrastructure/', 'Infrastructure'),
  main('/about-us/student-residence/', 'Student Residence'),
  main('/our-academics/aicte-pgdm-courses-in-mumbai/', 'AICTE PGDM'),
  main('/our-academics/aima-pgdm/', 'AIMA PGDM'),
  main('/faculty/', 'Faculty'),
  main('/admissions/mba-pgdm-admissions-process/', 'Admissions Process'),
  main('/admissions/pgdm-fee-structure/', 'PGDM Fee Structure'),
  main('/admissions/application-form/', 'Application Form'),
  main('/admissions/refund-policy/', 'Refund Policy'),
  main('/placements/', 'Placements'),
  main('/placements/our-recruiters/', 'Our Recruiters'),
  main('/placements/placement-records/', 'Placement Records'),
  main('/placements/placement-records/pgdm-2022-24-batch/', 'PGDM 2022–24 Batch'),
  main('/placements/placement-records/pgdm-2021-23-batch/', 'PGDM 2021–23 Batch'),
  main('/placements/alumni/', 'Alumni'),
  main('/events/gallery/', 'Photo Gallery'),
  main('/events/gallery/2/', 'Photo Gallery – Page 2'),
  main('/events/achievements/', 'Achievements'),
  main('/list-of-speakers/', 'List of Speakers'),
  main('/videos-of-speakers/', 'Videos of Speakers'),
  main('/blogs/', 'Blogs'),
  main('/career/', 'Career'),
  main('/contact-us/', 'Contact Us'),
  main('/connect-with-us/', 'Connect With Us'),
  ...seoSpecialisationPages.map((page) => ({ ...page, group: 'specialisations' as const })),
  ...seoGalleryAlbumPages.map((page) => ({ ...page, group: 'gallery' as const })),
];

export const blogPostSeoPath = (slug: string) => `/blogs/${slug}/`;

/** Canonical form used for storage and lookups: leading and trailing slash, no query or hash. */
export function normaliseSeoPath(input: string): string {
  const path = (input.split(/[?#]/)[0] ?? '/').trim();
  const withLead = path.startsWith('/') ? path : `/${path}`;
  return withLead.endsWith('/') ? withLead : `${withLead}/`;
}

export type SeoSitemap = { file: string; label: string; description: string; groups: SeoPageGroup[]; changefreq: string; priority: string };

export const seoSitemaps: SeoSitemap[] = [
  { file: 'sitemap.xml', label: 'sitemap.xml', description: 'Main website pages and specialisations', groups: ['main', 'specialisations'], changefreq: 'weekly', priority: '0.8' },
  { file: 'blog-sitemap.xml', label: 'blog-sitemap.xml', description: 'Generated automatically from published blog posts', groups: ['blogs'], changefreq: 'monthly', priority: '0.6' },
  { file: 'gallery-sitemap.xml', label: 'gallery-sitemap.xml', description: 'Generated automatically from event gallery albums', groups: ['gallery'], changefreq: 'monthly', priority: '0.5' },
];

export function defaultRobotsTxt(siteUrl: string): string {
  const base = siteUrl.replace(/\/+$/, '');
  return ['User-agent: *', 'Disallow: /api/', 'Allow: /', '', ...seoSitemaps.map(({ file }) => `Sitemap: ${base}/${file}`)].join('\n');
}

export type SeoCheck = { id: string; status: 'pass' | 'warn' | 'fail'; text: string };

export type SeoScoreInput = {
  title: string;
  description: string;
  focusKeyword?: string;
  canonical?: string;
  ogImage?: string;
  /** Unknown (not inspected yet) when undefined. */
  h1Count?: number;
  imagesTotal?: number;
  imagesMissingAlt?: number;
};

export const SEO_TITLE_RANGE = [30, 60] as const;
export const SEO_DESCRIPTION_RANGE = [120, 160] as const;

/** Shared 0–100 score used by the Page SEO live gauge and the SEO audit. */
export function scoreSeo(input: SeoScoreInput): { score: number; checks: SeoCheck[] } {
  const checks: SeoCheck[] = [];
  let score = 0;
  const title = input.title.trim();
  const description = input.description.trim();
  const keyword = (input.focusKeyword ?? '').trim().toLowerCase();
  const [tMin, tMax] = SEO_TITLE_RANGE;
  const [dMin, dMax] = SEO_DESCRIPTION_RANGE;

  if (!title) checks.push({ id: 'title', status: 'fail', text: 'SEO title is missing.' });
  else if (title.length >= tMin && title.length <= tMax) { score += 20; checks.push({ id: 'title', status: 'pass', text: `Title length is optimal (${title.length} characters, aim for ${tMin}–${tMax}).` }); }
  else { score += 10; checks.push({ id: 'title', status: 'warn', text: `Title is ${title.length} characters (aim for ${tMin}–${tMax}).` }); }

  if (!description) checks.push({ id: 'description', status: 'fail', text: 'Meta description is missing.' });
  else if (description.length >= dMin && description.length <= dMax) { score += 20; checks.push({ id: 'description', status: 'pass', text: `Description length is optimal (${description.length} characters, aim for ${dMin}–${dMax}).` }); }
  else { score += 10; checks.push({ id: 'description', status: 'warn', text: `Description is ${description.length} characters (aim for ${dMin}–${dMax}).` }); }

  if (!keyword) {
    checks.push({ id: 'keyword-title', status: 'warn', text: 'Add a focus keyphrase to check keyword use.' });
  } else {
    const inTitle = title.toLowerCase().includes(keyword);
    const inDescription = description.toLowerCase().includes(keyword);
    if (inTitle) score += 10;
    if (inDescription) score += 10;
    checks.push({ id: 'keyword-title', status: inTitle ? 'pass' : 'fail', text: inTitle ? `Focus keyphrase "${keyword}" found in the SEO title.` : 'Focus keyphrase is missing from the SEO title.' });
    checks.push({ id: 'keyword-description', status: inDescription ? 'pass' : 'fail', text: inDescription ? `Focus keyphrase "${keyword}" found in the meta description.` : 'Focus keyphrase is missing from the meta description.' });
  }

  const canonical = (input.canonical ?? '').trim();
  if (canonical && /^(https?:\/\/[^\s]+|\/[^\s]*)$/.test(canonical)) { score += 10; checks.push({ id: 'canonical', status: 'pass', text: 'Canonical URL is set.' }); }
  else checks.push({ id: 'canonical', status: canonical ? 'fail' : 'warn', text: canonical ? 'Canonical URL is not a valid URL.' : 'No canonical URL found.' });

  if ((input.ogImage ?? '').trim()) { score += 10; checks.push({ id: 'og-image', status: 'pass', text: 'Share image is set.' }); }
  else checks.push({ id: 'og-image', status: 'warn', text: 'No share image (og:image); a default share image is recommended.' });

  if (input.h1Count !== undefined) {
    if (input.h1Count === 1) { score += 10; checks.push({ id: 'h1', status: 'pass', text: 'Page has exactly one H1 heading.' }); }
    else checks.push({ id: 'h1', status: input.h1Count === 0 ? 'fail' : 'warn', text: input.h1Count === 0 ? 'Page has no H1 heading.' : `Page has ${input.h1Count} H1 headings (use exactly one).` });
  }

  if (input.imagesTotal !== undefined) {
    const missing = input.imagesMissingAlt ?? 0;
    if (missing === 0) { score += 10; checks.push({ id: 'images', status: 'pass', text: input.imagesTotal ? `All ${input.imagesTotal} images have alt text.` : 'No images on the page.' }); }
    else checks.push({ id: 'images', status: 'warn', text: `${missing} of ${input.imagesTotal} images have no alt text.` });
  }

  // Unknown page facts (not inspected) are scored on the remaining 80 points.
  const max = 80 + (input.h1Count !== undefined ? 10 : 0) + (input.imagesTotal !== undefined ? 10 : 0);
  return { score: Math.round((score / max) * 100), checks };
}

export function seoScoreLabel(score: number): 'Good' | 'Needs improvement' | 'Poor' {
  return score >= 80 ? 'Good' : score >= 60 ? 'Needs improvement' : 'Poor';
}
