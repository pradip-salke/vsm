import type { ReactNode } from 'react';
import { Link } from '@/components/navigation/Link';
import { Button } from '@/components/ui/Button';
import { PageHero } from '@/components/sections/PageHero';
import { academicsHero } from '@/content/academics';
import { APPLY_PATH } from '@/content/site';
import styles from './events.module.css';
import type { CmsPageData } from '@/lib/cms-content';

export const eventPages = [
  { label: 'Events', href: '/events/' },
  { label: 'Photo Gallery', href: '/events/gallery/' },
  { label: 'Achievements', href: '/events/achievements/' },
  { label: 'List of Speakers', href: '/list-of-speakers/' },
  { label: 'Videos of Speakers', href: '/videos-of-speakers/' },
];

export function EventsShell({ title, active, children, cms }: { title: string; active: string; children: ReactNode; cms?: CmsPageData | null }) {
  const heroMaster = cms?.masters.hero as { items?: (Record<string, unknown>)[] } | undefined;
  const slide = { ...academicsHero, ...(heroMaster?.items?.[0] ?? {}), title, subtitle: "Navigating Today's Business World with Tomorrow's Leaders" };
  const navSection = cms?.sections['page-nav'] as { links?: unknown } | undefined;
  const cmsLinks = navSection?.links;
  const pages = Array.isArray(cmsLinks) ? cmsLinks.filter((item): item is { label: string; href: string } => !!item && typeof item === 'object' && typeof (item as {label?: unknown}).label === 'string' && typeof (item as {href?: unknown}).href === 'string') : eventPages;
  return <>
    <PageHero size="inner" slides={(heroMaster?.items ?? []).filter(item => item.enabled !== false).map(item => ({ ...slide, ...item }) as typeof slide)} actions={<>
      <Button href={APPLY_PATH}>Apply Now</Button>
      <Button variant="arrow" href="mailto:admissions@vsmedu.in">Enquire now</Button>
    </>} breadcrumb={[{ label: 'Home', href: '/' }, { label: 'Events', href: '/events/' }, ...(title === 'Events' ? [] : [{ label: title }])]} />
    <nav className={styles.nav} aria-label="Event pages"><ul role="list" className={`container ${styles.navList}`}>
      {pages.filter((page) => !(page.label === 'Events' && ['Photo Gallery', 'Achievements', 'List of Speakers', 'Videos of Speakers'].includes(active))).map((page) => <li key={page.href}><Link href={page.href} aria-current={active === page.label ? 'page' : undefined}>{page.label}</Link></li>)}
    </ul></nav>
    <main id="main" className={styles.main}>{children}</main>
  </>;
}
