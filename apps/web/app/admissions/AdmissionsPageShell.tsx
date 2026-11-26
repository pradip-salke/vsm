import type { ReactNode } from 'react';
import { Link } from '@/components/navigation/Link';
import { Button } from '@/components/ui/Button';
import { PageHero } from '@/components/sections/PageHero';
import { academicsHero } from '@/content/academics';
import { APPLY_PATH } from '@/content/site';
import styles from './Admissions.module.css';
import type { CmsPageData } from '@/lib/cms-content';
import type { HeroSlide } from '@/content/types';

export const admissionPages = [
  { label: 'Admissions Process', href: '/admissions/mba-pgdm-admissions-process/' },
  { label: 'Fees Structure', href: '/admissions/pgdm-fee-structure/' },
  { label: 'Application Form', href: APPLY_PATH },
  { label: 'Refund Policy', href: '/admissions/refund-policy/' },
];

export function AdmissionsPageShell({ title, subtitle, active, children, content }: {
  title: string; subtitle: string; active: string; children: ReactNode; content?: CmsPageData | null;
}) {
  const cmsHero = content?.sections.hero;
  const slide = { ...academicsHero, ...(cmsHero ?? {}), title: typeof cmsHero?.title === 'string' ? cmsHero.title : title, subtitle: typeof cmsHero?.subtitle === 'string' ? cmsHero.subtitle : subtitle } as HeroSlide;
  const heroItems = Array.isArray(content?.masters.hero?.items) ? content.masters.hero.items as Record<string, unknown>[] : [];
  const slides = heroItems.filter(item => item.enabled !== false).map(item => ({ ...slide, ...item }) as HeroSlide);
  const nav = content?.sections['page-nav'];
  const navLinks = Array.isArray(nav?.links) ? nav.links as { label: string; href: string }[] : admissionPages;
  const primaryText = typeof cmsHero?.primaryText === 'string' ? cmsHero.primaryText : 'Apply Now';
  const primaryHref = typeof cmsHero?.primaryHref === 'string' ? cmsHero.primaryHref : APPLY_PATH;
  const secondaryText = typeof cmsHero?.secondaryText === 'string' ? cmsHero.secondaryText : 'Enquire now';
  const secondaryHref = typeof cmsHero?.secondaryHref === 'string' ? cmsHero.secondaryHref : 'mailto:admissions@vsmedu.in';
  return <>
    <PageHero size="inner" slides={slides.length ? slides : [slide]} breadcrumb={[
      { label: 'Home', href: '/' }, { label: 'Admissions', href: admissionPages[0].href }, { label: active },
    ]} actions={<>
      {primaryText && <Button href={primaryHref}>{primaryText}</Button>}
      {secondaryText && <Button href={secondaryHref}>{secondaryText}</Button>}
    </>} />
    <nav className={styles.nav} aria-label={typeof nav?.title === 'string' ? nav.title : 'Admissions pages'}><ul className={`container ${styles.navList}`} role="list">
      {navLinks.map((page) => <li key={page.href}><Link href={page.href} aria-current={page.label === active ? 'page' : undefined}>{page.label}</Link></li>)}
    </ul></nav>
    <div className={styles.content}>{children}</div>
  </>;
}

export function AdmissionSection({ id, title, children, className, titleClassName }: {
  id?: string; title: string; children: ReactNode; className?: string; titleClassName?: string;
}) {
  return <section id={id} className={`container ${styles.section} ${className ?? ''}`}>
    <h2 className={`${styles.heading} ${titleClassName ?? ''}`}>{title}</h2>{children}
  </section>;
}
