import type { Metadata } from 'next';
import { Link } from '@/components/navigation/Link';
import { EventsShell } from '../../EventsShell';
import { GalleryImages } from '../../GalleryImages';
import { archiveEvents } from '@/content/events';
import styles from '../../events.module.css';
import { withSeo } from '@/lib/seo';
import { cmsString, getEventsPageContent } from '@/lib/cms-content';
import { getGalleryAlbums } from '@/lib/gallery-content';

const metadata: Metadata = { title: 'Photo Gallery – Page 2 | Valia School of Management', description: 'More event highlights from Valia School of Management.', alternates: { canonical: '/events/gallery/2/' } };

export async function generateMetadata(): Promise<Metadata> {
  return withSeo('/events/gallery/2/', metadata);
}

export default async function EventGalleryPageTwo() {
  const cms = await getEventsPageContent('gallery-2');
  const intro = cms?.sections.intro;
  const cmsAlbums = await getGalleryAlbums('events-gallery-2');
  const albums = cmsAlbums ? cmsAlbums.filter((item) => item.enabled !== false) : archiveEvents;
  return <EventsShell title="Gallery" active="Photo Gallery" cms={cms}><section className={`container ${styles.section}`}>
    <header className={styles.heading}><h2>{cmsString(intro?.title, 'More from the Event Gallery')}</h2><p>{cmsString(intro?.description, 'Student activities and campus moments at Valia School of Management.')}</p></header>
    <GalleryImages items={albums} />
    <nav className={styles.pagination} aria-label="Gallery pages"><Link href="/events/gallery/" aria-label="Previous page">‹</Link><Link href="/events/gallery/">1</Link><Link href="/events/gallery/2/" aria-current="page" aria-label="Page 2">2</Link><span className={styles.paginationDisabled} aria-disabled="true" aria-label="Next page">›</span></nav>
  </section></EventsShell>;
}
