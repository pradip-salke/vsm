import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { eventDetails, galleryEvents } from '@/content/events';
import { EventsShell } from '@/app/events/EventsShell';
import styles from '@/app/events/events.module.css';

export function generateStaticParams() {
  return [...galleryEvents.map(({ href }) => ({ slug: href.split('/').filter(Boolean).at(-1)! })), ...Object.keys(eventDetails).map((slug) => ({ slug }))];
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const event = eventDetails[slug] ?? galleryEvents.find(({ href }) => href.endsWith(`/${slug}/`));
  return { title: event ? `${event.title} | Valia School of Management` : 'Event Gallery | Valia School of Management', description: event?.title ? `Photos and highlights from ${event.title} at Valia School of Management.` : undefined };
}

export default async function GalleryDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const event = eventDetails[slug] ?? galleryEvents.find(({ href }) => href.endsWith(`/${slug}/`));
  if (!event) notFound();
  const paragraphs = 'paragraphs' in event ? event.paragraphs : ['Explore highlights from this Valia School of Management event.'];
  return <EventsShell title={event.title} active="Photo Gallery"><section className={`container ${styles.section}`}>
    <div className={styles.detail}>{paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}</div>
    <figure className={styles.card} style={{ maxWidth: '54rem', marginTop: 'var(--space-6)' }}><Image className={styles.image} src={event.image.src} alt={event.image.alt} width={event.image.width} height={event.image.height} priority /><figcaption className={styles.cardBody}><h2>{event.title}</h2></figcaption></figure>
    <nav className={styles.subnav} aria-label="Gallery navigation"><Link href="/events/gallery/">Back to all events</Link></nav>
  </section></EventsShell>;
}
