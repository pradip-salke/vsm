import type { Metadata } from 'next';
import { Link } from '@/components/navigation/Link';
import Image from 'next/image';
import { EventsShell } from './EventsShell';
import { events } from '@/content/shared';
import styles from './events.module.css';

export const metadata: Metadata = { title: 'Events | Valia School of Management', description: 'Explore events, student experiences and campus activities at Valia School of Management.', alternates: { canonical: '/events/' } };

export default function EventsPage() {
  return <EventsShell title="Events" active="Events">
    <section className={`container ${styles.section}`}>
      <header className={styles.heading}><h2>Events at Valia School of Management</h2><p>Learning and leadership extend beyond the classroom through industry visits, campus activities and corporate interactions.</p></header>
      <div className={styles.cards}>{events.map((event) => <article className={styles.card} key={event.href}><Image className={styles.image} src={event.image.src} alt={event.image.alt} width={event.image.width} height={event.image.height} sizes="(max-width: 767px) 100vw, (max-width: 1023px) 50vw, 33vw" /><div className={styles.cardBody}><h3>{event.title}</h3><p>Explore student experiences and event highlights from VSM.</p><Link href={event.href}>View event <span aria-hidden="true">→</span></Link></div></article>)}</div>
      <nav className={styles.subnav} aria-label="Explore event pages"><Link href="/events/gallery/">Photo Gallery</Link><Link href="/events/achievements/">Achievements</Link><Link href="/list-of-speakers/">List of Speakers</Link><Link href="/videos-of-speakers/">Videos of Speakers</Link></nav>
    </section>
  </EventsShell>;
}
