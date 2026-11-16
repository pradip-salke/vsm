import type { Metadata } from 'next';
import Image from 'next/image';
import { PlacementPageShell, PlacementSection } from '../PlacementPageShell';
import styles from '../PlacementPage.module.css';
import { placementIntro, recruiterAssets } from '@/content/placements';
import { withSeo } from '@/lib/seo';
import { getPlacementsPageContent, cmsString, type CmsImage } from '@/lib/cms-content';
import { CmsHtml } from '@/components/ui/CmsHtml';

const metadata: Metadata = {
  title: 'Our Recruiters',
  description: 'Explore the companies hiring PGDM students from Valia School of Management.',
  alternates: { canonical: '/placements/our-recruiters/' },
};

export async function generateMetadata(): Promise<Metadata> {
  return withSeo('/placements/our-recruiters/', metadata);
}

export default async function RecruitersPage() {
  const cms = await getPlacementsPageContent('our-recruiters');
  const intro = cms?.sections.intro;
  const section = cms?.sections.recruiters;
  const logos = (Array.isArray(cms?.masters.recruiters?.items) ? cms.masters.recruiters.items as CmsImage[] : recruiterAssets).map((company) => ({ ...company, alt: company.alt ?? '', width: company.width ?? 240, height: company.height ?? 120 }));
  return (
    <PlacementPageShell title="Our Recruiters" active="Our Recruiters" pageSlug="our-recruiters">
      <PlacementSection title={cmsString(intro?.title, 'Industry Connections That Help Students Grow')} intro={<CmsHtml html={cmsString(intro?.body, placementIntro.map((paragraph) => `<p>${paragraph}</p>`).join(''))} />}>
        <h3 className={styles.sectionSubheading}>{cmsString(section?.title, 'Our Recruiters')}</h3>
        <div className={styles.logoGrid}>
          {logos.map((company) => (
            <figure className={styles.logoCard} key={company.alt}>
              <Image src={company.src} alt={company.alt} width={240} height={120} sizes="(max-width: 767px) 42vw, (max-width: 1199px) 22vw, 16vw" />
            </figure>
          ))}
        </div>
      </PlacementSection>
    </PlacementPageShell>
  );
}
