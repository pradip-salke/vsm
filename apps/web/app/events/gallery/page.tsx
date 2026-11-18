import type { Metadata } from 'next';
import { Link } from '@/components/navigation/Link';
import { EventsShell } from '../EventsShell';
import { GalleryImages } from '../GalleryImages';
import { galleryEvents, archiveEvents } from '@/content/events';
import styles from '../events.module.css';
import { withSeo } from '@/lib/seo';
import { cmsString, getEventsPageContent } from '@/lib/cms-content';
import { getGalleryAlbums } from '@/lib/gallery-content';

const metadata: Metadata = { title: 'Photo Gallery | Valia School of Management', description: 'Browse events and student experiences at Valia School of Management.', alternates: { canonical: '/events/gallery/' } };

export async function generateMetadata(): Promise<Metadata> {
  return withSeo('/events/gallery/', metadata);
}

export default async function EventGalleryPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  const cms = await getEventsPageContent('gallery');
  const intro = cms?.sections.intro;
  const cmsAlbums = await getGalleryAlbums('events-gallery');
  const albums = cmsAlbums ? cmsAlbums.filter((item) => item.enabled !== false) : [...galleryEvents, ...archiveEvents];
  const pageCount = Math.max(1, Math.ceil(albums.length / 12));
  const requestedPage = Number((await searchParams).page);
  const page = Number.isInteger(requestedPage) ? Math.min(pageCount, Math.max(1, requestedPage)) : 1;
  const pageLink = (number: number) => number === 1 ? '/events/gallery/' : `/events/gallery/?page=${number}`;
  return <EventsShell title="Gallery" active="Photo Gallery" cms={cms}><section className={`container ${styles.section}`}>
    <header className={styles.heading}><h2>{cmsString(intro?.title, 'Event Gallery')}</h2><p>{cmsString(intro?.description, "Navigating Today's Business World with Tomorrow's Leaders")}</p></header>
    <GalleryImages items={albums.slice((page - 1) * 12, page * 12)} />
    {pageCount > 1 && <nav className={styles.pagination} aria-label="Gallery pages">{page > 1 ? <Link href={pageLink(page - 1)} aria-label="Previous page">‹</Link> : <span className={styles.paginationDisabled} aria-disabled="true" aria-label="Previous page">‹</span>}{Array.from({ length: pageCount }, (_, index) => <Link key={index + 1} href={pageLink(index + 1)} aria-current={page === index + 1 ? 'page' : undefined} aria-label={`Page ${index + 1}`}>{index + 1}</Link>)}{page < pageCount ? <Link href={pageLink(page + 1)} aria-label="Next page">›</Link> : <span className={styles.paginationDisabled} aria-disabled="true" aria-label="Next page">›</span>}</nav>}
  </section></EventsShell>;
}
