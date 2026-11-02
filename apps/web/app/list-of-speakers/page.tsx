import type { Metadata } from 'next';
import { EventsShell } from '../events/EventsShell';
import { speakers } from '@/content/events';
import styles from '../events/events.module.css';

export const metadata: Metadata = { title: 'List of Speakers | Valia School of Management', description: 'Meet corporate leaders and industry experts who have engaged with Valia School of Management students.', alternates: { canonical: '/list-of-speakers/' } };

export default function SpeakersPage() {
  return <EventsShell title="List of Speakers" active="List of Speakers"><section className={`container ${styles.section}`}>
    <header className={styles.heading}><h2>Campus-Corporate Connect</h2><p>Industry leaders share practical perspectives and experience with VSM students.</p></header>
    <div className={styles.speakerGrid}>{speakers.map(([name, role]) => <article className={styles.speaker} key={name}><h3>{name}</h3><p>{role}</p></article>)}</div>
  </section></EventsShell>;
}
