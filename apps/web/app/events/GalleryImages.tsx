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
          <button className={styles.imageButton} type="button" onClick={() => setActiveGallery(item)} aria-label={`View image: ${item.title}`}>
            <Image className={styles.image} src={item.image.src} alt={item.image.alt} width={item.image.width} height={item.image.height} sizes="(max-width: 599px) 90vw, (max-width: 1023px) 45vw, 30vw" />
          </button>
          {!hideCaptions && <div className={styles.cardBody}><h3>{item.title}</h3></div>}
        </article>
      ))}
    </div>
    {activeGallery && activeImages.length > 0 && <ImageGalleryPopup images={activeImages} title={activeGallery.title} initialIndex={slideshowImages?.length ? items.indexOf(activeGallery) : 0} onClose={() => setActiveGallery(null)} />}
  </>;
}
