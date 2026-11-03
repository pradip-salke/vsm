import type { Metadata } from 'next';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Link } from '@/components/navigation/Link';
import { PageHero } from '@/components/sections/PageHero';
import { academicsHero } from '@/content/academics';
import articles from '@/content/blogs.json';
import styles from '../Blogs.module.css';

type Article = (typeof articles)[number];
const allArticles = articles as Article[];

function findArticle(slug: string) {
  return allArticles.find((article) => article.slug === slug);
}

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

export function generateStaticParams() {
  return allArticles.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const article = findArticle(slug);
  if (!article) return { title: 'Blog not found | Valia School of Management' };
  return {
    title: `${article.title} | Valia School of Management`,
    description: plainText(article.excerpt).slice(0, 160),
    alternates: { canonical: `/blogs/${article.slug}/` },
  };
}

export default async function BlogDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = findArticle(slug);
  if (!article) notFound();
  const slide = { ...academicsHero, title: 'VSM Blog', subtitle: 'Ideas and perspectives for future-ready leaders' };

  return (
    <>
      <PageHero size="inner" slides={[slide]} actions={<Button href="/blogs/">Browse all blogs</Button>} breadcrumb={[{ label: 'Home', href: '/' }, { label: 'Blogs', href: '/blogs/' }, { label: article.title }]} />
      <main className={`container ${styles.detailMain}`}>
        <Link href="/blogs/" className={styles.backLink}>← All blogs</Link>
        <article className={styles.detail}>
          <header className={styles.detailHeader}>
            <div className={styles.meta}>
              {article.categories.map((category) => <span className={styles.category} key={category}>{category}</span>)}
              <time dateTime={article.date}>{formatDate(article.date)}</time>
            </div>
            <h1>{article.title}</h1>
            <div className={styles.lead} dangerouslySetInnerHTML={{ __html: article.excerpt }} />
          </header>
          {article.image && (
            <div className={styles.detailImage}>
              <Image src={article.image} alt={article.title} width={1400} height={800} sizes="(max-width: 900px) 100vw, 1100px" priority />
            </div>
          )}
          <div className={styles.articleContent} dangerouslySetInnerHTML={{ __html: articleHtml(article.content) }} />
          <footer className={styles.articleFooter}><Link href="/blogs/">← Back to all blogs</Link></footer>
        </article>
      </main>
    </>
  );
}
