import type { Metadata } from 'next';
import { Link } from '@/components/navigation/Link';
import { PlacementPageShell, PlacementSection } from './PlacementPageShell';
import styles from './PlacementPage.module.css';
import { batch2022Highlights, placementIntro } from '@/content/placements';

export const metadata: Metadata = {
  title: 'PGDM Placements',
  description: 'Explore PGDM placements, recruiters, placement records, alumni outcomes and corporate connections at Valia School of Management.',
  alternates: { canonical: '/placements/' },
};

const pages = [
  { title: 'Our Recruiters', text: 'Meet organizations that recruit VSM students across industries.', href: '/placements/our-recruiters/' },
  { title: 'Placement Records', text: 'Review recent internship records and batch-wise placement outcomes.', href: '/placements/placement-records/' },
  { title: 'Alumni', text: 'Read about distinguished alumni and the paths they have built after PGDM.', href: '/placements/alumni/' },
];

export default function PlacementsPage() {
  return (
    <PlacementPageShell title="Placements" active="Placements">
      <PlacementSection title="Achieve Your Career Goals with VSM’s PGDM Placements" intro={placementIntro.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}>
        <div className={styles.cards}>
          {pages.map((page) => <article className={styles.card} key={page.href}>
            <h3>{page.title}</h3><p>{page.text}</p><Link href={page.href}>Explore {page.title}<span aria-hidden>→</span></Link>
          </article>)}
          <article className={styles.card}>
            <h3>Connect With Us</h3><p>Contact our team to discuss student engagement, internships and recruitment opportunities.</p>
            <Link href="/connect-with-us/">Connect with VSM<span aria-hidden>→</span></Link>
          </article>
        </div>
      </PlacementSection>
      <PlacementSection title="PGDM 2022–24 Batch · Internship Highlights">
        <div className={styles.stats}>{batch2022Highlights.map(([value, label]) => <div key={label} className={styles.stat}><strong>{value}</strong><span>{label}</span></div>)}</div>
        <div className={styles.batchNav}><Link href="/placements/placement-records/">View placement records →</Link></div>
      </PlacementSection>
    </PlacementPageShell>
  );
}
