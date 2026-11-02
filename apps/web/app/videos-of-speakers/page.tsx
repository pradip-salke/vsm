import type { Metadata } from 'next';
import { EventsShell } from '../events/EventsShell';
import { speakers } from '@/content/events';
import styles from '../events/events.module.css';

export const metadata: Metadata = { title: 'Videos of Speakers | Valia School of Management', description: 'Watch speaker sessions and campus-corporate conversations at Valia School of Management.', alternates: { canonical: '/videos-of-speakers/' } };

export default function SpeakerVideosPage() {
  return <EventsShell title="Campus-Corporate Connect" active="Videos of Speakers"><section className={`container ${styles.section}`}>
    <header className={styles.heading}><h2>Campus-Corporate Connect</h2><p>Business leaders and practitioners bring their experience to the classroom through VSM&apos;s corporate connect sessions.</p></header>
    <div className={styles.speakerGrid}>{speakers.map(([name, role]) => <article className={styles.speaker} key={name}><h3>{name}</h3><p>{role}</p></article>)}</div>
  </section></EventsShell>;
}
