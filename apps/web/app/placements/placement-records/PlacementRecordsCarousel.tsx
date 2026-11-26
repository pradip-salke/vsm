'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { CarouselDots } from '@/components/ui/CarouselDots';
import styles from './PlacementRecordsCarousel.module.css';

type PlacementRecord = {
  src: string;
  alt: string;
  width: number;
  height: number;
};

export function PlacementRecordsCarousel({ records }: { records: PlacementRecord[] }) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const slidesRef = useRef<(HTMLAnchorElement | null)[]>([]);
  const [active, setActive] = useState(0);
  const [physicalIndex, setPhysicalIndex] = useState(records.length);
  const [trackOffset, setTrackOffset] = useState(0);
  const [noTransition, setNoTransition] = useState(false);

  const moveTo = useCallback((index: number, logicalIndex = index % records.length) => {
    const slide = slidesRef.current[index];
    if (!slide) return;
    setPhysicalIndex(index);
    setTrackOffset(slide.offsetLeft);
    setActive(logicalIndex);
  }, [records.length]);

  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;
    const measure = () => {
      const slide = slidesRef.current[physicalIndex];
      if (slide) setTrackOffset(slide.offsetLeft);
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(viewport);
    return () => observer.disconnect();
  }, [physicalIndex]);

  useEffect(() => {
    if (records.length < 2) return;
    const timer = window.setInterval(() => {
      if (active === records.length - 1) {
        moveTo(records.length * 2, 0);
      } else {
        moveTo(records.length + active + 1, active + 1);
      }
    }, 3500);
    return () => window.clearInterval(timer);
  }, [active, moveTo, records.length]);

  const handleTransitionEnd = () => {
    if (physicalIndex !== records.length * 2) return;
    setNoTransition(true);
    moveTo(records.length, 0);
    requestAnimationFrame(() => setNoTransition(false));
  };

  const repeatedRecords = [...records, ...records, ...records];

  return (
    <div
      className={styles.carousel}
      role="region"
      aria-roledescription="carousel"
      aria-label="Summer Internship 2025–27 placement records"
    >
      <div ref={viewportRef} className={styles.viewport}>
        <div
          className={`${styles.track} ${noTransition ? styles.noTransition : ''}`}
          style={{ transform: `translateX(-${trackOffset}px)` }}
          onTransitionEnd={handleTransitionEnd}
        >
          {repeatedRecords.map((record, index) => {
            const copy = Math.floor(index / records.length);
            const originalIndex = index % records.length;
            const isDuplicate = copy !== 1;
            return (
              <a
                key={`${copy}-${record.src}`}
                ref={(element) => { slidesRef.current[index] = element; }}
                className={styles.slide}
                href={record.src}
                target="_blank"
                rel="noreferrer"
                aria-hidden={isDuplicate || undefined}
                tabIndex={isDuplicate ? -1 : undefined}
                aria-label={`Open placement record ${originalIndex + 1} in a new tab`}
              >
                <Image
                  src={record.src}
                  alt={isDuplicate ? '' : record.alt}
                  width={record.width}
                  height={record.height}
                  sizes="(max-width: 599px) 90vw, (max-width: 900px) 45vw, 30vw"
                />
              </a>
            );
          })}
        </div>
      </div>
      {records.length > 1 && (
        <div className={styles.controls}>
          <CarouselDots
            count={records.length}
            active={active}
            onSelect={(index) => moveTo(records.length + index, index)}
            tone="dark"
            label="Summer Internship 2025–27"
          />
        </div>
      )}
    </div>
  );
}
