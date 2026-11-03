import type { ReactNode } from 'react';
import { Link } from '@/components/navigation/Link';
import { Button } from '@/components/ui/Button';
import { PageHero } from '@/components/sections/PageHero';
import { academicsHero } from '@/content/academics';
import { APPLY_PATH } from '@/content/site';
import styles from './Admissions.module.css';

export const admissionPages = [
  { label: 'Admissions Process', href: '/admissions/mba-pgdm-admissions-process/' },
  { label: 'Fees Structure', href: '/admissions/pgdm-fee-structure/' },
  { label: 'Application Form', href: APPLY_PATH },
  { label: 'Refund Policy', href: '/admissions/refund-policy/' },
];

export function AdmissionsPageShell({ title, subtitle, active, children }: {
  title: string; subtitle: string; active: string; children: ReactNode;
}) {
  const slide = { ...academicsHero, title, subtitle };
  return <>
    <PageHero size="inner" slides={[slide]} breadcrumb={[
      { label: 'Home', href: '/' }, { label: 'Admissions', href: admissionPages[0].href }, { label: active },
    ]} actions={<>
      <Button href={APPLY_PATH}>Apply Now</Button>
      <Button variant="arrow" href="mailto:admissions@vsmedu.in">Enquire now</Button>
    </>} />
    <nav className={styles.nav} aria-label="Admissions pages"><ul className={`container ${styles.navList}`} role="list">
      {admissionPages.map((page) => <li key={page.href}><Link href={page.href} aria-current={page.label === active ? 'page' : undefined}>{page.label}</Link></li>)}
    </ul></nav>
    <div className={styles.content}>{children}</div>
  </>;
}

export function AdmissionSection({ id, title, children }: { id?: string; title: string; children: ReactNode }) {
  return <section id={id} className={`container ${styles.section}`}>
    <h2 className={styles.heading}>{title}</h2>{children}
  </section>;
}
