import type { Metadata } from 'next';
import { PlacementPageShell, PlacementSection } from '../PlacementPageShell';
import styles from '../PlacementPage.module.css';
import { placementIntro, recruiterAssets } from '@/content/placements';

export const metadata: Metadata = {
  title: 'Our Recruiters',
  description: 'Explore the companies hiring PGDM students from Valia School of Management.',
  alternates: { canonical: '/placements/our-recruiters/' },
};

export default function RecruitersPage() {
  return (
    <PlacementPageShell title="Our Recruiters" active="Our Recruiters">
      <PlacementSection title="Industry Connections That Help Students Grow" intro={placementIntro.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}>
        <h3 className={styles.sectionSubheading}>Our Recruiters</h3>
        <div className={styles.logoGrid}>
          {recruiterAssets.map((company) => (
            <figure className={styles.logoCard} key={company.alt}>
              <img src={company.src} alt={company.alt} loading="lazy" />
            </figure>
          ))}
        </div>
      </PlacementSection>
    </PlacementPageShell>
  );
}
