import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { EventsShell } from '../../EventsShell';
import { archiveEvents } from '@/content/events';
import styles from '../../events.module.css';

export const metadata: Metadata = { title: 'Photo Gallery – Page 2 | Valia School of Management', description: 'More event highlights from Valia School of Management.', alternates: { canonical: '/events/gallery/2/' } };

export default function EventGalleryPageTwo() {
  return <EventsShell title="Gallery" active="Photo Gallery"><section className={`container ${styles.section}`}>
    <header className={styles.heading}><h2>More from the Event Gallery</h2><p>Student activities and campus moments at Valia School of Management.</p></header>
    <div className={styles.cards}>{archiveEvents.map((event) => <article className={styles.card} key={event.href}><Image className={styles.image} src={event.image.src} alt={event.image.alt} width={event.image.width} height={event.image.height} /><div className={styles.cardBody}><h3>{event.title}</h3><Link href={event.href}>View event <span aria-hidden="true">→</span></Link></div></article>)}</div>
    <nav className={styles.pagination} aria-label="Gallery pages"><Link href="/events/gallery/" aria-label="Previous page">‹</Link><Link href="/events/gallery/">1</Link><Link href="/events/gallery/2/" aria-current="page" aria-label="Page 2">2</Link></nav>
  </section></EventsShell>;
}
