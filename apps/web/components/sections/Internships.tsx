'use client';

import { useEffect, useRef, useState, type CSSProperties } from 'react';
import Image from 'next/image';
import { CarouselDots } from '@/components/ui/CarouselDots';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { internships, type ImageAsset } from '@/content/shared';
import styles from './Internships.module.css';

export function Internships({ variant = 'default', items = internships, title = 'Summer Internship 2025-27' }: { variant?: 'default' | 'academic'; items?: (ImageAsset & { enabled?: boolean })[]; title?: string }) {
  const carouselRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const [visibleCount, setVisibleCount] = useState(1);
  // A lone CMS slide is repeated to fill the same three-card track used by
  // the carousel animation, keeping the layout and controls usable.
  const displayItems = items.length === 1 ? [items[0], items[0], items[0]] : items;
  const loopDotMode = items.length > 0 && items.length <= visibleCount;
  // Preserve the existing pace as the CMS adds or removes internship slides.
  const durationMs = Math.max(1, (items.length / internships.length) * 18000);
  const dotCount = loopDotMode ? 3 : items.length ? Math.ceil(items.length / visibleCount) : 0;

  useEffect(() => {
    const carousel = carouselRef.current;
    if (!carousel) return;
    const measure = () => {
      carousel.style.setProperty('--carousel-space', `${carousel.clientWidth}px`);
      const firstGroup = trackRef.current?.firstElementChild;
      const firstCard = firstGroup?.firstElementChild as HTMLElement | null;
      const cardWidth = firstCard?.getBoundingClientRect().width ?? 0;
      const nextCount = cardWidth > 0 ? Math.max(1, Math.floor(carousel.clientWidth / cardWidth)) : 1;
      setVisibleCount((current) => current === nextCount ? current : nextCount);
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(carousel);
    return () => observer.disconnect();
  }, [items.length]);

  useEffect(() => {
    if (dotCount <= 1) {
      setActive(0);
      return;
    }
    const timer = window.setInterval(() => {
      const animation = trackRef.current?.getAnimations()[0];
      if (!animation || typeof animation.currentTime !== 'number') return;
      const progress = (animation.currentTime % durationMs) / durationMs;
      const nextActive = loopDotMode
        ? Math.floor(progress * dotCount)
        : Math.floor((progress * items.length) / visibleCount);
      setActive(Math.min(dotCount - 1, nextActive));
    }, 120);
    return () => window.clearInterval(timer);
  }, [durationMs, dotCount, items.length, loopDotMode, visibleCount]);

  const selectGroup = (index: number) => {
    const animation = trackRef.current?.getAnimations()[0];
    if (animation) {
      animation.currentTime = loopDotMode
        ? (index / dotCount) * durationMs
        : ((index * visibleCount) / items.length) * durationMs;
    }
    setActive(index);
  };

  return (
    <section className={`${styles.section} ${variant === 'academic' ? styles.academic : ''}`} aria-labelledby="internship-title">
      <div className="container">
        <SectionHeading id="internship-title" title={title} align="center" />
        <div ref={carouselRef} className={styles.carousel} role="region" aria-roledescription="carousel" aria-label="Summer Internship 2025-27">
          <div className={styles.viewport}>
            <div ref={trackRef} className={styles.track} style={items.length === 0 ? { animation: 'none' } : { '--internship-scroll-duration': `${durationMs}ms` } as CSSProperties}>
              {(items.length > 0 ? [0, 1, 2] : [0]).map((copy) => (
                <ul key={copy} className={styles.group} role="list" aria-hidden={copy > 0 || undefined}>
                  {displayItems.map((card, index) => (
                    <li key={`${card.src}-${index}`} className={styles.card}>
                      <Image src={card.src} alt={copy === 0 && (items.length !== 1 || index === 0) ? card.alt : ''} width={card.width} height={card.height} sizes="(max-width: 767px) 85vw, 30vw" />
                    </li>
                  ))}
                </ul>
              ))}
            </div>
          </div>
          {dotCount > 1 && <div className={styles.controls}>
            <CarouselDots count={dotCount} active={active} onSelect={selectGroup} tone="dark" label="Summer Internship 2025-27" />
          </div>}
        </div>
      </div>
    </section>
  );
}
