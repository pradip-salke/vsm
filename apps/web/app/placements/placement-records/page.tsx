import type { Metadata } from 'next';
import Image from 'next/image';
import { PlacementPageShell, PlacementSection } from '../PlacementPageShell';
import styles from '../PlacementPage.module.css';
import { currentBatchInternshipAssets } from '@/content/placements';

export const metadata: Metadata = {
  title: 'PGDM Placement Records',
  description: 'Browse internship and placement records and outcomes by PGDM batch at Valia School of Management.',
  alternates: { canonical: '/placements/placement-records/' },
};

export default function PlacementRecordsPage() {
  return (
    <PlacementPageShell title="Placement Records" active="Placement Records">
      <PlacementSection title="Batch Wise Placement Records" className={styles.placementRecordsSection}>
        <h3 className={styles.sectionSubheading}>Summer Internship 2025–27</h3>
        <div className={styles.recordGrid}>
          {currentBatchInternshipAssets.map((asset) => <a className={styles.recordLink} href={asset.src} target="_blank" rel="noreferrer" key={asset.src}>
            <Image src={asset.src} alt={asset.alt} width={724} height={1024} sizes="(max-width: 767px) 90vw, 30vw" />
          </a>)}
        </div>
      </PlacementSection>
    </PlacementPageShell>
  );
}
