import type { Metadata } from 'next';
import Link from 'next/link';
import { PlacementPageShell, PlacementSection } from '../PlacementPageShell';
import styles from '../PlacementPage.module.css';
import { currentBatchInternshipAssets, placementBatches } from '@/content/placements';

export const metadata: Metadata = {
  title: 'PGDM Placement Records',
  description: 'Browse internship and placement records and outcomes by PGDM batch at Valia School of Management.',
  alternates: { canonical: '/placements/placement-records/' },
};

export default function PlacementRecordsPage() {
  return (
    <PlacementPageShell title="Placement Records" active="Placement Records">
      <PlacementSection title="Batch Wise Placement Records">
        <h3 className={styles.sectionSubheading}>Summer Internship 2025–27</h3>
        <div className={styles.recordGrid}>
          {currentBatchInternshipAssets.map((asset) => <a className={styles.recordLink} href={asset.src} target="_blank" rel="noreferrer" key={asset.src}>
            <img src={asset.src} alt={asset.alt} loading="lazy" />
          </a>)}
        </div>
        <nav className={styles.batchNav} aria-label="Placement batch records">
          {placementBatches.map((batch) => <Link href={batch.href} key={batch.href}>{batch.label}</Link>)}
        </nav>
      </PlacementSection>
    </PlacementPageShell>
  );
}
