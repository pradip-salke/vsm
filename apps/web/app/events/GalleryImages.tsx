'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';
import type { ImageAsset } from '@/content/types';
import styles from './events.module.css';

type GalleryItem = { title: string; image: ImageAsset; images?: ImageAsset[] };

export function GalleryImages({ items, slideshowImages, hideCaptions = false }: { items: GalleryItem[]; slideshowImages?: ImageAsset[]; hideCaptions?: boolean }) {
  const [activeGallery, setActiveGallery] = useState<GalleryItem | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const activeImages = activeGallery ? (slideshowImages?.length ? slideshowImages : activeGallery.images?.length ? activeGallery.images : [activeGallery.image]) : [];

  useEffect(() => {
    if (!activeGallery) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setActiveGallery(null);
      if (event.key === 'ArrowLeft') setActiveIndex((index) => (index - 1 + activeImages.length) % activeImages.length);
      if (event.key === 'ArrowRight') setActiveIndex((index) => (index + 1) % activeImages.length);
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [activeGallery, activeImages.length]);

  return <>
    <div className={styles.cards}>
      {items.map((item, index) => (
        <article className={styles.card} key={`${item.title}-${index}`}>
          <button className={styles.imageButton} type="button" onClick={() => { setActiveIndex(slideshowImages?.length ? index : 0); setActiveGallery(item); }} aria-label={`View image: ${item.title}`}>
            <Image className={styles.image} src={item.image.src} alt={item.image.alt} width={item.image.width} height={item.image.height} sizes="(max-width: 599px) 90vw, (max-width: 1023px) 45vw, 30vw" />
          </button>
          {!hideCaptions && <div className={styles.cardBody}><h3>{item.title}</h3></div>}
        </article>
      ))}
    </div>
    {activeGallery && activeImages.length > 0 && (
      <div className={styles.lightbox} role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setActiveGallery(null); }}>
        <div className={styles.lightboxDialog} role="dialog" aria-modal="true" aria-label={activeGallery.title}>
          <button className={styles.lightboxClose} type="button" onClick={() => setActiveGallery(null)} aria-label="Close image">
            <span aria-hidden="true">×</span>
          </button>
          {activeImages.length > 1 && <button className={`${styles.lightboxArrow} ${styles.lightboxPrevious}`} type="button" onClick={() => setActiveIndex((activeIndex - 1 + activeImages.length) % activeImages.length)} aria-label="Previous image"><span aria-hidden="true">‹</span></button>}
          <Image className={styles.lightboxImage} src={activeImages[activeIndex].src} alt={activeImages[activeIndex].alt} width={activeImages[activeIndex].width} height={activeImages[activeIndex].height} sizes="(max-width: 599px) 90vw, 80vw" />
          {activeImages.length > 1 && <button className={`${styles.lightboxArrow} ${styles.lightboxNext}`} type="button" onClick={() => setActiveIndex((activeIndex + 1) % activeImages.length)} aria-label="Next image"><span aria-hidden="true">›</span></button>}
          <p className={styles.lightboxCaption}>{activeGallery.title}</p>
          {activeImages.length > 1 && <p className={styles.lightboxCount} aria-live="polite">{activeIndex + 1} / {activeImages.length}</p>}
        </div>
      </div>
    )}
  </>;
}
