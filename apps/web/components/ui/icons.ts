import type { SocialKey } from '@/content/site';

const FIG = '/images/figma';

export const icons = {
  arrow: `${FIG}/icon-arrow-right.svg`,
  chevronDown: `${FIG}/icon-chevron-down.svg`,
  menu: `${FIG}/icon-menu.svg`,
  close: `${FIG}/icon-close.svg`,
  phone: `${FIG}/icon-phone.svg`,
  mailOutline: `${FIG}/icon-mail-outline.svg`,
  callOutline: `${FIG}/icon-call-outline.svg`,
  location: `${FIG}/icon-location.svg`,
  check: `${FIG}/icon-check.svg`,
  play: `${FIG}/icon-play.svg`,
  playSmall: `${FIG}/icon-play-sm.svg`,
  faqOpen: `${FIG}/icon-faq-open.svg`,
  faqAdd: `${FIG}/icon-faq-add.svg`,
  refresh: `${FIG}/icon-refresh.svg`,
  download: `${FIG}/icon-download.svg`,
  graduate: '/images/icons/graduate.svg',
  social: {
    facebook: `${FIG}/social-facebook.svg`,
    x: `${FIG}/social-x.svg`,
    instagram: `${FIG}/social-instagram.svg`,
    linkedin: `${FIG}/social-linkedin.svg`,
    pinterest: `${FIG}/social-pinterest.svg`,
    youtube: `${FIG}/icon-youtube.svg`,
  },
} as const;

/** Top-bar social glyphs on Figma's 34px disc; `size` is the glyph's px within it (Instagram's export includes its disc). */
export const topBarSocialIcons: Partial<Record<SocialKey, { src: string; size: number }>> = {
  facebook: { src: `${FIG}/icon-facebook.svg`, size: 24 },
  instagram: { src: `${FIG}/icon-instagram.svg`, size: 34 },
  youtube: { src: `${FIG}/icon-youtube.svg`, size: 24 },
};
