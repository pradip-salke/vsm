import type { Metadata } from 'next';
import Image from 'next/image';
import { EventsShell } from '../EventsShell';
import styles from '../events.module.css';

export const metadata: Metadata = { title: 'Achievements | Valia School of Management', description: 'Achievements and recognition at Valia School of Management.', alternates: { canonical: '/events/achievements/' } };

export default function AchievementsPage() {
  return <EventsShell title="Achievements" active="Achievements"><section className={`container ${styles.section}`}>
    <header className={styles.heading}><h2>Bright Education Visionaries Awards 2025</h2><p>Valia School of Management celebrates recognition for its contribution to education and management learning.</p></header>
    <div className={styles.cards}>{[
      ['r3-768x960.jpeg', 'Bright Education Visionaries Awards 2025 – event photograph 1'],
      ['r2-768x960.jpeg', 'Bright Education Visionaries Awards 2025 – event photograph 2'],
      ['r1.jpeg', 'Bright Education Visionaries Awards 2025 – event photograph 3'],
    ].map(([file, alt]) => <figure className={styles.card} key={file}><Image className={styles.achievementImage} src={`https://vsmedu.com/wp-content/uploads/2026/06/${file}`} alt={alt} width={768} height={960} referrerPolicy="no-referrer" /></figure>)}</div>
  </section></EventsShell>;
}
