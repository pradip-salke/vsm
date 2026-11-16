/** Independent testimonial records, derived from the original combined master. */
export type TestimonialImage = { src: string; alt: string; width: number; height: number };
export type LegacyTestimonial = {
  name: string;
  batch: string;
  quote: string;
  videoLink?: string;
  image: TestimonialImage;
  avatar?: TestimonialImage;
  enabled: boolean;
};

export type VideoTestimonial = {
  name: string;
  batch: string;
  videoLink: string;
  image: TestimonialImage;
  enabled: boolean;
};

export type WrittenTestimonial = {
  name: string;
  batch: string;
  quote: string;
  avatar?: TestimonialImage;
  enabled: boolean;
};

/** Preserve the order and assets of legacy records without changing the source. */
export function splitLegacyTestimonials(items: LegacyTestimonial[]): {
  video: VideoTestimonial[];
  written: WrittenTestimonial[];
} {
  return {
    video: items.filter(item => item.videoLink?.trim()).map(item => ({
      name: item.name, batch: item.batch, videoLink: item.videoLink!, image: item.image, enabled: item.enabled,
    })),
    written: items.filter(item => item.quote?.trim()).map(item => ({
      name: item.name, batch: item.batch, quote: item.quote, ...(item.avatar ? { avatar: item.avatar } : {}), enabled: item.enabled,
    })),
  };
}
