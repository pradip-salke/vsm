import type { ComponentProps, ReactNode } from 'react';
import { PageHero } from '@/components/sections/PageHero';
import { getAboutPageContent, cmsString } from '@/lib/cms-content';
import styles from './disclosure.module.css';

type Breadcrumb = { label: string; href?: string };

export async function DisclosurePageShell({ slug, children }: { slug: string; children: ReactNode }) {
  const cms = await getAboutPageContent(slug);
  const heroItems = Array.isArray(cms?.masters.hero?.items) ? cms.masters.hero.items as Record<string, unknown>[] : [];
  const sectionHero = cms?.sections.hero ?? {};
  const enabledHeroItems = heroItems.filter((item) => item.enabled !== false);
  const sourceSlides = enabledHeroItems.length ? enabledHeroItems : (sectionHero.image ? [sectionHero] : []);
  const slides = sourceSlides.map((item) => ({
    ...item,
    ...('image' in sectionHero ? { image: item.image ?? sectionHero.image } : {}),
    title: cmsString(item.title, cmsString(sectionHero.title)),
    subtitle: cmsString(item.subtitle, cmsString(sectionHero.subtitle)),
  })) as ComponentProps<typeof PageHero>['slides'];
  const breadcrumb = Array.isArray(sectionHero.breadcrumb)
    ? (sectionHero.breadcrumb as Breadcrumb[])
      .filter((crumb) => typeof crumb.label === 'string' && crumb.label.trim())
      .map((crumb) => ({ label: crumb.label, ...(crumb.href ? { href: crumb.href } : {}) }))
    : undefined;

  return <>
    {slides.length > 0 && <PageHero size="inner" slides={slides} actions={null} breadcrumb={breadcrumb} />}
    <main className={`container ${styles.main}`}>
      {children}
    </main>
  </>;
}
