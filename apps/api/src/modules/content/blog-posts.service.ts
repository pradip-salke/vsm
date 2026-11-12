import { Prisma } from '@prisma/client';
import sanitizeHtml from 'sanitize-html';
import { z } from 'zod';
import { BlogPostInputSchema, BlogStatusSchema, type BlogPostRecord } from '@vsmedu/contracts/blogs';
import { prisma } from '../../lib/prisma.js';
import { HttpError } from '../../middleware/errors.js';
import { blogPagesStore } from './site-pages.stores.js';

const ARTICLE_TAGS = [
  'p', 'div', 'span', 'br', 'hr', 'strong', 'b', 'em', 'i', 'u', 's', 'sub', 'sup', 'small', 'mark', 'cite', 'q', 'code', 'pre',
  'h2', 'h3', 'h4', 'h5', 'h6', 'ul', 'ol', 'li', 'a', 'img', 'figure', 'figcaption', 'blockquote', 'section', 'nav', 'article', 'aside',
  'table', 'thead', 'tbody', 'tfoot', 'tr', 'th', 'td', 'caption', 'colgroup', 'col',
  'svg', 'defs', 'lineargradient', 'stop', 'path', 'g', 'circle', 'rect', 'script',
];

/** Article HTML: keeps WordPress structure (TOC anchors, tables, figures, icons) and JSON-LD; drops executable content. */
export function cleanArticleHtml(html: string) {
  return sanitizeHtml(html, {
    allowedTags: ARTICLE_TAGS,
    allowVulnerableTags: true,
    allowedAttributes: {
      '*': ['class', 'id', 'style', 'title', 'role', 'aria-*', 'data-*', 'tabindex'],
      a: ['href', 'target', 'rel', 'source'],
      img: ['src', 'srcset', 'sizes', 'alt', 'width', 'height', 'loading', 'decoding'],
      td: ['colspan', 'rowspan'],
      th: ['colspan', 'rowspan', 'scope'],
      table: ['width'],
      script: ['type'],
      svg: ['xmlns', 'xmlns:xlink', 'width', 'height', 'viewbox', 'viewBox', 'fill'],
      lineargradient: ['id', 'x1', 'x2', 'y1', 'y2', 'gradientunits'],
      stop: ['offset', 'stop-color', 'stop-opacity'],
      path: ['d', 'fill', 'stroke', 'stroke-width'],
      circle: ['cx', 'cy', 'r', 'fill'],
      rect: ['x', 'y', 'width', 'height', 'rx', 'fill'],
    },
    allowedSchemes: ['http', 'https', 'mailto', 'tel'],
    allowedSchemesByTag: { img: ['http', 'https'] },
    allowProtocolRelative: false,
    exclusiveFilter: (frame) => frame.tag === 'script' && frame.attribs.type !== 'application/ld+json',
  });
}

type Row = Prisma.BlogPostGetPayload<{ include: { seo: true } }>;

const strings = (value: Prisma.JsonValue | null) => (Array.isArray(value) ? value.filter((v): v is string => typeof v === 'string') : []);

function toRecord(row: Row): BlogPostRecord {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    excerpt: row.excerpt ?? '',
    body: row.body ?? '',
    coverImageUrl: row.coverImageUrl ?? '',
    coverImageAlt: row.coverImageAlt ?? '',
    categories: strings(row.categories),
    tags: strings(row.tags),
    authorName: row.authorName ?? '',
    authorRole: row.authorRole ?? '',
    authorImageUrl: row.authorImageUrl ?? '',
    authorBio: row.authorBio ?? '',
    featured: row.featured,
    status: row.status,
    publishedAt: row.publishedAt?.toISOString() ?? null,
    seoTitle: row.seo?.title ?? '',
    seoDescription: row.seo?.description ?? '',
    canonicalUrl: row.seo?.canonicalUrl ?? '',
    ogImageUrl: row.seo?.ogImageUrl ?? '',
    noIndex: row.seo?.noIndex ?? false,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

const unique = (values: string[]) => [...new Map(values.map((v) => [v.toLowerCase(), v])).values()];

function toData(input: z.output<typeof BlogPostInputSchema>) {
  const publishedAt = input.publishedAt ? new Date(input.publishedAt) : input.status === 'PUBLISHED' ? new Date() : null;
  const seo = {
    title: input.seoTitle || null,
    description: input.seoDescription || null,
    canonicalUrl: input.canonicalUrl || null,
    ogImageUrl: input.ogImageUrl || null,
    noIndex: input.noIndex,
  };
  return {
    data: {
      slug: input.slug,
      title: input.title,
      excerpt: cleanArticleHtml(input.excerpt),
      body: cleanArticleHtml(input.body),
      coverImageUrl: input.coverImageUrl || null,
      coverImageAlt: input.coverImageAlt || null,
      categories: unique(input.categories),
      tags: unique(input.tags),
      authorName: input.authorName || null,
      authorRole: input.authorRole || null,
      authorImageUrl: input.authorImageUrl || null,
      authorBio: input.authorBio || null,
      featured: input.featured,
      status: input.status,
      publishedAt,
    },
    seo,
  };
}

async function assertSlugFree(slug: string, exceptId?: number) {
  const other = await prisma.blogPost.findUnique({ where: { slug }, select: { id: true } });
  if (other && other.id !== exceptId) throw new HttpError(409, 'BLOG_SLUG_TAKEN', `Another post already uses the URL slug "${slug}".`);
}

async function findOr404(id: number) {
  const row = await prisma.blogPost.findUnique({ where: { id }, include: { seo: true } });
  if (!row) throw new HttpError(404, 'BLOG_POST_NOT_FOUND', 'Blog post not found');
  return row;
}

const audit = (tx: Prisma.TransactionClient, action: string, id: number, actorId: number, requestId?: string) =>
  tx.auditLog.create({ data: { actorId, action, entityType: 'blog_post', entityId: String(id), requestId } });

const ListQuery = z.object({
  q: z.string().trim().max(200).optional(),
  status: BlogStatusSchema.optional(),
  category: z.string().trim().max(120).optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
});

export async function listBlogPostsAdmin(query: unknown) {
  const { q, status, category, page, pageSize } = ListQuery.parse(query);
  const rows = await prisma.blogPost.findMany({
    where: {
      ...(status ? { status } : {}),
      ...(q ? { OR: [{ title: { contains: q } }, { slug: { contains: q } }, { authorName: { contains: q } }] } : {}),
    },
    orderBy: [{ publishedAt: { sort: 'desc', nulls: 'first' } }, { id: 'desc' }],
    select: { id: true, slug: true, title: true, status: true, featured: true, publishedAt: true, updatedAt: true, categories: true, tags: true, coverImageUrl: true, authorName: true },
  });
  const filtered = category ? rows.filter((row) => strings(row.categories).includes(category)) : rows;
  const all = await prisma.blogPost.findMany({ select: { categories: true, tags: true, status: true } });
  const count = (key: 'categories' | 'tags') => {
    const counts = new Map<string, number>();
    for (const row of all) for (const value of strings(row[key])) counts.set(value, (counts.get(value) ?? 0) + 1);
    return [...counts].map(([name, total]) => ({ name, total })).sort((a, b) => a.name.localeCompare(b.name));
  };
  return {
    items: filtered.slice((page - 1) * pageSize, page * pageSize).map((row) => ({
      ...row,
      categories: strings(row.categories),
      tags: strings(row.tags),
      publishedAt: row.publishedAt?.toISOString() ?? null,
      updatedAt: row.updatedAt.toISOString(),
    })),
    total: filtered.length,
    page,
    pageSize,
    categories: count('categories'),
    tags: count('tags'),
    statusCounts: Object.fromEntries(BlogStatusSchema.options.map((s) => [s, all.filter((row) => row.status === s).length])),
  };
}

export async function getBlogPostAdmin(id: number) {
  return toRecord(await findOr404(id));
}

export async function createBlogPost(input: unknown, actorId: number, requestId?: string) {
  const parsed = BlogPostInputSchema.parse(input);
  await assertSlugFree(parsed.slug);
  const { data, seo } = toData(parsed);
  const row = await prisma.$transaction(async (tx) => {
    const created = await tx.blogPost.create({ data: { ...data, seo: { create: seo } }, include: { seo: true } });
    await audit(tx, 'blog_post.create', created.id, actorId, requestId);
    return created;
  });
  return toRecord(row);
}

export async function updateBlogPost(id: number, input: unknown, actorId: number, requestId?: string) {
  const parsed = BlogPostInputSchema.parse(input);
  const old = await findOr404(id);
  if (!parsed.updatedAt || parsed.updatedAt !== old.updatedAt.toISOString()) {
    throw new HttpError(409, 'CONTENT_CONFLICT', 'This post was updated elsewhere. Reload before saving.');
  }
  await assertSlugFree(parsed.slug, id);
  const { data, seo } = toData(parsed);
  if (old.publishedAt && parsed.status === 'PUBLISHED' && !parsed.publishedAt) data.publishedAt = old.publishedAt;
  const row = await prisma.$transaction(async (tx) => {
    const result = await tx.blogPost.updateMany({ where: { id, updatedAt: old.updatedAt }, data });
    if (result.count === 0) throw new HttpError(409, 'CONTENT_CONFLICT', 'This post was updated elsewhere. Reload before saving.');
    await tx.seoMetadata.upsert({ where: { blogPostId: id }, create: { ...seo, blogPostId: id }, update: seo });
    await audit(tx, 'blog_post.update', id, actorId, requestId);
    return tx.blogPost.findUniqueOrThrow({ where: { id }, include: { seo: true } });
  });
  return toRecord(row);
}

const StatusInput = z.object({ status: BlogStatusSchema, updatedAt: z.string().datetime() }).strict();

export async function setBlogPostStatus(id: number, input: unknown, actorId: number, requestId?: string) {
  const { status, updatedAt } = StatusInput.parse(input);
  const old = await findOr404(id);
  if (old.updatedAt.toISOString() !== updatedAt) throw new HttpError(409, 'CONTENT_CONFLICT', 'This post was updated elsewhere. Reload before changing status.');
  const row = await prisma.$transaction(async (tx) => {
    const result = await tx.blogPost.updateMany({
      where: { id, updatedAt: old.updatedAt },
      data: { status, publishedAt: status === 'PUBLISHED' ? (old.publishedAt ?? new Date()) : old.publishedAt },
    });
    if (result.count === 0) throw new HttpError(409, 'CONTENT_CONFLICT', 'This post was updated elsewhere. Reload before changing status.');
    await audit(tx, status === 'PUBLISHED' ? 'blog_post.publish' : 'blog_post.unpublish', id, actorId, requestId);
    return tx.blogPost.findUniqueOrThrow({ where: { id }, include: { seo: true } });
  });
  return toRecord(row);
}

export async function deleteBlogPost(id: number, actorId: number, requestId?: string) {
  await findOr404(id);
  await prisma.$transaction(async (tx) => {
    await tx.blogPost.delete({ where: { id } });
    await audit(tx, 'blog_post.delete', id, actorId, requestId);
  });
}

const publicWhere = (): Prisma.BlogPostWhereInput => ({ status: 'PUBLISHED', deletedAt: null, publishedAt: { lte: new Date() } });

const PublicQuery = z.object({ page: z.coerce.number().int().min(1).default(1), category: z.string().trim().max(120).optional(), tag: z.string().trim().max(120).optional() });

export async function listBlogPostsPublic(query: unknown) {
  const { page, category, tag } = PublicQuery.parse(query);
  const settings = (await blogPagesStore.read('listing', 'listing')).content as { pageSize?: number };
  const pageSize = Math.min(Math.max(Number(settings.pageSize) || 8, 1), 100);
  const rows = await prisma.blogPost.findMany({ where: publicWhere(), orderBy: [{ publishedAt: 'desc' }, { id: 'desc' }], include: { seo: true } });
  const filtered = rows
    .map(toRecord)
    .filter((post) => (!category || post.categories.includes(category)) && (!tag || post.tags.includes(tag)));
  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  const current = Math.min(page, pageCount);
  return {
    items: filtered.slice((current - 1) * pageSize, current * pageSize).map(({ body: _body, ...rest }) => rest),
    total: filtered.length,
    page: current,
    pageSize,
    pageCount,
  };
}

export async function getBlogPostPublic(slug: string) {
  const row = await prisma.blogPost.findFirst({ where: { ...publicWhere(), slug }, include: { seo: true } });
  if (!row) throw new HttpError(404, 'BLOG_POST_NOT_FOUND', 'Blog post not found');
  return toRecord(row);
}
