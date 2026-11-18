import type { Metadata } from 'next';
import Image from 'next/image';
import { Button } from '@/components/ui/Button';
import { Link } from '@/components/navigation/Link';
import { PageHero } from '@/components/sections/PageHero';
import { academicsHero } from '@/content/academics';
import { getPublicBlogPage } from '@/lib/blog-content';
import styles from './Blogs.module.css';
import { withSeo } from '@/lib/seo';

const metadata: Metadata = {
  title: 'Blogs | Valia School of Management',
  description: 'Insights, guides, and perspectives from Valia School of Management.',
  alternates: { canonical: '/blogs/' },
};

function formatDate(date: string) {
  return new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(date));
}

function pageHref(page: number) {
  return page === 1 ? '/blogs/' : `/blogs/?page=${page}`;
}

export async function generateMetadata(): Promise<Metadata> {
  return withSeo('/blogs/', metadata);
}

export default async function BlogsPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  const params = await searchParams;
  const requestedPage = Number(params.page ?? 1);
  const currentPage = Number.isInteger(requestedPage) && requestedPage > 0 ? requestedPage : 1;
  const blogPage = await getPublicBlogPage(currentPage);
  const pageCount = blogPage.pageCount;
  const slide = { ...academicsHero, title: 'Blogs', subtitle: 'Stories, insights, and perspectives from VSM' };

  return (
    <>
      <PageHero className={styles.blogHero} size="inner" slides={[slide]} actions={<Button href="#blog-articles">Explore articles</Button>} breadcrumb={[{ label: 'Home', href: '/' }, { label: 'Blogs' }]} />
      <main className={`container ${styles.main}`}>
        <header className={styles.heading}>
          <span className={styles.eyebrow}>Insights &amp; Ideas</span>
          <h2>Latest from VSM</h2>
          <p>Explore ideas on management education, careers, admissions, and the changing world of business.</p>
        </header>

        <section className={styles.grid} id="blog-articles" aria-label="Blog articles">
          {blogPage.items.map((article) => (
            <article className={styles.card} key={article.id}>
              <Link className={styles.cardLink} href={`/blogs/${article.slug}/`} aria-label={`Read ${article.title}`}>
                <div className={styles.imageWrap}>
                  {article.image ? (
                    <Image src={article.image.startsWith('/') || /^https?:\/\//i.test(article.image) ? article.image : `/${article.image}`} alt={article.imageAlt || article.title} width={900} height={600} sizes="(max-width: 640px) 100vw, (max-width: 980px) 50vw, 33vw" unoptimized={/^https?:\/\//i.test(article.image)} />
                  ) : <div className={styles.imageFallback} aria-hidden="true">VSM</div>}
                </div>
                <div className={styles.cardBody}>
                  <div className={styles.meta}>
                    {article.categories[0] && <span className={styles.category}>{article.categories[0]}</span>}
                    <time dateTime={article.date}>{formatDate(article.date)}</time>
                  </div>
                  <h3>{article.title}</h3>
                  <div className={styles.excerpt} dangerouslySetInnerHTML={{ __html: article.excerpt }} />
                  <span className={styles.readMore}>Read article <span aria-hidden="true">→</span></span>
                </div>
              </Link>
            </article>
          ))}
        </section>

        {pageCount > 1 && (
          <nav className={styles.pagination} aria-label="Blog pages">
            <Link className={`${styles.pageButton} ${currentPage === 1 ? styles.disabled : ''}`} href={pageHref(Math.max(1, currentPage - 1))} aria-disabled={currentPage === 1} aria-label="Previous page">‹</Link>
            {Array.from({ length: pageCount }, (_, index) => index + 1).map((page) => (
              <Link className={`${styles.pageNumber} ${page === currentPage ? styles.current : ''}`} href={pageHref(page)} aria-current={page === currentPage ? 'page' : undefined} key={page}>{page}</Link>
            ))}
            <Link className={`${styles.pageButton} ${currentPage === pageCount ? styles.disabled : ''}`} href={pageHref(Math.min(pageCount, currentPage + 1))} aria-disabled={currentPage === pageCount} aria-label="Next page">›</Link>
          </nav>
        )}
      </main>
    </>
  );
}
