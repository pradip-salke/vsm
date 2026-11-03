import type { Metadata } from 'next';
import Image from 'next/image';
import { Carousel } from '@/components/ui/Carousel';
import { PlacementPageShell, PlacementSection } from '../../PlacementPageShell';
import styles from '../../PlacementPage.module.css';
import { batch2022Highlights, batch2022InternshipAssets, batch2022PlacementAssets } from '@/content/placements';

export const metadata: Metadata = {
  title: 'PGDM 2022–24 Placement Records',
  description: 'Internship and placement records for the PGDM 2022–24 batch at Valia School of Management.',
  alternates: { canonical: '/placements/placement-records/pgdm-2022-24-batch/' },
};

export default function PlacementBatch2022Page() {
  return (
    <PlacementPageShell title="PGDM 2022–24 Batch" active="Placement Records">
      <PlacementSection title="Placements Details of PGDM 2022–24 Batch" intro={<>
        <p>VSM strives to ensure every student enrolled with us understands the importance of placements and what it takes to help companies that visit our campus provide opportunities to excel.</p>
        <p>Placements is not a one-day process. We provide every student a platform with learning, industry interaction and internships with hands-on experience, helping them understand expectations, become industry ready and build confidence for success.</p>
      </>}>
        <h3 className={styles.sectionSubheading}>Key Highlights · Final Placement: In Progress</h3>
        <div className={styles.stats}>{batch2022Highlights.map(([value, label]) => <div key={label} className={styles.stat}><strong>{value}</strong><span>{label}</span></div>)}</div>
        <h3 className={styles.sectionSubheading}>Placements Records</h3>
        <Carousel
          label="Placement records for PGDM 2022–24 batch"
          slides={batch2022PlacementAssets.map((asset) => (
            <a className={styles.recordLink} href={asset.src} target="_blank" rel="noreferrer" key={asset.src}>
              <Image src={asset.src} alt={asset.alt} width={724} height={1024} sizes="(max-width: 767px) 90vw, 30vw" />
            </a>
          ))}
          className={styles.recordCarousel}
          dotsTone="dark"
          autoplayMs={6000}
        />
        <h3 className={styles.sectionSubheading}>Internship Records</h3>
        <Carousel
          label="Internship records for PGDM 2022–24 batch"
          slides={batch2022InternshipAssets.map((asset) => (
            <a className={styles.recordLink} href={asset.src} target="_blank" rel="noreferrer" key={asset.src}>
              <Image src={asset.src} alt={asset.alt} width={724} height={1024} sizes="(max-width: 767px) 90vw, 30vw" />
            </a>
          ))}
          className={styles.recordCarousel}
          dotsTone="dark"
          autoplayMs={6000}
        />
      </PlacementSection>
    </PlacementPageShell>
  );
}
