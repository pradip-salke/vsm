import type { Metadata } from 'next';
import Image from 'next/image';
import { PlacementPageShell, PlacementSection } from '../PlacementPageShell';
import styles from '../PlacementPage.module.css';
import { withSeo } from '@/lib/seo';
import { getPlacementsPageContent, cmsString, type CmsImage } from '@/lib/cms-content';
import { CmsHtml } from '@/components/ui/CmsHtml';

export async function generateMetadata(): Promise<Metadata> {
  return withSeo('/placements/our-recruiters/', { alternates: { canonical: '/placements/our-recruiters/' } });
}

export default async function RecruitersPage() {
  const cms = await getPlacementsPageContent('our-recruiters');
  const intro = cms?.sections.intro;
  const section = cms?.sections.recruiters;
  const logos = (Array.isArray(cms?.masters.recruiters?.items) ? cms.masters.recruiters.items as CmsImage[] : [])
    .filter((company) => company && typeof company.src === 'string' && company.src && (company as CmsImage & { enabled?: boolean }).enabled !== false)
    .map((company) => ({ ...company, alt: company.alt ?? '', width: company.width ?? 240, height: company.height ?? 120 }));
  return (
    <PlacementPageShell title="Our Recruiters" active="Our Recruiters" pageSlug="our-recruiters">
      <PlacementSection eyebrow={cmsString(intro?.eyebrow)} title={cmsString(intro?.title)} intro={cmsString(intro?.body) ? <CmsHtml html={cmsString(intro?.body)} /> : undefined}>
        {cmsString(section?.title) && <h3 className={styles.sectionSubheading}>{cmsString(section?.title)}</h3>}
        <div className={styles.logoGrid}>
          {logos.map((company) => (
            <figure className={styles.logoCard} key={company.src}>
              <Image src={company.src} alt={company.alt} width={company.width} height={company.height} sizes="(max-width: 767px) 42vw, (max-width: 1199px) 22vw, 16vw" />
            </figure>
          ))}
        </div>
      </PlacementSection>
    </PlacementPageShell>
  );
}
