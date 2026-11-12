// Shared shape for page-wise CMS registries (About Us, Career, Blogs pages).
// Each page is stored independently under `<group>.<page>.<section>` (masters: `<group>.<page>.master-<key>`).
import type { AcademicsHeroSlide } from './academics.js';

export type SitePageDefinition = {
  path: string;
  navTitle: string;
  sections: Record<string, unknown>;
  masters: { hero: { items: AcademicsHeroSlide[] } } & Record<string, { items: unknown[] }>;
  /** Item shape for master lists that may start empty (validation template). */
  itemTemplates?: Record<string, unknown>;
  labels: Record<string, string>;
  subtitles: Record<string, string>;
};

const FIG = '/images/figma';

export function innerBannerSlide(title: string, subtitle: string, primary?: { text: string; href: string }): AcademicsHeroSlide {
  return {
    image: { src: `${FIG}/academics-banner.webp`, alt: 'PGDM graduates celebrating at Valia School of Management', width: 1918, height: 820 },
    imagePosition: '70% 100%',
    mobileImagePosition: '78% 50%',
    title,
    subtitle,
    primaryText: primary?.text ?? '',
    primaryHref: primary?.href ?? '',
    secondaryText: '',
    secondaryHref: '',
    enabled: true,
  };
}

export const BANNER_BREADCRUMB_SUBTITLE = 'Breadcrumb trail for the banner. Heading, image and buttons are edited in Page Banner (slider).';
export const SEO_SUBTITLE = 'Browser title and meta description used for search engines.';
