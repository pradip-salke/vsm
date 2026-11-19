import type { Metadata } from 'next';
import Image from 'next/image';
import { EventsShell } from '../EventsShell';
import styles from '../events.module.css';
import { withSeo } from '@/lib/seo';
import { cmsString, getEventsPageContent } from '@/lib/cms-content';

const metadata: Metadata = { title: 'Achievements | Valia School of Management', description: 'Achievements and recognition at Valia School of Management.', alternates: { canonical: '/events/achievements/' } };
export async function generateMetadata(): Promise<Metadata> { return withSeo('/events/achievements/', metadata); }

export default async function AchievementsPage() {
  const cms = await getEventsPageContent('achievements');
  const intro = cms?.sections.intro;
  const photos = (cms?.masters.photos as { items?: { src?: string; alt?: string; width?: number; height?: number; enabled?: boolean }[] } | undefined)?.items?.filter((item) => item.enabled !== false && item.src) ?? [];
  const defaults = [
    { src: 'https://vsmedu.com/wp-content/uploads/2026/06/r3-768x960.jpeg', alt: 'Bright Education Visionaries Awards 2025 event photograph 1' },
    { src: 'https://vsmedu.com/wp-content/uploads/2026/06/r2-768x960.jpeg', alt: 'Bright Education Visionaries Awards 2025 event photograph 2' },
    { src: 'https://vsmedu.com/wp-content/uploads/2026/06/r1.jpeg', alt: 'Bright Education Visionaries Awards 2025 event photograph 3' },
  ];
  return <EventsShell title="Achievements" active="Achievements" cms={cms}><section className={`container ${styles.section} ${styles.achievementsSection}`}>
    <header className={styles.heading}><h2>{cmsString(intro?.title, 'Bright Education Visionaries Awards 2025')}</h2><p>{cmsString(intro?.description, 'Valia School of Management celebrates recognition for its contribution to education and management learning.')}</p></header>
    <div className={styles.cards}>{(photos.length ? photos : defaults).map((photo, index) => <figure className={styles.card} key={`${photo.src}-${index}`}><Image className={styles.achievementImage} src={photo.src!} alt={photo.alt ?? ''} width={photo.width ?? 768} height={photo.height ?? 960} referrerPolicy="no-referrer" /></figure>)}</div>
  </section></EventsShell>;
}
