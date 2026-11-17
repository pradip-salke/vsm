import type { Metadata } from 'next';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { Link } from '@/components/navigation/Link';
import { getBlogDetailPageSettings, getPublicBlogPost } from '@/lib/blog-content';
import styles from '../Blogs.module.css';
import { withSeo } from '@/lib/seo';

export const dynamic = 'force-dynamic';

function plainText(html: string) {
  return html.replace(/<[^>]*>/g, ' ').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim();
}

function articleHtml(html: string) {
  // WordPress may append JSON-LD scripts to the content field; metadata is
  // handled by Next.js, so keep the visible article body free of those scripts.
  return html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '');
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(date));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const article = await getPublicBlogPost(slug);
  if (!article) return { title: 'Blog not found | Valia School of Management' };
  return withSeo(`/blogs/${article.slug}/`, {
    title: article.seoTitle || `${article.title} | Valia School of Management`,
    description: article.seoDescription || plainText(article.excerpt).slice(0, 160),
    alternates: { canonical: article.canonicalUrl || `/blogs/${article.slug}/` },
    robots: article.noIndex ? { index: false, follow: false } : undefined,
    openGraph: article.ogImageUrl ? { images: [article.ogImageUrl] } : undefined,
  });
}

export default async function BlogDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [article, pageSettings] = await Promise.all([getPublicBlogPost(slug), getBlogDetailPageSettings()]);
  if (!article) notFound();

  return (
    <main className={`container ${styles.detailMain}`}>
        <Link href="/blogs/" className={styles.backLink}>{pageSettings.links.backLinkText}</Link>
        <article className={styles.detail}>
          <header className={styles.detailHeader}>
            <div className={styles.meta}>
              {article.categories.map((category) => <span className={styles.category} key={category}>{category}</span>)}
              <time dateTime={article.date}>{formatDate(article.date)}</time>
            </div>
            <h1>{article.title}</h1>
          </header>
          {article.image && (
            <div className={styles.detailImage}>
              <Image src={article.image} alt={article.imageAlt || article.title} width={1400} height={800} sizes="(max-width: 900px) 100vw, 1100px" priority unoptimized={/^https?:\/\//i.test(article.image)} />
            </div>
          )}
          <div className={styles.detailIntro}>
            <div className={styles.lead} dangerouslySetInnerHTML={{ __html: article.excerpt }} />
            {article.authorName && (
              <div className={styles.author}>
                {article.authorImageUrl && <Image src={article.authorImageUrl} alt="" width={44} height={44} unoptimized={/^https?:\/\//i.test(article.authorImageUrl)} />}
                <span><strong>{article.authorName}</strong>{article.authorRole && <small>{article.authorRole}</small>}</span>
              </div>
            )}
          </div>
          <div className={styles.articleContent} dangerouslySetInnerHTML={{ __html: articleHtml(article.body) }} />
          {article.authorBio && <p className={styles.authorBio}>{article.authorBio}</p>}
          <footer className={styles.articleFooter}><Link href="/blogs/">{pageSettings.links.footerLinkText}</Link></footer>
        </article>
    </main>
  );
}

