import type { Metadata } from 'next';
import { Link } from '@/components/navigation/Link';
import { EventsShell } from '../EventsShell';
import { GalleryImages } from '../GalleryImages';
import { galleryEvents } from '@/content/events';
import styles from '../events.module.css';
import { withSeo } from '@/lib/seo';
import { cmsString, getEventsPageContent } from '@/lib/cms-content';
import { getGalleryAlbums } from '@/lib/gallery-content';

const metadata: Metadata = { title: 'Photo Gallery | Valia School of Management', description: 'Browse events and student experiences at Valia School of Management.', alternates: { canonical: '/events/gallery/' } };

export async function generateMetadata(): Promise<Metadata> {
  return withSeo('/events/gallery/', metadata);
}

export default async function EventGalleryPage() {
  const cms = await getEventsPageContent('gallery');
  const intro = cms?.sections.intro;
  const cmsAlbums = await getGalleryAlbums('events-gallery');
  const albums = cmsAlbums ? cmsAlbums.filter((item) => item.enabled !== false) : galleryEvents;
  return <EventsShell title="Gallery" active="Photo Gallery" cms={cms}><section className={`container ${styles.section}`}>
    <header className={styles.heading}><h2>{cmsString(intro?.title, 'Event Gallery')}</h2><p>{cmsString(intro?.description, "Navigating Today's Business World with Tomorrow's Leaders")}</p></header>
    <GalleryImages items={albums} />
    <nav className={styles.pagination} aria-label="Gallery pages"><span className={styles.paginationDisabled} aria-disabled="true" aria-label="Previous page">‹</span><Link href="/events/gallery/" aria-current="page" aria-label="Page 1">1</Link><Link href="/events/gallery/2/" aria-label="Page 2">2</Link><Link href="/events/gallery/2/" aria-label="Next page">›</Link></nav>
  </section></EventsShell>;
}
