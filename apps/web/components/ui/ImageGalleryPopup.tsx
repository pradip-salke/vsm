'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';
import type { ImageAsset } from '@/content/types';
import { youtubeEmbedUrl } from '@/lib/video-url';
import styles from './ImageGalleryPopup.module.css';

type ImageGalleryPopupProps = {
  images: ImageAsset[];
  title: string;
  initialIndex: number;
  onClose: () => void;
};

export function ImageGalleryPopup({ images, title, initialIndex, onClose }: ImageGalleryPopupProps) {
  const [activeIndex, setActiveIndex] = useState(initialIndex);

  useEffect(() => {
    setActiveIndex(Math.min(initialIndex, images.length - 1));
  }, [images.length, initialIndex]);

  useEffect(() => {
    if (!images.length) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
      if (event.key === 'ArrowLeft') setActiveIndex((index) => (index - 1 + images.length) % images.length);
      if (event.key === 'ArrowRight') setActiveIndex((index) => (index + 1) % images.length);
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [images.length, onClose]);

  if (!images.length) return null;
  const image = images[activeIndex];
  const videoUrl = youtubeEmbedUrl(image.src);

  return (
    <div className={styles.lightbox} role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <div className={styles.lightboxDialog} role="dialog" aria-modal="true" aria-label={title}>
        <button className={styles.lightboxClose} type="button" onClick={onClose} aria-label="Close image">
          <span aria-hidden="true">×</span>
        </button>
        {images.length > 1 && <button className={`${styles.lightboxArrow} ${styles.lightboxPrevious}`} type="button" onClick={() => setActiveIndex((activeIndex - 1 + images.length) % images.length)} aria-label="Previous image"><span aria-hidden="true">‹</span></button>}
        {videoUrl ? (
          <iframe key={image.src} className={styles.lightboxVideo} src={videoUrl} title={image.alt || `${title} video`} allow="autoplay; encrypted-media; picture-in-picture; web-share" referrerPolicy="strict-origin-when-cross-origin" allowFullScreen />
        ) : (
          <Image className={styles.lightboxImage} src={image.src} alt={image.alt} width={image.width} height={image.height} sizes="(max-width: 599px) 90vw, 80vw" />
        )}
        {images.length > 1 && <button className={`${styles.lightboxArrow} ${styles.lightboxNext}`} type="button" onClick={() => setActiveIndex((activeIndex + 1) % images.length)} aria-label="Next image"><span aria-hidden="true">›</span></button>}
        <p className={styles.lightboxCaption}>{title}</p>
        {images.length > 1 && <p className={styles.lightboxCount} aria-live="polite">{activeIndex + 1} / {images.length}</p>}
      </div>
    </div>
  );
}
