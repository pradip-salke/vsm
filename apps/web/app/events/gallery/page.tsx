import type { Metadata } from 'next';
import { Link } from '@/components/navigation/Link';
import { EventsShell } from '../EventsShell';
import { GalleryImages } from '../GalleryImages';
import { galleryEvents } from '@/content/events';
import styles from '../events.module.css';

export const metadata: Metadata = { title: 'Photo Gallery | Valia School of Management', description: 'Browse events and student experiences at Valia School of Management.', alternates: { canonical: '/events/gallery/' } };

export default function EventGalleryPage() {
  return <EventsShell title="Gallery" active="Photo Gallery"><section className={`container ${styles.section}`}>
    <header className={styles.heading}><h2>Event Gallery</h2><p>Navigating Today&apos;s Business World with Tomorrow&apos;s Leaders</p></header>
    <GalleryImages items={galleryEvents} />
    <nav className={styles.pagination} aria-label="Gallery pages"><span className={styles.paginationDisabled} aria-disabled="true" aria-label="Previous page">‹</span><Link href="/events/gallery/" aria-current="page" aria-label="Page 1">1</Link><Link href="/events/gallery/2/" aria-label="Page 2">2</Link><Link href="/events/gallery/2/" aria-label="Next page">›</Link></nav>
  </section></EventsShell>;
}
