import 'dotenv/config';
import { createHash } from 'node:crypto';
import { mkdir, stat, writeFile } from 'node:fs/promises';
import { basename, resolve } from 'node:path';
import sharp from 'sharp';
import { prisma } from '../apps/api/src/lib/prisma.js';
import { homeMediaRoot } from '../apps/api/src/modules/content/home-media.js';
import { cleanArticleHtml, createBlogPost, getBlogPostAdmin, updateBlogPost } from '../apps/api/src/modules/content/blog-posts.service.js';

type SourceTerm = { id: number; name: string };
type SourceMedia = { id: number; source_url: string; alt_text: string; filename: string };
type SourceUser = { id: number; name: string; description: string; avatar_urls?: Record<string, string> };
type SourcePost = {
  id: number; date: string; date_gmt: string; modified_gmt: string; slug: string; status: string; link: string;
  title: { rendered: string }; content: { rendered: string }; excerpt: { rendered: string };
  author: number; featured_media: number; categories: number[]; tags: number[]; sticky: boolean;
};
type Seo = { title: string; description: string; canonicalUrl: string; ogImageUrl: string; noIndex: boolean };
type PreparedImage = { url: string; fileName: string; storageKey: string; originalName: string; bytes: Buffer; width: number; height: number; checksum: string };

const SOURCE = 'https://vsmedu.com';
const APPLY = process.argv.includes('--apply');
const VERIFY_ONLY = process.argv.includes('--verify-only');
const PAGE_SIZE = 100;
const decodeHtml = (value: string) => value
  .replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#039;|&apos;/g, "'")
  .replace(/&lt;/g, '<').replace(/&gt;/g, '>')
  .replace(/&#x([0-9a-f]+);/gi, (_, hex: string) => String.fromCodePoint(parseInt(hex, 16)))
  .replace(/&#(\d+);/g, (_, decimal: string) => String.fromCodePoint(Number(decimal)));

async function get<T>(url: string): Promise<{ data: T; response: Response }> {
  const response = await fetch(url, { signal: AbortSignal.timeout(40000), headers: { 'User-Agent': 'VSM-Blog-Migration/1.0' } });
  if (!response.ok) throw new Error(`GET ${url} returned HTTP ${response.status}`);
  return { data: await response.json() as T, response };
}

async function html(url: string): Promise<string> {
  const response = await fetch(url, { signal: AbortSignal.timeout(40000), headers: { 'User-Agent': 'VSM-Blog-Migration/1.0' } });
  if (!response.ok) throw new Error(`GET ${url} returned HTTP ${response.status}`);
  return response.text();
}

function attributes(tag: string) {
  const result: Record<string, string> = {};
  const re = /([\w:-]+)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/g;
  for (const match of tag.matchAll(re)) result[match[1]!.toLowerCase()] = decodeHtml(match[2] ?? match[3] ?? match[4] ?? '');
  return result;
}

function readSeo(document: string, post: SourcePost): Seo {
  const meta: Record<string, string> = {};
  for (const tag of document.match(/<meta\b[^>]*>/gi) ?? []) {
    const a = attributes(tag);
    const key = (a.property || a.name || '').toLowerCase();
    if (key && a.content) meta[key] = a.content;
  }
  const canonicalTag = (document.match(/<link\b[^>]*>/gi) ?? []).find(tag => /\brel=["']canonical["']/i.test(tag));
  const canonical = canonicalTag ? attributes(canonicalTag).href : '';
  const titleTag = document.match(/<title\b[^>]*>([\s\S]*?)<\/title>/i)?.[1] ?? '';
  const robots = `${meta.robots ?? ''} ${meta['googlebot'] ?? ''}`.toLowerCase();
  return {
    title: decodeHtml(titleTag.replace(/<[^>]*>/g, '').trim()),
    description: meta.description ?? meta['og:description'] ?? '',
    canonicalUrl: canonical || post.link,
    ogImageUrl: meta['og:image'] ?? '',
    noIndex: /\bnoindex\b/.test(robots),
  };
}

function imageUrls(htmlContent: string) {
  const urls = new Set<string>();
  const attributeRe = /\b(?:src|data-src|data-lazy-src|srcset|data-srcset)\s*=\s*(?:"([^"]*)"|'([^']*)')/gi;
  for (const match of htmlContent.matchAll(attributeRe)) {
    const value = decodeHtml(match[1] ?? match[2] ?? '');
    for (const candidate of value.split(',')) {
      const url = candidate.trim().split(/\s+/)[0];
      if (!url || url.startsWith('data:') || url.startsWith('blob:')) continue;
      try {
        const absolute = new URL(url, SOURCE).toString();
        if (absolute.startsWith('http://') || absolute.startsWith('https://')) urls.add(absolute);
      } catch { /* Keep unparseable source values unchanged. */ }
    }
  }
  return urls;
}

function rewriteImages(content: string, mapping: Map<string, string>) {
  const re = /\b(src|data-src|data-lazy-src|srcset|data-srcset|href)\s*=\s*("[^"]*"|'[^']*')/gi;
  return content.replace(re, (whole, attribute: string, quoted: string) => {
    const quote = quoted[0]!;
    const value = decodeHtml(quoted.slice(1, -1));
    const rewritten = /srcset/i.test(attribute)
      ? value.split(',').map(entry => {
        const trimmed = entry.trim();
        const [url, ...descriptor] = trimmed.split(/\s+/);
        if (!url) return entry;
        const absolute = new URL(url, SOURCE).toString();
        const replacement = mapping.get(absolute) ?? mapping.get(url) ?? url;
        return `${replacement}${descriptor.length ? ` ${descriptor.join(' ')}` : ''}`;
      }).join(', ')
      : (() => {
        try { const absolute = new URL(value, SOURCE).toString(); return mapping.get(absolute) ?? mapping.get(value) ?? value; }
        catch { return value; }
      })();
    return `${attribute}=${quote}${rewritten.replace(/&/g, '&amp;')}${quote}`;
  });
}

async function chunks<T>(values: T[], size: number, worker: (value: T) => Promise<void>) {
  for (let i = 0; i < values.length; i += size) await Promise.all(values.slice(i, i + size).map(worker));
}

async function batches<T>(values: T[], size: number, worker: (batch: T[]) => Promise<void>) {
  for (let i = 0; i < values.length; i += size) await worker(values.slice(i, i + size));
}

async function fetchTerms(kind: 'categories' | 'tags', ids: number[]) {
  const map = new Map<number, string>();
  await batches(ids, 45, async batch => {
    const { data } = await get<SourceTerm[]>(`${SOURCE}/wp-json/wp/v2/${kind}?include=${batch.join(',')}&per_page=100`);
    for (const term of data) map.set(term.id, decodeHtml(term.name));
  });
  const missing = ids.filter(id => !map.has(id));
  if (missing.length) throw new Error(`Source ${kind} could not be fetched for IDs: ${missing.join(', ')}`);
  return map;
}

async function prepareImage(url: string): Promise<PreparedImage> {
  const response = await fetch(url, { signal: AbortSignal.timeout(40000), headers: { 'User-Agent': 'VSM-Blog-Migration/1.0' } });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  const input = Buffer.from(await response.arrayBuffer());
  if (!input.length || input.length > 30 * 1024 * 1024) throw new Error(`Invalid media size (${input.length} bytes)`);
  const converted = await sharp(input, { limitInputPixels: 40000000 }).rotate().webp({ quality: 90 }).toBuffer({ resolveWithObject: true });
  const hash = createHash('sha256').update(url).digest('hex');
  const fileName = `blog-${hash}.webp`;
  const sourceName = basename(new URL(url).pathname) || 'blog-image';
  return { url, fileName, storageKey: `home/${fileName}`, originalName: `Blog import: ${sourceName}`.slice(0, 255), bytes: converted.data, width: converted.info.width, height: converted.info.height, checksum: createHash('sha256').update(converted.data).digest('hex') };
}

async function main() {
  const { data: posts, response } = await get<SourcePost[]>(`${SOURCE}/wp-json/wp/v2/posts?per_page=${PAGE_SIZE}&page=1`);
  const sourceTotal = Number(response.headers.get('x-wp-total') ?? posts.length);
  if (sourceTotal !== posts.length) throw new Error(`Source REST index is incomplete: fetched ${posts.length} of ${sourceTotal} published posts.`);
  if (new Set(posts.map(post => post.slug)).size !== posts.length) throw new Error('Source contains duplicate post slugs; refusing an ambiguous import.');

  // Check all ten public pagination pages against the complete REST index.
  const listed = new Set<string>();
  for (let page = 1; page <= 10; page++) {
    const listing = await html(page === 1 ? `${SOURCE}/blogs/` : `${SOURCE}/blogs/page/${page}/`);
    for (const post of posts) if (listing.includes(`/${post.slug}/`)) listed.add(post.slug);
  }
  const absentFromListing = posts.filter(post => !listed.has(post.slug));
  if (absentFromListing.length) throw new Error(`Posts missing from the ten listing pages: ${absentFromListing.map(post => post.slug).join(', ')}`);

  const categories = await fetchTerms('categories', [...new Set(posts.flatMap(post => post.categories))]);
  const tags = await fetchTerms('tags', [...new Set(posts.flatMap(post => post.tags))]);
  const mediaIds = [...new Set(posts.map(post => post.featured_media).filter(id => id > 0))];
  const media = new Map<number, SourceMedia>();
  await batches(mediaIds, 45, async batch => {
    const { data } = await get<SourceMedia[]>(`${SOURCE}/wp-json/wp/v2/media?include=${batch.join(',')}&per_page=100`);
    for (const item of data) media.set(item.id, item);
  });
  const missingMedia = posts.filter(post => post.featured_media > 0 && !media.has(post.featured_media));
  if (missingMedia.length) throw new Error(`Featured media records unavailable for: ${missingMedia.map(post => post.slug).join(', ')}`);

  const authorIds = [...new Set(posts.map(post => post.author))];
  const authors = new Map<number, SourceUser>();
  await chunks(authorIds, 20, async id => {
    const { data } = await get<SourceUser>(`${SOURCE}/wp-json/wp/v2/users/${id}`);
    authors.set(id, data);
  });

  const detailPages = new Map<string, { document: string; seo: Seo }>();
  const detailErrors: string[] = [];
  await chunks(posts, 4, async post => {
    try {
      const document = await html(post.link);
      detailPages.set(post.slug, { document, seo: readSeo(document, post) });
    } catch (error) { detailErrors.push(`${post.slug}: ${(error as Error).message}`); }
  });
  if (detailErrors.length) throw new Error(`Could not inspect all source detail pages:\n${detailErrors.join('\n')}`);

  const owners = new Map<string, Set<string>>();
  const mediaSet = new Set<string>();
  const addMedia = (url: string, slug: string) => {
    if (!url) return;
    try {
      const absolute = new URL(url, SOURCE).toString();
      if (!absolute.startsWith('http://') && !absolute.startsWith('https://')) return;
      mediaSet.add(absolute);
      const set = owners.get(absolute) ?? new Set<string>(); set.add(slug); owners.set(absolute, set);
    } catch { /* Ignore empty or invalid optional source URLs. */ }
  };
  for (const post of posts) {
    for (const url of imageUrls(post.content.rendered)) addMedia(url, post.slug);
    const cover = media.get(post.featured_media);
    if (cover) addMedia(cover.source_url, post.slug);
    addMedia(detailPages.get(post.slug)!.seo.ogImageUrl, post.slug);
    const avatar = authors.get(post.author)?.avatar_urls?.['96'];
    if (avatar) addMedia(avatar, post.slug);
  }

  const imageMap = new Map<string, string>();
  const mediaErrors: string[] = [];
  if (APPLY && !VERIFY_ONLY) {
    const prepared: PreparedImage[] = [];
    await chunks([...mediaSet], 4, async url => {
      try { prepared.push(await prepareImage(url)); }
      catch (error) { mediaErrors.push(`${[...(owners.get(url) ?? [])].join(', ')} — ${url}: ${(error as Error).message}`); }
    });
    if (mediaErrors.length) throw new Error(`Could not migrate all referenced media:\n${mediaErrors.join('\n')}`);
    await mkdir(homeMediaRoot, { recursive: true });
    for (const image of prepared) {
      const diskPath = resolve(homeMediaRoot, image.fileName);
      let fileExists = true;
      try { await stat(diskPath); } catch { fileExists = false; }
      if (!fileExists) await writeFile(diskPath, image.bytes, { flag: 'wx' });
      const existingAsset = await prisma.mediaAsset.findUnique({ where: { storageKey: image.storageKey }, select: { id: true } });
      if (!existingAsset) await prisma.mediaAsset.create({ data: { storageKey: image.storageKey, originalName: image.originalName, mimeType: 'image/webp', byteSize: image.bytes.length, width: image.width, height: image.height, checksum: image.checksum, scanStatus: 'VALIDATED' } });
      imageMap.set(image.url, `/cms-media/${image.fileName}`);
    }
  } else if (APPLY) {
    for (const url of mediaSet) imageMap.set(url, `/cms-media/blog-${createHash('sha256').update(url).digest('hex')}.webp`);
  } else {
    for (const url of mediaSet) imageMap.set(url, url);
  }

  const actor = await prisma.adminUser.findFirst({ select: { id: true }, orderBy: { id: 'asc' } });
  if (!actor) throw new Error('No CMS admin user is available to audit the import.');
  const existingRows = await prisma.blogPost.findMany({ where: { slug: { in: posts.map(post => post.slug) } }, select: { id: true, slug: true } });
  const existingIds = new Map(existingRows.map(row => [row.slug, row.id]));
  const updates: { slug: string; id: number; changes: string[]; input: Record<string, unknown> }[] = [];
  const creates: { slug: string; changes: string[]; input: Record<string, unknown> }[] = [];

  for (const post of posts) {
    const existingId = existingIds.get(post.slug);
    const current = existingId ? await getBlogPostAdmin(existingId) : null;
    const mediaRecord = media.get(post.featured_media);
    const author = authors.get(post.author)!;
    const detail = detailPages.get(post.slug)!;
    const coverSource = mediaRecord?.source_url ?? '';
    const avatarSource = author.avatar_urls?.['96'] ?? '';
    const input = {
      // The CMS title field trims outer whitespace; match that stored value in preflight/verification.
      title: decodeHtml(post.title.rendered).trim(),
      slug: post.slug,
      excerpt: cleanArticleHtml(rewriteImages(post.excerpt.rendered, imageMap)),
      body: cleanArticleHtml(rewriteImages(post.content.rendered, imageMap)),
      coverImageUrl: imageMap.get(coverSource) ?? coverSource,
      coverImageAlt: mediaRecord ? decodeHtml(mediaRecord.alt_text ?? '') : '',
      categories: post.categories.map(id => categories.get(id)!),
      tags: post.tags.map(id => tags.get(id)!),
      authorName: decodeHtml(author.name),
      authorRole: current?.authorRole ?? '',
      authorImageUrl: imageMap.get(avatarSource) ?? avatarSource,
      authorBio: author.description ? cleanArticleHtml(author.description) : current?.authorBio ?? '',
      featured: post.sticky,
      status: 'PUBLISHED',
      publishedAt: new Date(`${post.date_gmt}Z`).toISOString(),
      seoTitle: detail.seo.title,
      seoDescription: detail.seo.description,
      canonicalUrl: detail.seo.canonicalUrl,
      ogImageUrl: imageMap.get(detail.seo.ogImageUrl) ?? detail.seo.ogImageUrl,
      noIndex: detail.seo.noIndex,
      ...(current ? { updatedAt: current.updatedAt } : {}),
    };
    const changes = current
      ? Object.keys(input).filter(key => key !== 'updatedAt' && JSON.stringify((current as unknown as Record<string, unknown>)[key]) !== JSON.stringify(input[key]))
      : ['new post'];
    if (!current) creates.push({ slug: post.slug, changes, input });
    else if (changes.length) updates.push({ slug: post.slug, id: existingId!, changes, input });
  }

  if (!APPLY) {
    console.log(JSON.stringify({ mode: 'dry-run', sourcePosts: posts.length, paginationPagesChecked: 10, detailPagesChecked: detailPages.size, uniqueSourceImages: mediaSet.size, existingPostsMatched: existingRows.length, recordsToCreate: creates.map(post => post.slug), recordsToUpdate: updates.map(({ slug, changes }) => ({ slug, changes })), existingRecordsAlreadyInSync: posts.length - creates.length - updates.length }, null, 2));
    return;
  }

  if (!VERIFY_ONLY) {
    for (const item of creates) await createBlogPost(item.input, actor.id, 'old-vsmedu-blog-migration');
    for (const item of updates) await updateBlogPost(item.id, item.input, actor.id, 'old-vsmedu-blog-migration');
  }

  const verified: string[] = [];
  const failures: string[] = [];
  for (const post of posts) {
    const id = existingIds.get(post.slug) ?? (await prisma.blogPost.findUniqueOrThrow({ where: { slug: post.slug }, select: { id: true } })).id;
    const saved = await getBlogPostAdmin(id);
    const input = updates.find(item => item.slug === post.slug)?.input ?? creates.find(item => item.slug === post.slug)?.input;
    const expected = input ?? {
      title: decodeHtml(post.title.rendered).trim(),
      slug: post.slug,
      excerpt: cleanArticleHtml(rewriteImages(post.excerpt.rendered, imageMap)),
      body: cleanArticleHtml(rewriteImages(post.content.rendered, imageMap)),
      coverImageUrl: imageMap.get(media.get(post.featured_media)?.source_url ?? '') ?? '',
      coverImageAlt: decodeHtml(media.get(post.featured_media)?.alt_text ?? ''),
      categories: post.categories.map(id => categories.get(id)!),
      tags: post.tags.map(id => tags.get(id)!),
      authorName: decodeHtml(authors.get(post.author)!.name),
      authorRole: (await getBlogPostAdmin(id)).authorRole,
      authorImageUrl: imageMap.get(authors.get(post.author)?.avatar_urls?.['96'] ?? '') ?? '',
      authorBio: authors.get(post.author)!.description ? cleanArticleHtml(authors.get(post.author)!.description) : (await getBlogPostAdmin(id)).authorBio,
      featured: post.sticky,
      status: 'PUBLISHED',
      publishedAt: new Date(`${post.date_gmt}Z`).toISOString(),
      seoTitle: detailPages.get(post.slug)!.seo.title,
      seoDescription: detailPages.get(post.slug)!.seo.description,
      canonicalUrl: detailPages.get(post.slug)!.seo.canonicalUrl,
      ogImageUrl: imageMap.get(detailPages.get(post.slug)!.seo.ogImageUrl) ?? detailPages.get(post.slug)!.seo.ogImageUrl,
      noIndex: detailPages.get(post.slug)!.seo.noIndex,
    };
    const record = saved as unknown as Record<string, unknown>;
    for (const [key, value] of Object.entries(expected)) {
      if (key === 'updatedAt') continue;
      const matchesSource = key === 'body' && typeof record[key] === 'string' && typeof value === 'string'
        ? record[key]!.replace(/grad\d+/g, 'grad#') === value.replace(/grad\d+/g, 'grad#')
        : JSON.stringify(record[key]) === JSON.stringify(value);
      if (matchesSource) continue;
      {
        if (key === 'body' && typeof record[key] === 'string' && typeof value === 'string') {
          let firstDifference = 0;
          while (firstDifference < record[key].length && firstDifference < value.length && record[key][firstDifference] === value[firstDifference]) firstDifference++;
          failures.push(`${post.slug}: saved body differs from source (saved ${record[key].length} chars, expected ${value.length}; first difference at ${firstDifference}: ${JSON.stringify(record[key].slice(Math.max(0, firstDifference - 40), firstDifference + 100))} vs ${JSON.stringify(value.slice(Math.max(0, firstDifference - 40), firstDifference + 100))})`);
        } else failures.push(`${post.slug}: saved ${key} differs from the source value`);
      }
    }
    if (saved.coverImageUrl && !saved.coverImageUrl.startsWith('/cms-media/')) failures.push(`${post.slug}: featured image is not local`);
    if (!saved.body || !saved.excerpt) failures.push(`${post.slug}: body or excerpt is empty`);
    verified.push(post.slug);
  }
  if (failures.length) throw new Error(`Post verification failed:\n${failures.join('\n')}`);
  console.log(JSON.stringify({ mode: VERIFY_ONLY ? 'verified-only' : 'applied', sourcePosts: posts.length, paginationPagesChecked: 10, detailPagesChecked: detailPages.size, localImagesCreatedOrReused: VERIFY_ONLY ? undefined : mediaSet.size, recordsCreated: VERIFY_ONLY ? 0 : creates.length, recordsUpdated: VERIFY_ONLY ? 0 : updates.length, recordsAlreadyInSync: VERIFY_ONLY ? posts.length : posts.length - creates.length - updates.length, verifiedPosts: verified.length }, null, 2));
}

main().catch(error => { console.error(error instanceof Error ? error.message : error); process.exitCode = 1; }).finally(async () => { await prisma.$disconnect(); });
