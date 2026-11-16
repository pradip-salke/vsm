'use client';

import Image from 'next/image';
import { useState } from 'react';
import { Carousel } from '@/components/ui/Carousel';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { Icon } from '@/components/ui/Icon';
import { icons } from '@/components/ui/icons';
import { VideoPopup } from '@/components/ui/VideoPopup';
import { normalizeVideoUrl } from '@/lib/video-url';
import { testimonialFallbackImage, testimonials } from '@/content/shared';
import styles from './Testimonials.module.css';
import type { HomeHeading } from '@vsmedu/contracts/home';

const initials = (name: string) =>
  name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2);

export function Testimonials({ reduceBottomPadding = false, items = testimonials, videoItems = items, writtenItems = items, heading }: { reduceBottomPadding?: boolean; items?: typeof testimonials; videoItems?: typeof testimonials; writtenItems?: typeof testimonials; heading?: HomeHeading }) {
  const [activeVideo, setActiveVideo] = useState<{ title: string; videoUrl: string } | null>(null);
  const videoSlides = videoItems.filter(item => normalizeVideoUrl(item.videoLink)).map((item, index) => {
    const media = item.image ?? testimonialFallbackImage;
    const videoUrl = normalizeVideoUrl(item.videoLink);
    return (
      <figure key={`${item.name}-${index}`} className={styles.slide}>
        <div className={styles.media}>
          <Image src={media.src} alt={media.alt} width={media.width} height={media.height} sizes="(max-width: 767px) 88vw, 55vw" />
          {videoUrl && (
            <button
              type="button"
              className={styles.playButton}
              aria-label={item.name ? `Play ${item.name}'s testimonial` : 'Play video testimonial'}
              aria-haspopup="dialog"
              onClick={() => setActiveVideo({ title: item.name || 'Video testimonial', videoUrl })}
            >
              <Icon src={icons.playSmall} size="100%" />
            </button>
          )}
        </div>
      </figure>
    );
  });
  const writtenSlides = writtenItems.filter(item => item.quote?.trim()).map((item) => (
      <figure key={item.name} className={styles.slide}>
        <div className={styles.card} data-info-card>
          <div className={styles.cardContent}>
          <blockquote className={styles.quote} tabIndex={0} role="region" aria-label={`${item.name}'s written testimonial`}>
            <p>“{item.quote}”</p>
          </blockquote>
          <figcaption className={styles.person}>
            {item.avatar?.src ? (
              <Image className={styles.avatar} src={item.avatar.src} alt="" width={80} height={80} sizes="80px" />
            ) : (
              <span className={`${styles.avatar} ${styles.initials}`} aria-hidden>
                {initials(item.name)}
              </span>
            )}
            <span className={styles.name}>{item.name}</span>
            <span className={styles.batch}>Batch: {item.batch}</span>
          </figcaption>
          </div>
        </div>
      </figure>
  ));

  return (
    <section id="testimonials" className={`${styles.section} ${reduceBottomPadding ? styles.reducedBottom : ''}`} aria-labelledby="testimonials-title">
      <div className="container">
        <SectionHeading
          id="testimonials-title"
          eyebrow={heading?.eyebrow ?? 'What students say about us?'}
          eyebrowTone="plain"
          title={heading?.title ?? 'Hear from Our PGDM Students'}
          tone="light"
          align="center"
        />
      </div>
      {videoSlides.length > 0 && <Carousel
        label="Video testimonials"
        slides={videoSlides}
        align="center"
        infiniteLoop
        dotsTone="light"
        className={`${styles.carousel} ${styles.videoCarousel}`}
      />}
      {writtenSlides.length > 0 && <Carousel
        label="Written testimonials"
        slides={writtenSlides}
        align="center"
        infiniteLoop
        dotsTone="light"
        className={styles.carousel}
      />}
      {activeVideo && <VideoPopup title={activeVideo.title} videoUrl={activeVideo.videoUrl} onClose={() => setActiveVideo(null)} hideTitle />}
    </section>
  );
}
