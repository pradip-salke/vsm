'use client';

import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { CarouselDots } from './CarouselDots';
import { Icon } from './Icon';
import { icons } from './icons';
import styles from './Carousel.module.css';

type CarouselProps = {
  label: string;
  slides: ReactNode[];
  /** Sets `--slide-width` / `--slide-gap` and any per-carousel overrides. */
  className?: string;
  align?: 'start' | 'center';
  dotsTone?: 'dark' | 'light';
  dotsAlign?: 'start' | 'center';
  /** Let the track run past the container's right edge (Academics column / Events row). */
  bleed?: boolean;
  /** `overlay` pins the dots inside the bottom of the slides (hero banners). */
  dotsPlacement?: 'below' | 'overlay';
  /** Use the first slide's content height for every slide's information card. */
  cardHeightFromFirst?: boolean;
  autoplayMs?: number;
  navigationButtons?: boolean;
};

/**
 * Native scroll-snap carousel with one dot per slide (as in Figma, even when
 * every slide fits). Slides that share a clamped scroll position keep the
 * dot that was picked.
 */
export function Carousel({
  label,
  slides,
  className,
  align = 'start',
  dotsTone = 'dark',
  dotsAlign = 'center',
  bleed = false,
  dotsPlacement = 'below',
  cardHeightFromFirst = false,
  autoplayMs = 6000,
  navigationButtons = false,
}: CarouselProps) {
  const trackRef = useRef<HTMLUListElement>(null);
  const [positions, setPositions] = useState<number[]>([]);
  const [active, setActive] = useState(0);
  const pausedRef = useRef(false);
  const targetRef = useRef<number | null>(null);

  const measure = useCallback(() => {
    const track = trackRef.current;
    if (!track) return;
    const max = track.scrollWidth - track.clientWidth;
    const padStart = parseFloat(getComputedStyle(track).scrollPaddingInlineStart) || 0;
    const next = Array.from(track.children as HTMLCollectionOf<HTMLElement>).map((slide) => {
      const target =
        align === 'center'
          ? slide.offsetLeft + slide.offsetWidth / 2 - track.clientWidth / 2
          : slide.offsetLeft - padStart;
      return Math.round(Math.min(Math.max(target, 0), Math.max(max, 0)));
    });
    setPositions((current) =>
      current.length === next.length && current.every((position, index) => position === next[index]) ? current : next,
    );
  }, [align]);

  const syncActive = useCallback(() => {
    const track = trackRef.current;
    if (!track || positions.length === 0) return;
    const offset = (index: number) => Math.abs(positions[index] - track.scrollLeft);
    const target = targetRef.current;
    if (target !== null) {
      if (offset(target) >= 4) return;
      targetRef.current = null;
    }
    let nearest = 0;
    positions.forEach((_, index) => {
      if (offset(index) < offset(nearest)) nearest = index;
    });
    setActive((current) =>
      positions[current] !== undefined && Math.abs(positions[current] - positions[nearest]) < 4 ? current : nearest,
    );
  }, [positions]);

  useEffect(() => {
    measure();
    const track = trackRef.current;
    if (!track) return;
    const observer = new ResizeObserver(measure);
    observer.observe(track);
    return () => observer.disconnect();
  }, [measure, slides.length]);

  useEffect(() => {
    if (!cardHeightFromFirst) return;
    const track = trackRef.current;
    const firstContent = track?.children[0]?.querySelector<HTMLElement>('[data-card-height-source]');
    const carousel = track?.parentElement;
    if (!firstContent || !carousel) return;

    const updateHeight = () => {
      const card = firstContent.parentElement;
      if (!card) return;
      const styles = getComputedStyle(card);
      const padding = parseFloat(styles.paddingTop) + parseFloat(styles.paddingBottom);
      carousel.style.setProperty('--testimonial-card-height', `${firstContent.getBoundingClientRect().height + padding}px`);
    };
    updateHeight();
    const observer = new ResizeObserver(updateHeight);
    observer.observe(firstContent);
    return () => {
      observer.disconnect();
      carousel.style.removeProperty('--testimonial-card-height');
    };
  }, [cardHeightFromFirst, slides.length]);

  useEffect(() => {
    syncActive();
    const track = trackRef.current;
    if (!track) return;
    let frame = 0;
    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(syncActive);
    };
    const release = () => {
      targetRef.current = null;
    };
    const userInput = ['pointerdown', 'wheel', 'touchstart', 'keydown'] as const;
    track.addEventListener('scroll', onScroll, { passive: true });
    userInput.forEach((type) => track.addEventListener(type, release, { passive: true }));
    return () => {
      track.removeEventListener('scroll', onScroll);
      userInput.forEach((type) => track.removeEventListener(type, release));
      cancelAnimationFrame(frame);
    };
  }, [syncActive]);

  const goTo = useCallback(
    (index: number) => {
      const track = trackRef.current;
      if (!track || positions[index] === undefined) return;
      targetRef.current = Math.abs(positions[index] - track.scrollLeft) < 4 ? null : index;
      setActive(index);
      track.scrollTo({ left: positions[index], behavior: 'smooth' });
    },
    [positions],
  );

  useEffect(() => {
    if (!autoplayMs || positions.length < 2) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const timer = window.setInterval(() => {
      if (!pausedRef.current) goTo((active + 1) % positions.length);
    }, autoplayMs);
    return () => window.clearInterval(timer);
  }, [autoplayMs, positions.length, active, goTo]);

  const pause = () => {
    pausedRef.current = true;
  };
  const resume = () => {
    pausedRef.current = false;
  };

  return (
    <div
      className={[styles.carousel, bleed && styles.bleed, dotsPlacement === 'overlay' && styles.overlay, className]
        .filter(Boolean)
        .join(' ')}
      role="region"
      aria-roledescription="carousel"
      aria-label={label}
      onFocusCapture={pause}
      onBlurCapture={resume}
    >
      <ul ref={trackRef} className={`${styles.track} ${align === 'center' ? styles.centered : ''}`} role="list" tabIndex={0}>
        {slides.map((slide, index) => (
          <li
            key={index}
            className={styles.slide}
            data-active={align === 'center' && active === index ? '' : undefined}
            aria-roledescription="slide"
            aria-label={`${index + 1} of ${slides.length}`}
          >
            {slide}
          </li>
        ))}
      </ul>
      {navigationButtons && positions.length > 1 && (
        <div className={styles.navigation}>
          <button type="button" aria-label={`Previous ${label} slide`} onClick={() => goTo(Math.max(0, active - 1))} disabled={active === 0}>
            <Icon src={icons.chevronDown} className={styles.previousIcon} />
          </button>
          <button type="button" aria-label={`Next ${label} slide`} onClick={() => goTo(Math.min(positions.length - 1, active + 1))} disabled={active === positions.length - 1}>
            <Icon src={icons.chevronDown} className={styles.nextIcon} />
          </button>
        </div>
      )}
      {positions.length > 1 && (
        <div className={`${styles.controls} ${dotsAlign === 'center' ? styles.controlsCentered : styles.controlsStart}`}>
          <CarouselDots count={positions.length} active={active} onSelect={goTo} tone={dotsTone} align={dotsAlign} label={label} />
        </div>
      )}
    </div>
  );
}
