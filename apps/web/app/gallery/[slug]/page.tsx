import type { Metadata } from 'next';
import { Link } from '@/components/navigation/Link';
import { notFound } from 'next/navigation';
import { archiveEvents, eventDetails, galleryEvents } from '@/content/events';
import { EventsShell } from '@/app/events/EventsShell';
import styles from '@/app/events/events.module.css';
import { GalleryImages } from '@/app/events/GalleryImages';

export function generateStaticParams() {
  const slugs = [
    ...galleryEvents.map(({ href }) => href.split('/').filter(Boolean).at(-1)!),
    ...archiveEvents.map(({ href }) => href.split('/').filter(Boolean).at(-1)!),
    ...Object.keys(eventDetails),
  ];
  return [...new Set(slugs)].map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const event = eventDetails[slug] ?? galleryEvents.find(({ href }) => href.endsWith(`/${slug}/`)) ?? archiveEvents.find(({ href }) => href.endsWith(`/${slug}/`));
  return { title: event ? `${event.title} | Valia School of Management` : 'Event Gallery | Valia School of Management', description: event?.title ? `Photos and highlights from ${event.title} at Valia School of Management.` : undefined };
}

export default async function GalleryDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const event = eventDetails[slug] ?? galleryEvents.find(({ href }) => href.endsWith(`/${slug}/`)) ?? archiveEvents.find(({ href }) => href.endsWith(`/${slug}/`));
  if (!event) notFound();
  const paragraphs = 'paragraphs' in event ? event.paragraphs : ['Explore highlights from this Valia School of Management event.'];
  return <EventsShell title={event.title} active="Photo Gallery"><section className={`container ${styles.section}`}>
    <div className={styles.detail}>{paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}</div>
    <div className={styles.detailGallery}><GalleryImages items={[event]} /></div>
    <nav className={styles.subnav} aria-label="Gallery navigation"><Link href="/events/gallery/">Back to all events</Link></nav>
  </section></EventsShell>;
}
