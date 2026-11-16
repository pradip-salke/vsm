import type { Metadata } from 'next';
import Image from 'next/image';
import { Carousel } from '@/components/ui/Carousel';
import { PlacementPageShell, PlacementSection } from '../../PlacementPageShell';
import styles from '../../PlacementPage.module.css';
import { batch2022Highlights, batch2022InternshipAssets, batch2022PlacementAssets } from '@/content/placements';
import { CountUpValue } from '@/components/ui/CountUpValue';
import { withSeo } from '@/lib/seo';
import { getPlacementsPageContent, cmsString, type CmsImage } from '@/lib/cms-content';
import { CmsHtml } from '@/components/ui/CmsHtml';

const metadata: Metadata = {
  title: 'PGDM 2022–24 Placement Records',
  description: 'Internship and placement records for the PGDM 2022–24 batch at Valia School of Management.',
  alternates: { canonical: '/placements/placement-records/pgdm-2022-24-batch/' },
};

export async function generateMetadata(): Promise<Metadata> {
  return withSeo('/placements/placement-records/pgdm-2022-24-batch/', metadata);
}

export default async function PlacementBatch2022Page() {
  const cms = await getPlacementsPageContent('pgdm-2022-24-batch');
  const intro = cms?.sections.intro;
  const highlights = cms?.sections.highlights;
  const stats = Array.isArray(highlights?.items) ? highlights.items as { value: string; label: string }[] : batch2022Highlights.map(([value, label]) => ({ value, label }));
  const placementHeading = cms?.sections['placement-records'];
  const internshipHeading = cms?.sections['internship-records'];
  const images = (key: string, fallback: typeof batch2022PlacementAssets) => {
    const value = cms?.masters[key]?.items;
    return (Array.isArray(value) ? value as CmsImage[] : fallback).map((image) => ({ ...image, alt: image.alt ?? 'PGDM placement record', width: image.width ?? 724, height: image.height ?? 1024 }));
  };
  const placements = images('placements', batch2022PlacementAssets);
  const internships = images('internships', batch2022InternshipAssets);
  const fallbackIntro = '<p>VSM strives to ensure every student enrolled with us understands the importance of placements and what it takes to help companies that visit our campus provide opportunities to excel.</p><p>Placements is not a one-day process. We provide every student a platform with learning, industry interaction and internships with hands-on experience, helping them understand expectations, become industry ready and build confidence for success.</p>';
  return (
    <PlacementPageShell title="PGDM 2022–24 Batch" active="Placement Records" pageSlug="pgdm-2022-24-batch">
      <PlacementSection title={cmsString(intro?.title, 'Placements Details of PGDM 2022–24 Batch')} intro={<CmsHtml html={cmsString(intro?.body, fallbackIntro)} />}>
        <h3 className={styles.sectionSubheading}>{cmsString(highlights?.title, 'Key Highlights · Final Placement: In Progress')}</h3>
        <div className={styles.stats}>{stats.map(({ value, label }) => <div key={label} className={styles.stat}><strong><CountUpValue value={value} /></strong><span>{label}</span></div>)}</div>
        <h3 className={styles.sectionSubheading}>{cmsString(placementHeading?.title, 'Placements Records')}</h3>
        <Carousel
          label="Placement records for PGDM 2022–24 batch"
          slides={placements.map((asset) => (
            <a className={styles.recordLink} href={asset.src} target="_blank" rel="noreferrer" key={asset.src}>
              <Image src={asset.src} alt={asset.alt} width={724} height={1024} sizes="(max-width: 767px) 90vw, 30vw" />
            </a>
          ))}
          className={styles.recordCarousel}
          dotsTone="dark"
          autoplayMs={6000}
        />
        <h3 className={styles.sectionSubheading}>{cmsString(internshipHeading?.title, 'Internship Records')}</h3>
        <Carousel
          label="Internship records for PGDM 2022–24 batch"
          slides={internships.map((asset) => (
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
