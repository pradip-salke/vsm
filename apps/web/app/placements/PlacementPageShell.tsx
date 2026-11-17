import type { ReactNode } from 'react';
import { Link } from '@/components/navigation/Link';
import { Button } from '@/components/ui/Button';
import { PageHero } from '@/components/sections/PageHero';
import { academicsHero } from '@/content/academics';
import { APPLY_PATH } from '@/content/site';
import { placementBatches } from '@/content/placements';
import styles from './PlacementPage.module.css';
import { getPlacementsPageContent, cmsString } from '@/lib/cms-content';

export const placementPages = [
  { label: 'Our Recruiters', href: '/placements/our-recruiters/' },
  { label: 'Placement Records', href: '/placements/placement-records/' },
  { label: 'Connect With Us', href: '/connect-with-us/' },
];

export async function PlacementPageShell({ title, active, activeHref, children, pageSlug }: { title: string; active: string; activeHref?: string; children: ReactNode; pageSlug?: string }) {
  const cms = pageSlug ? await getPlacementsPageContent(pageSlug) : null;
  const hero = cms?.sections.hero ?? {};
  const slide = { ...academicsHero, ...hero, title: cmsString(hero.title, title), subtitle: cmsString(hero.subtitle, "Navigating Today’s Business World with Tomorrow’s Leaders") };
  const nav = cms?.sections['page-nav'];
  const navLinks = Array.isArray(nav?.links) ? nav.links as { label: string; href: string }[] : placementPages;
  return (
    <>
      <PageHero
        size="inner"
        slides={(Array.isArray(cms?.masters.hero?.items) ? cms.masters.hero.items as Record<string, unknown>[] : []).filter(item => item.enabled !== false).map(item => ({ ...slide, ...item }) as typeof academicsHero)}
        actions={<>
          {cmsString(hero.primaryText, 'Apply Now') && <Button href={cmsString(hero.primaryHref, APPLY_PATH)}>{cmsString(hero.primaryText, 'Apply Now')}</Button>}
          {cmsString(hero.secondaryText, 'Enquire now') && <Button variant="arrow" href={cmsString(hero.secondaryHref, 'mailto:admissions@vsmedu.in')}>{cmsString(hero.secondaryText, 'Enquire now')}</Button>}
        </>}
        breadcrumb={[{ label: 'Home', href: '/' }, { label: 'Placements', href: '/placements/' }, { label: title }]}
      />
      <nav className={styles.nav} aria-label="Placement pages">
        <ul className={`container ${styles.navList}`} role="list">
          {navLinks.map((page) => (
            <li key={page.href}>
              <Link href={page.href} aria-current={activeHref ? activeHref === page.href ? 'page' : undefined : active === page.label ? 'page' : undefined}>{page.label}</Link>
            </li>
          ))}
        </ul>
      </nav>
      {active === 'Placement Records' && (
        <nav className={`container ${styles.batchNav}`} aria-label={cmsString(cms?.sections['batch-nav']?.title, 'Placement batch records')}>
          {(Array.isArray(cms?.sections['batch-nav']?.links) ? cms.sections['batch-nav']!.links as { label: string; href: string }[] : placementBatches).map((batch) => (
            <Link href={batch.href} aria-current={title.includes(batch.label.slice(5, 12)) ? 'page' : undefined} key={batch.href}>
              {batch.label}
            </Link>
          ))}
        </nav>
      )}
      <div className={styles.main}>{children}</div>
    </>
  );
}

export function PlacementSection({ title, eyebrow = 'Placement', children, intro, className }: { title: string; eyebrow?: string; children: ReactNode; intro?: ReactNode; className?: string }) {
  return (
    <section className={`container ${styles.section} ${className ?? ''}`}>
      <header className={styles.sectionHeader}>
        {eyebrow && <p className={styles.eyebrow}>{eyebrow}</p>}
        <h2>{title}</h2>
      </header>
      {intro && <div className={styles.intro}>{intro}</div>}
      {children}
    </section>
  );
}

