import type { ReactNode } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { PageHero } from '@/components/sections/PageHero';
import { academicsHero } from '@/content/academics';
import { APPLY_PATH } from '@/content/site';
import styles from './PlacementPage.module.css';

export const placementPages = [
  { label: 'Placements', href: '/placements/' },
  { label: 'Our Recruiters', href: '/placements/our-recruiters/' },
  { label: 'Placement Records', href: '/placements/placement-records/' },
  { label: 'Alumni', href: '/placements/alumni/' },
  { label: 'Connect With Us', href: '/connect-with-us/' },
];

export function PlacementPageShell({ title, active, children }: { title: string; active: string; children: ReactNode }) {
  const slide = { ...academicsHero, title, subtitle: "Navigating Today’s Business World with Tomorrow’s Leaders" };
  return (
    <>
      <PageHero
        size="inner"
        slides={[slide]}
        actions={<>
          <Button href={APPLY_PATH}>Apply Now</Button>
          <Button variant="arrow" href="mailto:admissions@vsmedu.in">Enquire now</Button>
        </>}
        breadcrumb={[{ label: 'Home', href: '/' }, { label: 'Placements', href: '/placements/' }, { label: title }]}
      />
      <nav className={styles.nav} aria-label="Placement pages">
        <ul className={`container ${styles.navList}`} role="list">
          {placementPages.map((page) => (
            <li key={page.href}>
              <Link href={page.href} aria-current={active === page.label ? 'page' : undefined}>{page.label}</Link>
            </li>
          ))}
        </ul>
      </nav>
      <div className={styles.main}>{children}</div>
    </>
  );
}

export function PlacementSection({ title, children, intro }: { title: string; children: ReactNode; intro?: ReactNode }) {
  return (
    <section className={`container ${styles.section}`}>
      <header className={styles.sectionHeader}>
        <p className={styles.eyebrow}>Placement</p>
        <h2>{title}</h2>
      </header>
      {intro && <div className={styles.intro}>{intro}</div>}
      {children}
    </section>
  );
}

