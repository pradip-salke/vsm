import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { EventsShell } from '../EventsShell';
import { galleryEvents } from '@/content/events';
import styles from '../events.module.css';

export const metadata: Metadata = { title: 'Photo Gallery | Valia School of Management', description: 'Browse events and student experiences at Valia School of Management.', alternates: { canonical: '/events/gallery/' } };

export default function EventGalleryPage() {
  return <EventsShell title="Gallery" active="Photo Gallery"><section className={`container ${styles.section}`}>
    <header className={styles.heading}><h2>Event Gallery</h2><p>Navigating Today&apos;s Business World with Tomorrow&apos;s Leaders</p></header>
    <div className={styles.cards}>{galleryEvents.map((event) => <article className={styles.card} key={event.href}><Image className={styles.image} src={event.image.src} alt={event.image.alt} width={event.image.width} height={event.image.height} /><div className={styles.cardBody}><h3>{event.title}</h3><Link href={event.href}>View gallery <span aria-hidden="true">→</span></Link></div></article>)}</div>
    <nav className={styles.pagination} aria-label="Gallery pages"><Link href="/events/gallery/" aria-current="page" aria-label="Page 1">1</Link><Link href="/events/gallery/2/" aria-label="Page 2">2</Link><Link href="/events/gallery/2/" aria-label="Next page">›</Link></nav>
  </section></EventsShell>;
}
