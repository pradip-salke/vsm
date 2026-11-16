import type { Metadata } from 'next';
import Image from 'next/image';
import { PlacementPageShell, PlacementSection } from '../PlacementPageShell';
import styles from '../PlacementPage.module.css';
import { currentBatchInternshipAssets } from '@/content/placements';
import { withSeo } from '@/lib/seo';
import { getPlacementsPageContent, cmsString, type CmsImage } from '@/lib/cms-content';

const metadata: Metadata = {
  title: 'PGDM Placement Records',
  description: 'Browse internship and placement records and outcomes by PGDM batch at Valia School of Management.',
  alternates: { canonical: '/placements/placement-records/' },
};

export async function generateMetadata(): Promise<Metadata> {
  return withSeo('/placements/placement-records/', metadata);
}

export default async function PlacementRecordsPage() {
  const cms = await getPlacementsPageContent('placement-records');
  const section = cms?.sections.records;
  const images = Array.isArray(cms?.masters.records?.items) ? cms.masters.records.items as CmsImage[] : currentBatchInternshipAssets;
  const records = images.map((asset) => ({ ...asset, alt: asset.alt ?? 'PGDM internship placement record', width: asset.width ?? 724, height: asset.height ?? 1024 }));
  return (
    <PlacementPageShell title="Placement Records" active="Placement Records" pageSlug="placement-records">
      <PlacementSection title={cmsString(section?.title, 'Batch Wise Placement Records')} className={styles.placementRecordsSection}>
        <h3 className={styles.sectionSubheading}>{cmsString(section?.subheading, 'Summer Internship 2025–27')}</h3>
        <div className={styles.recordGrid}>
          {records.map((asset) => <a className={styles.recordLink} href={asset.src} target="_blank" rel="noreferrer" key={asset.src}>
            <Image src={asset.src} alt={asset.alt} width={724} height={1024} sizes="(max-width: 767px) 90vw, 30vw" />
          </a>)}
        </div>
      </PlacementSection>
    </PlacementPageShell>
  );
}
