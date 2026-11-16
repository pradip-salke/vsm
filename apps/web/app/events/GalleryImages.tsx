'use client';

import { useState } from 'react';
import Image from 'next/image';
import type { ImageAsset } from '@/content/types';
import styles from './events.module.css';
import { ImageGalleryPopup } from '@/components/ui/ImageGalleryPopup';

type GalleryItem = { title: string; image: ImageAsset; images?: ImageAsset[] };

export function GalleryImages({ items, slideshowImages, hideCaptions = false }: { items: GalleryItem[]; slideshowImages?: ImageAsset[]; hideCaptions?: boolean }) {
  const [activeGallery, setActiveGallery] = useState<GalleryItem | null>(null);
  const activeImages = activeGallery ? (slideshowImages?.length ? slideshowImages : activeGallery.images?.length ? activeGallery.images : [activeGallery.image]) : [];

  return <>
    <div className={styles.cards}>
      {items.map((item, index) => (
        <article className={styles.card} key={`${item.title}-${index}`}>
          <button className={styles.galleryCardButton} type="button" onClick={() => setActiveGallery(item)} aria-label={`View image: ${item.title}`}>
            <span className={styles.imageButton} aria-hidden="true">
              <Image className={`${styles.image} ${styles.galleryImage}`} src={item.image.src} alt="" width={item.image.width} height={item.image.height} sizes="(max-width: 599px) 90vw, (max-width: 1023px) 45vw, 30vw" />
            </span>
            {!hideCaptions && <span className={styles.cardBody}><h3 className={styles.galleryTitle}>{item.title}</h3></span>}
          </button>
        </article>
      ))}
    </div>
    {activeGallery && activeImages.length > 0 && <ImageGalleryPopup images={activeImages} title={activeGallery.title} initialIndex={slideshowImages?.length ? items.indexOf(activeGallery) : 0} onClose={() => setActiveGallery(null)} />}
  </>;
}
