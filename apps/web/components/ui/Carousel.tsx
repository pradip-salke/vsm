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
  /** Clone edge slides and normalize scroll position for a seamless loop. */
  infiniteLoop?: boolean;
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
  infiniteLoop = false,
}: CarouselProps) {
  const trackRef = useRef<HTMLUListElement>(null);
  const [positions, setPositions] = useState<number[]>([]);
  const [active, setActive] = useState(0);
  const pausedRef = useRef(false);
  const targetRef = useRef<number | null>(null);
  const settleTimerRef = useRef<number | null>(null);
  const initializedLoopRef = useRef(false);
  const looping = infiniteLoop && slides.length > 1;
  const physicalSlides = looping ? [slides[slides.length - 1], ...slides, slides[0]] : slides;

  const measure = useCallback(() => {
    const track = trackRef.current;
    if (!track) return;
    const max = track.scrollWidth - track.clientWidth;
    const padStart = parseFloat(getComputedStyle(track).scrollPaddingInlineStart) || 0;
    const physicalPositions = Array.from(track.children as HTMLCollectionOf<HTMLElement>).map((slide) => {
      const target =
        align === 'center'
          ? slide.offsetLeft + slide.offsetWidth / 2 - track.clientWidth / 2
          : slide.offsetLeft - padStart;
      return Math.round(Math.min(Math.max(target, 0), Math.max(max, 0)));
    });
    const next = looping ? physicalPositions.slice(1, -1) : physicalPositions;
    setPositions((current) =>
      current.length === next.length && current.every((position, index) => position === next[index]) ? current : next,
    );
  }, [align, looping]);

  const syncActive = useCallback(() => {
    const track = trackRef.current;
    if (!track || positions.length === 0) return;
    const physical = Array.from(track.children as HTMLCollectionOf<HTMLElement>);
    const padStart = parseFloat(getComputedStyle(track).scrollPaddingInlineStart) || 0;
    const physicalPositions = physical.map((slide) => {
      const target = align === 'center'
        ? slide.offsetLeft + slide.offsetWidth / 2 - track.clientWidth / 2
        : slide.offsetLeft - padStart;
      return Math.round(Math.min(Math.max(target, 0), Math.max(track.scrollWidth - track.clientWidth, 0)));
    });
    const offset = (index: number) => Math.abs(physicalPositions[index] - track.scrollLeft);
    const target = targetRef.current;
    if (target !== null) {
      if (offset(looping ? target + 1 : target) >= 4) return;
      targetRef.current = null;
    }
    let nearestPhysical = 0;
    physicalPositions.forEach((_, index) => {
      if (offset(index) < offset(nearestPhysical)) nearestPhysical = index;
    });
    const nearest = looping
      ? nearestPhysical === 0 ? slides.length - 1 : nearestPhysical === slides.length + 1 ? 0 : nearestPhysical - 1
      : nearestPhysical;
    setActive((current) =>
      positions[current] !== undefined && Math.abs(positions[current] - positions[nearest]) < 4 ? current : nearest,
    );
  }, [align, looping, positions, slides.length]);

  useEffect(() => {
    measure();
    const track = trackRef.current;
    if (!track) return;
    const observer = new ResizeObserver(measure);
    observer.observe(track);
    return () => observer.disconnect();
  }, [measure, slides.length]);

  useEffect(() => {
    if (!looping || initializedLoopRef.current || positions.length === 0) return;
    const track = trackRef.current;
    if (!track) return;
    track.scrollLeft = positions[0];
    initializedLoopRef.current = true;
  }, [looping, positions]);

  useEffect(() => {
    if (!cardHeightFromFirst) return;
    const track = trackRef.current;
    const firstContent = track?.children[looping ? 1 : 0]?.querySelector<HTMLElement>('[data-card-height-source]');
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
  }, [cardHeightFromFirst, looping, slides.length]);

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
    const normalizeLoopEdge = () => {
      if (!looping || !track.children.length) return;
      const children = Array.from(track.children as HTMLCollectionOf<HTMLElement>);
      const nearest = children.reduce((best, slide, index) => {
        const padStart = parseFloat(getComputedStyle(track).scrollPaddingInlineStart) || 0;
        const target = align === 'center'
          ? slide.offsetLeft + slide.offsetWidth / 2 - track.clientWidth / 2
          : slide.offsetLeft - padStart;
        const distance = Math.abs(target - track.scrollLeft);
        return distance < best.distance ? { index, target, distance } : best;
      }, { index: 0, target: 0, distance: Number.POSITIVE_INFINITY });
      if (nearest.index === 0 || nearest.index === children.length - 1) {
        const realIndex = nearest.index === 0 ? slides.length : 1;
        const real = children[realIndex];
        if (real) {
          const padStart = parseFloat(getComputedStyle(track).scrollPaddingInlineStart) || 0;
          const target = align === 'center'
            ? real.offsetLeft + real.offsetWidth / 2 - track.clientWidth / 2
            : real.offsetLeft - padStart;
          track.scrollLeft = target;
        }
      }
    };
    const userInput = ['pointerdown', 'wheel', 'touchstart', 'keydown'] as const;
    track.addEventListener('scroll', onScroll, { passive: true });
    const onScrollSettle = () => {
      if (settleTimerRef.current !== null) window.clearTimeout(settleTimerRef.current);
      settleTimerRef.current = window.setTimeout(normalizeLoopEdge, 120);
    };
    track.addEventListener('scroll', onScrollSettle, { passive: true });
    userInput.forEach((type) => track.addEventListener(type, release, { passive: true }));
    return () => {
      track.removeEventListener('scroll', onScroll);
      track.removeEventListener('scroll', onScrollSettle);
      userInput.forEach((type) => track.removeEventListener(type, release));
      cancelAnimationFrame(frame);
      if (settleTimerRef.current !== null) window.clearTimeout(settleTimerRef.current);
    };
  }, [align, looping, slides.length, syncActive]);

  const goTo = useCallback(
    (index: number) => {
      const track = trackRef.current;
      if (!track || positions[index] === undefined) return;
      let targetPosition = positions[index];
      if (looping && slides.length > 1 && active === slides.length - 1 && index === 0) {
        const clone = track.children[slides.length + 1] as HTMLElement | undefined;
        if (clone) targetPosition = align === 'center'
          ? clone.offsetLeft + clone.offsetWidth / 2 - track.clientWidth / 2
          : clone.offsetLeft - (parseFloat(getComputedStyle(track).scrollPaddingInlineStart) || 0);
      } else if (looping && slides.length > 1 && active === 0 && index === slides.length - 1) {
        const clone = track.children[0] as HTMLElement | undefined;
        if (clone) targetPosition = align === 'center'
          ? clone.offsetLeft + clone.offsetWidth / 2 - track.clientWidth / 2
          : clone.offsetLeft - (parseFloat(getComputedStyle(track).scrollPaddingInlineStart) || 0);
      }
      targetRef.current = Math.abs(targetPosition - track.scrollLeft) < 4 ? null : index;
      setActive(index);
      track.scrollTo({ left: targetPosition, behavior: 'smooth' });
    },
    [active, align, looping, positions, slides.length],
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
        {physicalSlides.map((slide, physicalIndex) => {
          const clone = looping && (physicalIndex === 0 || physicalIndex === physicalSlides.length - 1);
          const originalIndex = looping ? physicalIndex - 1 : physicalIndex;
          const normalizedIndex = originalIndex < 0 ? slides.length - 1 : originalIndex >= slides.length ? 0 : originalIndex;
          return <li
            key={`${clone ? 'clone' : 'slide'}-${normalizedIndex}`}
            className={styles.slide}
            data-active={!clone && align === 'center' && active === normalizedIndex ? '' : undefined}
            aria-hidden={clone || undefined}
            aria-roledescription="slide"
            aria-label={`${normalizedIndex + 1} of ${slides.length}`}
          >
            {slide}
          </li>;
        })}
      </ul>
      {navigationButtons && positions.length > 1 && (
        <div className={styles.navigation}>
          <button type="button" aria-label={`Previous ${label} slide`} onClick={() => goTo(looping ? (active - 1 + positions.length) % positions.length : Math.max(0, active - 1))} disabled={!looping && active === 0}>
            <Icon src={icons.chevronDown} className={styles.previousIcon} />
          </button>
          <button type="button" aria-label={`Next ${label} slide`} onClick={() => goTo(looping ? (active + 1) % positions.length : Math.min(positions.length - 1, active + 1))} disabled={!looping && active === positions.length - 1}>
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
