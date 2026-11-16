import type { Metadata } from 'next';
import { EventsShell } from '../events/EventsShell';
import { speakers } from '@/content/events';
import styles from '../events/events.module.css';
import { withSeo } from '@/lib/seo';
import { cmsString, getEventsPageContent } from '@/lib/cms-content';

const metadata: Metadata = { title: 'List of Speakers | Valia School of Management', description: 'Meet corporate leaders and industry experts who have engaged with Valia School of Management students.', alternates: { canonical: '/list-of-speakers/' } };

export async function generateMetadata(): Promise<Metadata> {
  return withSeo('/list-of-speakers/', metadata);
}

export default async function SpeakersPage() {
  const cms = await getEventsPageContent('list-of-speakers');
  const intro = cms?.sections.intro;
  const items = (cms?.masters.speakers as { items?: { name: string; role?: string; enabled?: boolean }[] } | undefined)?.items?.filter((item) => item.enabled !== false) ?? speakers.map(([name, role]) => ({name, role}));
  return <EventsShell title="List of Speakers" active="List of Speakers" cms={cms}><section className={`container ${styles.section}`}>
    <header className={styles.heading}><h2>{cmsString(intro?.title, 'Campus-Corporate Connect')}</h2><p>{cmsString(intro?.description, 'Industry leaders share practical perspectives and experience with VSM students.')}</p></header>
    <div className={styles.speakerGrid}>{items.map(({name, role}) => <article className={styles.speaker} key={name}><h3>{name}</h3><p>{role}</p></article>)}</div>
  </section></EventsShell>;
}
