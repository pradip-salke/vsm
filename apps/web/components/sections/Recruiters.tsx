'use client';

import { memo, useEffect, useRef, useState, type CSSProperties, type RefObject } from 'react';
import Image from 'next/image';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { recruiters } from '@/content/shared';
import styles from './Recruiters.module.css';

const LogoRow = memo(function LogoRow({ offset = false, rowRef, items, durationMs }: { offset?: boolean; rowRef: RefObject<HTMLDivElement | null>; items: typeof recruiters; durationMs: number }) {
  // Three identical sets keep the track wider than the viewport throughout its loop.
  return (
    <div ref={rowRef} className={`${styles.row} ${offset ? styles.offset : ''}`} style={items.length <= 1 ? { animation: 'none' } : { '--logo-scroll-duration': `${durationMs}ms` } as CSSProperties}>
      {(items.length > 1 ? [0, 1, 2] : [0]).map((copy) => (
        <ul key={copy} className={styles.group} role="list" aria-hidden={copy > 0 || offset || undefined}>
          {items.map((logo, index) => {
            const announced = copy === 0 && !offset;
            return (
              <li key={`${logo.src}-${index}`} className={styles.cell}>
                <Image src={logo.src} alt={announced ? logo.alt : ''} width={logo.width} height={logo.height} sizes="200px" />
              </li>
            );
          })}
        </ul>
      ))}
    </div>
  );
});

export function Recruiters({ home = false, items = recruiters, title = 'Companies Hiring Our PGDM Students' }: { home?: boolean; items?: typeof recruiters; title?: string }) {
  const leftRowRef = useRef<HTMLDivElement>(null);
  const rightRowRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const [visibleCount, setVisibleCount] = useState(1);
  // Keep the same per-logo travel speed as the original five-logo track when CMS items are added.
  const durationMs = Math.max(1, (items.length / recruiters.length) * 12000);
  const dotCount = items.length ? Math.ceil(items.length / visibleCount) : 0;

  useEffect(() => {
    const row = leftRowRef.current;
    const viewport = row?.parentElement;
    if (!row || !viewport) return;

    const updateVisibleCount = () => {
      const firstGroup = row.firstElementChild;
      const firstCell = firstGroup?.firstElementChild as HTMLElement | null;
      const cellWidth = firstCell?.getBoundingClientRect().width ?? 0;
      const nextCount = cellWidth > 0 ? Math.max(1, Math.floor(viewport.clientWidth / cellWidth)) : 1;
      setVisibleCount((current) => current === nextCount ? current : nextCount);
    };

    updateVisibleCount();
    const observer = new ResizeObserver(updateVisibleCount);
    observer.observe(viewport);
    return () => observer.disconnect();
  }, [items.length]);

  useEffect(() => {
    if (dotCount <= 1) {
      setActive(0);
      return;
    }
    const timer = window.setInterval(() => {
      const animation = leftRowRef.current?.getAnimations()[0];
      if (!animation || typeof animation.currentTime !== 'number') return;
      const progress = (animation.currentTime % durationMs) / durationMs;
      setActive(Math.min(dotCount - 1, Math.floor((progress * items.length) / visibleCount)));
    }, 120);
    return () => window.clearInterval(timer);
  }, [durationMs, dotCount, items.length, visibleCount]);

  const selectGroup = (index: number) => {
    [leftRowRef.current, rightRowRef.current].forEach((row) => {
      const animation = row?.getAnimations()[0];
      if (animation) animation.currentTime = ((index * visibleCount) / items.length) * durationMs;
    });
    setActive(index);
  };

  return (
    <section className={`${styles.section} ${home ? styles.homeSection : ''}`} aria-labelledby="recruiters-title">
      <div className="container">
        <SectionHeading id="recruiters-title" title={title} align="center" />
      </div>
      <div className={styles.rows}>
        <LogoRow rowRef={leftRowRef} items={items} durationMs={durationMs} />
        {items.length > 1 && <LogoRow offset rowRef={rightRowRef} items={items} durationMs={durationMs} />}
      </div>
      {dotCount > 1 && <div className={styles.controls} role="group" aria-label="Recruiter carousel controls">
        {Array.from({ length: dotCount }, (_, index) => index).map((index) => (
          <button
            key={index}
            type="button"
            className={`${styles.control} ${active === index ? styles.activeControl : ''}`}
            aria-label={`Show logo group ${index + 1}`}
            aria-current={active === index ? 'true' : undefined}
            onClick={() => selectGroup(index)}
          />
        ))}
      </div>}
    </section>
  );
}
