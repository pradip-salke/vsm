'use client';

import Image from 'next/image';
import { useState } from 'react';
import { Link } from '@/components/navigation/Link';
import { Carousel } from '@/components/ui/Carousel';
import { Icon } from '@/components/ui/Icon';
import { icons } from '@/components/ui/icons';
import { SectionHeading } from '@/components/ui/SectionHeading';
import type { MediaItem } from '@/content/types';
import type { ImageAsset } from '@/content/types';
import styles from './MediaCarousel.module.css';
import { VideoPopup } from '@/components/ui/VideoPopup';
import { ImageGalleryPopup } from '@/components/ui/ImageGalleryPopup';
import { Button } from '@/components/ui/Button';
import { videoThumbnailUrl } from '@/lib/video-url';

type GalleryAlbum = { title: string; href: string; image: ImageAsset; images: ImageAsset[] };

function gallerySlug(href?: string) {
  const slug = href?.match(/\/gallery\/([^/?#]+)/i)?.[1]?.toLowerCase();
  return slug?.replace(/^silvasa-/, 'silvassa-');
}

function findRelatedAlbum(item: MediaItem, albums: GalleryAlbum[]) {
  const slug = gallerySlug(item.href);
  if (slug) {
    const linkedAlbum = albums.find((album) => gallerySlug(album.href) === slug);
    if (linkedAlbum) return linkedAlbum;
  }

  const matchingImage = albums.find((album) => album.image.src === item.image.src);
  if (matchingImage) return matchingImage;

  const description = `${item.caption ?? ''} ${item.image.alt}`.toLowerCase();
  const relatedSlug = description.includes('silvassa')
    ? 'silvassa-industrial-visit'
    : description.includes('outbound')
      ? 'outbound-activity'
      : description.includes('speaker') || description.includes('seminar')
        ? 'mr-ramesh-sir-seminar'
        : description.includes('classroom') || description.includes('inauguration')
          ? 'inauguration-2025'
          : description.includes('campus') || description.includes('life')
            ? 'infra'
            : undefined;
  return relatedSlug ? albums.find((album) => gallerySlug(album.href) === relatedSlug) : undefined;
}

type MediaCarouselProps = {
  id: string;
  title: string;
  items: MediaItem[];
  /** Slide geometry in Figma px: Events 688×454, Life 535×426, Videos 790×454. */
  layout: 'events' | 'life' | 'video';
  /** `page` = centred section; `column` = left-aligned inside the Academics column. */
  variant?: 'page' | 'column';
  uppercase?: boolean;
  /** Decorative play badge on video stills. */
  play?: boolean;
  background?: 'page' | 'cream';
  /** Open the section's images in the shared gallery lightbox when a slide is clicked. */
  galleryPopup?: boolean;
  /** Full Events > Gallery albums used to resolve slider covers to their image sets. */
  galleryAlbums?: GalleryAlbum[];
  /** Album slug for slider collections without a direct album URL. */
  galleryFallbackSlug?: string;
  /** Optional link shown beneath the carousel, e.g. Home Events → full gallery. */
  moreLink?: { href: string; label: string };
};

export function MediaCarousel({
  id,
  title,
  items,
  layout,
  variant = 'page',
  uppercase = false,
  play = false,
  background = 'page',
  galleryPopup = false,
  galleryAlbums = [],
  galleryFallbackSlug,
  moreLink,
}: MediaCarouselProps) {
  const headingId = `${id}-title`;
  const showCaption = layout !== 'events';
  const [activeVideo, setActiveVideo] = useState<{ title: string; videoUrl: string } | null>(null);
  const [activeImageIndex, setActiveImageIndex] = useState<number | null>(null);
  const slides = items.map((item, index) => {
    const youtubeThumbnail = videoThumbnailUrl(item.image.src);
    const videoLink = item.videoLink?.trim() || (youtubeThumbnail ? item.image.src : '');
    const showPlayBadge = play || Boolean(videoLink);
    const linkHref = item.href?.trim() || '';
    const isExternal = /^https?:\/\//i.test(linkHref);
    const media = (
      <>
        <span className={styles.frame}>
          {item.image.src ? <Image
            src={youtubeThumbnail || item.image.src}
            alt={item.image.alt}
            width={item.image.width}
            height={item.image.height}
            sizes={variant === 'page' ? '(max-width: 767px) 85vw, 36vw' : '(max-width: 767px) 85vw, 42vw'}
            unoptimized={Boolean(youtubeThumbnail)}
          /> : videoLink ? <video src={videoLink} muted playsInline preload="metadata" aria-hidden="true" /> : null}
          {showPlayBadge && (
            <span className={styles.play} aria-hidden>
              <Icon src={icons.playSmall} size="100%" />
            </span>
          )}
        </span>
        {showCaption && item.caption && <span className={styles.caption}>{item.caption}</span>}
      </>
    );
    if (videoLink) {
      return (
        <button key={index} type="button" className={`${styles.item} ${styles.videoTrigger}`} onClick={() => setActiveVideo({ title: item.caption?.trim() || title, videoUrl: videoLink })} aria-haspopup="dialog" aria-label={`Play ${item.caption?.trim() || title}`}>
          {media}
        </button>
      );
    }
    if (galleryPopup) {
      return (
        <button
          key={index}
          type="button"
          className={`${styles.item} ${styles.imageTrigger}`}
          onClick={() => setActiveImageIndex(index)}
          aria-haspopup="dialog"
          aria-label={`View ${item.image.alt || title}`}
        >
          {media}
        </button>
      );
    }
    if (!linkHref) {
      return (
        <div key={index} className={styles.item}>
          {media}
        </div>
      );
    }
    if (isExternal) {
      return (
        <a
          key={index}
          href={linkHref}
          className={styles.item}
          target="_blank"
          rel="noopener noreferrer"
        >
          {media}
        </a>
      );
    }
    return (
      <Link key={index} href={linkHref} className={styles.item}>
        {media}
      </Link>
    );
  });

  return (
    <section
      id={id}
      className={[styles[variant], styles[layout], styles[`bg-${background}`]].filter(Boolean).join(' ')}
      aria-labelledby={headingId}
    >
      <div className={variant === 'page' ? 'container' : undefined}>
        <SectionHeading id={headingId} title={title} align={variant === 'page' ? 'center' : 'start'} uppercase={uppercase} />
        <Carousel
          label={title}
          slides={slides}
          className={styles.carousel}
          bleed={layout !== 'life' || variant === 'column'}
          dotsAlign={variant === 'page' ? 'center' : 'start'}
        />
        {moreLink && (
          <div className={styles.moreLink}>
            <Button variant="arrow" href={moreLink.href}>{moreLink.label}</Button>
          </div>
        )}
      </div>
      {activeVideo && <VideoPopup title={activeVideo.title} videoUrl={activeVideo.videoUrl} onClose={() => setActiveVideo(null)} />}
      {activeImageIndex !== null && (() => {
        const activeItem = items[activeImageIndex];
        const album = activeItem ? findRelatedAlbum(activeItem, galleryAlbums) : undefined;
        const images = activeItem?.galleryImages?.length ? activeItem.galleryImages : album?.images
          ?? galleryAlbums.find((candidate) => gallerySlug(candidate.href) === galleryFallbackSlug)?.images
          ?? [];
        return images.length ? <ImageGalleryPopup images={images} title={album?.title ?? title} initialIndex={0} onClose={() => setActiveImageIndex(null)} /> : null;
      })()}
    </section>
  );
}
