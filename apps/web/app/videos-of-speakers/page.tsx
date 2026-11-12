import type { Metadata } from 'next';
import { EventsShell } from '../events/EventsShell';
import { getSpeakerVideoContent } from '@/lib/video-content';
import { SpeakerVideos } from './SpeakerVideos';
import styles from '../events/events.module.css';
import { withSeo } from '@/lib/seo';

const metadata: Metadata = { title: 'Videos of Speakers | Valia School of Management', description: 'Watch speaker sessions and campus-corporate conversations at Valia School of Management.', alternates: { canonical: '/videos-of-speakers/' } };

export async function generateMetadata(): Promise<Metadata> {
  return withSeo('/videos-of-speakers/', metadata);
}

export default async function SpeakerVideosPage() {
  const content = await getSpeakerVideoContent();
  return <EventsShell title="Campus-Corporate Connect" active="Videos of Speakers"><section className={`container ${styles.section}`}>
    <header className={styles.heading}><h2>{content.title}</h2><p>{content.description}</p></header>
    <SpeakerVideos videos={content.videos} />
  </section></EventsShell>;
}
