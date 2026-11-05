export type ImageAsset = { src: string; alt: string; width: number; height: number };

export type MediaItem = { image: ImageAsset; caption?: string; href?: string };

export type HeroSlide = {
  image: ImageAsset;
  title: string;
  subtitle: string;
  imagePosition?: string;
  mobileImagePosition?: string;
};
