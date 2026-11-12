// Blogs (/blogs/ and /blogs/<slug>/) — page settings plus blog post management (blog_posts table).
import { z } from 'zod';
import { BANNER_BREADCRUMB_SUBTITLE, SEO_SUBTITLE, innerBannerSlide, type SitePageDefinition } from './site-pages.js';

export const blogPages = {
  listing: {
    path: '/blogs/',
    navTitle: 'Blog Listing',
    sections: {
      hero: { breadcrumb: [{ label: 'Home', href: '/' }, { label: 'Blogs', href: '' }] },
      heading: {
        eyebrow: 'Insights & Ideas',
        title: 'Latest from VSM',
        intro: 'Explore ideas on management education, careers, admissions, and the changing world of business.',
      },
      listing: { pageSize: 8, readMoreText: 'Read article', imageFallbackText: 'VSM' },
      seo: { metaTitle: 'Blogs | Valia School of Management', metaDescription: 'Insights, guides, and perspectives from Valia School of Management.' },
    },
    masters: {
      hero: { items: [innerBannerSlide('Blogs', 'Stories, insights, and perspectives from VSM', { text: 'Explore articles', href: '#blog-articles' })] },
    },
    labels: { hero: 'Page Banner Breadcrumb', heading: 'Listing Heading', listing: 'Listing Settings', seo: 'SEO Settings' },
    subtitles: {
      hero: BANNER_BREADCRUMB_SUBTITLE,
      heading: 'Eyebrow, heading and intro above the article cards.',
      listing: 'Articles per page, card link text and the placeholder shown when a post has no featured image.',
      seo: SEO_SUBTITLE,
    },
  },
  detail: {
    path: '/blogs/',
    navTitle: 'Blog Detail Template',
    sections: {
      links: {
        bannerButtonText: 'Browse all blogs',
        bannerButtonHref: '/blogs/',
        backLinkText: '← All blogs',
        footerLinkText: '← Back to all blogs',
        breadcrumbParent: 'Blogs',
      },
      seo: { titleSuffix: ' | Valia School of Management', notFoundTitle: 'Blog not found | Valia School of Management' },
    },
    masters: {
      hero: { items: [innerBannerSlide('VSM Blog', 'Ideas and perspectives for future-ready leaders', { text: 'Browse all blogs', href: '/blogs/' })] },
    },
    labels: { links: 'Detail Page Links', seo: 'Detail SEO Settings' },
    subtitles: {
      links: 'Banner button, back links and breadcrumb label shared by every blog detail page. Article content is managed in Blog Posts.',
      seo: 'Title suffix appended to each article title, and the title used when a post is not found.',
    },
  },
} satisfies Record<string, SitePageDefinition>;

export type BlogPageSlug = keyof typeof blogPages;
export const blogPageSlugs = Object.keys(blogPages) as BlogPageSlug[];

export const BlogStatusSchema = z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']);
const optionalUrl = z
  .string()
  .trim()
  .max(2048)
  .refine((v) => !v || /^(\/(?!\/)|https?:\/\/)/.test(v), 'Use a site path or an HTTP(S) URL');

export const BlogPostInputSchema = z
  .object({
    title: z.string().trim().min(3, 'Title is required').max(240),
    slug: z
      .string()
      .trim()
      .min(3)
      .max(240)
      .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Use lowercase letters, numbers and hyphens'),
    excerpt: z.string().max(20000).default(''),
    body: z.string().max(500000).default(''),
    coverImageUrl: optionalUrl.default(''),
    coverImageAlt: z.string().trim().max(500).default(''),
    categories: z.array(z.string().trim().min(1).max(120)).max(20).default([]),
    tags: z.array(z.string().trim().min(1).max(120)).max(40).default([]),
    authorName: z.string().trim().max(160).default(''),
    authorRole: z.string().trim().max(160).default(''),
    authorImageUrl: optionalUrl.default(''),
    authorBio: z.string().max(2000).default(''),
    featured: z.boolean().default(false),
    status: BlogStatusSchema.default('DRAFT'),
    publishedAt: z.string().datetime({ offset: true }).nullable().default(null),
    seoTitle: z.string().trim().max(255).default(''),
    seoDescription: z.string().trim().max(500).default(''),
    canonicalUrl: optionalUrl.default(''),
    ogImageUrl: optionalUrl.default(''),
    noIndex: z.boolean().default(false),
    updatedAt: z.string().datetime().nullable().optional(),
  })
  .strict();

export type BlogPostInput = z.input<typeof BlogPostInputSchema>;
export type BlogPostStatus = z.infer<typeof BlogStatusSchema>;

export type BlogPostRecord = {
  id: number;
  slug: string;
  title: string;
  excerpt: string;
  body: string;
  coverImageUrl: string;
  coverImageAlt: string;
  categories: string[];
  tags: string[];
  authorName: string;
  authorRole: string;
  authorImageUrl: string;
  authorBio: string;
  featured: boolean;
  status: BlogPostStatus;
  publishedAt: string | null;
  seoTitle: string;
  seoDescription: string;
  canonicalUrl: string;
  ogImageUrl: string;
  noIndex: boolean;
  createdAt: string;
  updatedAt: string;
};
