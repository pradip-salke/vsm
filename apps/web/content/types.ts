export type ImageAsset = { src: string; alt: string; width: number; height: number };

export type MediaItem = { image: ImageAsset; caption?: string; videoLink?: string; href?: string; galleryImages?: ImageAsset[] };

export type HeroSlide = {
  image: ImageAsset;
  title: string;
  subtitle: string;
  primaryText?: string;
  primaryHref?: string;
  secondaryText?: string;
  secondaryHref?: string;
  imagePosition?: string;
  mobileImagePosition?: string;
};
