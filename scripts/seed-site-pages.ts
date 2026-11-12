// Seeds About Us / Career / Blogs page CMS rows and imports existing blog articles. Never overwrites existing rows.
import 'dotenv/config';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { prisma } from '../apps/api/src/lib/prisma';
import { aboutStore, blogPagesStore, careerStore } from '../apps/api/src/modules/content/site-pages.stores';
import { cleanArticleHtml } from '../apps/api/src/modules/content/blog-posts.service';

type LegacyArticle = { id: number; date: string; slug: string; title: string; content: string; excerpt: string; categories: string[]; image: string | null };

async function main() {
  const pages = (await aboutStore.seed()) + (await careerStore.seed()) + (await blogPagesStore.seed());
  console.info(`✓ Page settings: ${pages} new row(s) created (existing rows kept).`);

  const articles = JSON.parse(await readFile(resolve('apps/web/content/blogs.json'), 'utf8')) as LegacyArticle[];
  let imported = 0;
  for (const article of articles) {
    if (await prisma.blogPost.findFirst({ where: { OR: [{ legacyId: article.id }, { slug: article.slug }] }, select: { id: true } })) continue;
    await prisma.blogPost.create({
      data: {
        legacyId: article.id,
        slug: article.slug,
        title: article.title,
        excerpt: cleanArticleHtml(article.excerpt),
        body: cleanArticleHtml(article.content),
        coverImageUrl: article.image || null,
        coverImageAlt: article.image ? article.title : null,
        categories: article.categories,
        tags: [],
        status: 'PUBLISHED',
        publishedAt: new Date(`${article.date}+05:30`),
        seo: { create: { canonicalUrl: `/blogs/${article.slug}/` } },
      },
    });
    imported++;
  }
  console.info(`✓ Blog posts: ${imported} imported from blogs.json (${articles.length - imported} already present).`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
