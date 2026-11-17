import 'server-only';
import legacyArticles from '@/content/blogs.json';
import type { BlogPostRecord } from '@vsmedu/contracts/blogs';
import { blogPages } from '@vsmedu/contracts/blogs';

export type BlogDetailPageSettings = {
  links: typeof blogPages.detail.sections.links;
};

export type BlogArticle = {
  id: number | string;
  slug: string;
  title: string;
  excerpt: string;
  body: string;
  image: string;
  imageAlt: string;
  categories: string[];
  authorName: string;
  authorRole: string;
  authorImageUrl: string;
  authorBio: string;
  date: string;
  seoTitle: string;
  seoDescription: string;
  canonicalUrl: string;
  ogImageUrl: string;
  noIndex: boolean;
};

type LegacyArticle = (typeof legacyArticles)[number];
type PublicBlogPage = { items: BlogPostRecord[]; total: number; page: number; pageSize: number; pageCount: number };

const apiBase = () => process.env.API_BASE_URL ?? 'http://localhost:4000';
const imagePath = (url: string) => url && !url.startsWith('/') && !/^https?:\/\//i.test(url) ? `/${url}` : url;

function plainText(html: string) {
  return html.replace(/<[^>]*>/g, ' ').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim();
}

function articleFromRecord(post: BlogPostRecord): BlogArticle {
  return {
    id: post.id,
    slug: post.slug,
    title: post.title,
    excerpt: post.excerpt,
    body: post.body ?? '',
    image: imagePath(post.coverImageUrl),
    imageAlt: post.coverImageAlt || post.title,
    categories: post.categories,
    authorName: post.authorName,
    authorRole: post.authorRole,
    authorImageUrl: post.authorImageUrl,
    authorBio: post.authorBio,
    date: post.publishedAt ?? post.createdAt,
    seoTitle: post.seoTitle,
    seoDescription: post.seoDescription,
    canonicalUrl: post.canonicalUrl,
    ogImageUrl: post.ogImageUrl,
    noIndex: post.noIndex,
  };
}

function articleFromLegacy(post: LegacyArticle): BlogArticle {
  return {
    id: post.id,
    slug: post.slug,
    title: post.title,
    excerpt: `<p>${plainText(post.content).slice(0, 320)}</p>`,
    body: post.content,
    image: imagePath(post.image),
    imageAlt: post.title,
    categories: post.categories,
    authorName: '',
    authorRole: '',
    authorImageUrl: '',
    authorBio: '',
    date: post.date,
    seoTitle: '',
    seoDescription: '',
    canonicalUrl: '',
    ogImageUrl: post.image,
    noIndex: false,
  };
}

const fallbackArticles = (legacyArticles as LegacyArticle[]).map(articleFromLegacy);

export async function getBlogDetailPageSettings(): Promise<BlogDetailPageSettings> {
  try {
    const response = await fetch(`${apiBase()}/api/v1/public/blogs/pages/detail`, { cache: 'no-store', signal: AbortSignal.timeout(5000) });
    if (!response.ok) throw new Error(`Blog page API returned ${response.status}`);
    const data = (await response.json() as { data: { sections: Record<string, unknown> } }).data;
    const links = { ...blogPages.detail.sections.links, ...(data.sections.links as Partial<typeof blogPages.detail.sections.links>) };
    return { links };
  } catch (error) {
    console.error('Blog detail page settings unavailable; using bundled defaults.', error instanceof Error ? error.message : 'Unknown error');
    return { links: blogPages.detail.sections.links };
  }
}

export async function getPublicBlogPage(requestedPage: number, fallbackPageSize = 8) {
  try {
    const response = await fetch(`${apiBase()}/api/v1/public/blogs?page=${requestedPage}`, {
      cache: 'no-store',
      signal: AbortSignal.timeout(5000),
    });
    if (!response.ok) throw new Error(`Blog API returned ${response.status}`);
    const result = (await response.json() as { data: PublicBlogPage }).data;
    return { ...result, items: result.items.map(articleFromRecord) };
  } catch (error) {
    console.error('Blog API unavailable; using bundled blog content.', error instanceof Error ? error.message : 'Unknown error');
    const pageSize = fallbackPageSize;
    const pageCount = Math.max(1, Math.ceil(fallbackArticles.length / pageSize));
    const page = Math.min(Math.max(requestedPage, 1), pageCount);
    return {
      items: fallbackArticles.slice((page - 1) * pageSize, page * pageSize),
      total: fallbackArticles.length,
      page,
      pageSize,
      pageCount,
    };
  }
}

export async function getPublicBlogPost(slug: string): Promise<BlogArticle | null> {
  try {
    const response = await fetch(`${apiBase()}/api/v1/public/blogs/${encodeURIComponent(slug)}`, {
      cache: 'no-store',
      signal: AbortSignal.timeout(5000),
    });
    if (response.status === 404) return null;
    if (!response.ok) throw new Error(`Blog API returned ${response.status}`);
    return articleFromRecord((await response.json() as { data: BlogPostRecord }).data);
  } catch (error) {
    console.error('Blog detail API unavailable; using bundled blog content.', error instanceof Error ? error.message : 'Unknown error');
    return fallbackArticles.find((article) => article.slug === slug) ?? null;
  }
}
