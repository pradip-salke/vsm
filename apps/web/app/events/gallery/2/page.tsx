import type { Metadata } from 'next';
import { Link } from '@/components/navigation/Link';
import { EventsShell } from '../../EventsShell';
import { GalleryImages } from '../../GalleryImages';
import { archiveEvents } from '@/content/events';
import styles from '../../events.module.css';

export const metadata: Metadata = { title: 'Photo Gallery – Page 2 | Valia School of Management', description: 'More event highlights from Valia School of Management.', alternates: { canonical: '/events/gallery/2/' } };

export default function EventGalleryPageTwo() {
  return <EventsShell title="Gallery" active="Photo Gallery"><section className={`container ${styles.section}`}>
    <header className={styles.heading}><h2>More from the Event Gallery</h2><p>Student activities and campus moments at Valia School of Management.</p></header>
    <GalleryImages items={archiveEvents} />
    <nav className={styles.pagination} aria-label="Gallery pages"><Link href="/events/gallery/" aria-label="Previous page">‹</Link><Link href="/events/gallery/">1</Link><Link href="/events/gallery/2/" aria-current="page" aria-label="Page 2">2</Link><span className={styles.paginationDisabled} aria-disabled="true" aria-label="Next page">›</span></nav>
  </section></EventsShell>;
}
