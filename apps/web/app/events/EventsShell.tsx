import type { ReactNode } from 'react';
import { Link } from '@/components/navigation/Link';
import { Button } from '@/components/ui/Button';
import { PageHero } from '@/components/sections/PageHero';
import { academicsHero } from '@/content/academics';
import { APPLY_PATH } from '@/content/site';
import styles from './events.module.css';

export const eventPages = [
  { label: 'Events', href: '/events/' },
  { label: 'Photo Gallery', href: '/events/gallery/' },
  { label: 'Achievements', href: '/events/achievements/' },
  { label: 'List of Speakers', href: '/list-of-speakers/' },
  { label: 'Videos of Speakers', href: '/videos-of-speakers/' },
];

export function EventsShell({ title, active, children }: { title: string; active: string; children: ReactNode }) {
  const slide = { ...academicsHero, title, subtitle: "Navigating Today's Business World with Tomorrow's Leaders" };
  return <>
    <PageHero size="inner" slides={[slide]} actions={<>
      <Button href={APPLY_PATH}>Apply Now</Button>
      <Button variant="arrow" href="mailto:admissions@vsmedu.in">Enquire now</Button>
    </>} breadcrumb={[{ label: 'Home', href: '/' }, { label: 'Events', href: '/events/' }, ...(title === 'Events' ? [] : [{ label: title }])]} />
    <nav className={styles.nav} aria-label="Event pages"><ul role="list" className={`container ${styles.navList}`}>
      {eventPages.filter((page) => !(active === 'Photo Gallery' && page.label === 'Events')).map((page) => <li key={page.href}><Link href={page.href} aria-current={active === page.label ? 'page' : undefined}>{page.label}</Link></li>)}
    </ul></nav>
    <main id="main" className={styles.main}>{children}</main>
  </>;
}
