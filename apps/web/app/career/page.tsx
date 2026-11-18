import type { Metadata } from 'next';
import Image from 'next/image';
import { Button } from '@/components/ui/Button';
import { PageHero } from '@/components/sections/PageHero';
import { academicsHero } from '@/content/academics';
import { CareerApplicationForm } from './CareerApplicationForm';
import { CtaBanner } from '@/features/home/CtaBanner';
import styles from './CareerPage.module.css';
import { withSeo } from '@/lib/seo';
import { cmsImage, cmsString, getCareerPageContent, type CmsImage } from '@/lib/cms-content';
import { homeDefaults, type HomeContent } from '@vsmedu/contracts/home';

const metadata: Metadata = {
  title: 'Career | Valia School of Management',
  description: 'Explore career opportunities at Valia School of Management and apply for a position.',
  alternates: { canonical: '/career/' },
};

export async function generateMetadata(): Promise<Metadata> {
  return withSeo('/career/', metadata);
}

export default async function CareerPage() {
  const cms = await getCareerPageContent('career');
  const heroMaster = cms?.masters.hero as { items?: typeof academicsHero[] } | undefined;
  const slide = { ...academicsHero, ...(heroMaster?.items?.[0] ?? {}), title: cmsString(heroMaster?.items?.[0]?.title, 'Start your career with VSM'), subtitle: cmsString(heroMaster?.items?.[0]?.subtitle, 'VSM Career Opportunities') };
  const breadcrumbSection = cms?.sections.hero as { breadcrumb?: { label: string; href?: string }[] } | undefined;
  const application = cms?.sections.application;
  const image = cmsImage(application?.image, { src: 'https://vsmedu.com/wp-content/uploads/2025/11/2150917138.jpg', alt: 'Professionals collaborating in a modern workplace', width: 800, height: 1000 } satisfies CmsImage);
  const cta = cms?.sections.cta as unknown as HomeContent['cta'] | undefined;

  return (
    <>
      <PageHero
        size="inner"
        className={`${styles.hero} careerHero`}
        slides={[slide]}
        actions={<Button href={slide.primaryHref || '#career-application'}>{slide.primaryText || 'Apply for a position'}</Button>}
        breadcrumb={breadcrumbSection?.breadcrumb ?? [{ label: 'Home', href: '/' }, { label: 'Career' }]}
      />

      <main className={styles.main}>
        <section className={`container ${styles.application}`} id="career-application">
          <div className={styles.applicationGrid}>
            <div className={styles.imageWrap}>
              <Image
                src={image.src}
                alt={image.alt ?? ''}
                width={image.width ?? 800}
                height={image.height ?? 1000}
                sizes="(max-width: 800px) 100vw, 42vw"
              />
              <div className={styles.imageCaption}>
                <span>{cmsString(application?.captionEyebrow, 'Build your future')}</span>
                <strong>{cmsString(application?.captionTitle, 'Grow with VSM')}</strong>
              </div>
            </div>
            <div className={styles.formPanel}>
              <h3>{cmsString(application?.formTitle, 'Apply for a position')}</h3>
              <p className={styles.formIntro}>{cmsString(application?.formIntro, 'Share your details and resume with our team.')}</p>
              <CareerApplicationForm />
            </div>
          </div>
        </section>

        <CtaBanner content={cta ?? homeDefaults.cta} />
      </main>
    </>
  );
}
