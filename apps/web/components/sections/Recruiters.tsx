'use client';

import { memo, useEffect, useRef, useState, type RefObject } from 'react';
import Image from 'next/image';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { recruiters } from '@/content/shared';
import styles from './Recruiters.module.css';

const LogoRow = memo(function LogoRow({ offset = false, rowRef, items }: { offset?: boolean; rowRef: RefObject<HTMLDivElement | null>; items: typeof recruiters }) {
  // Three identical sets keep the track wider than the viewport throughout its loop.
  return (
    <div ref={rowRef} className={`${styles.row} ${offset ? styles.offset : ''}`} style={items.length <= 1 ? { animation: 'none' } : undefined}>
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

  useEffect(() => {
    const timer = window.setInterval(() => {
      const animation = leftRowRef.current?.getAnimations()[0];
      if (!animation || typeof animation.currentTime !== 'number') return;
      setActive(Math.floor((animation.currentTime % 12000) / 4000));
    }, 120);
    return () => window.clearInterval(timer);
  }, []);

  const selectGroup = (index: number) => {
    [leftRowRef.current, rightRowRef.current].forEach((row) => {
      const animation = row?.getAnimations()[0];
      if (animation) animation.currentTime = index * 4000;
    });
    setActive(index);
  };

  return (
    <section className={`${styles.section} ${home ? styles.homeSection : ''}`} aria-labelledby="recruiters-title">
      <div className="container">
        <SectionHeading id="recruiters-title" title={title} align="center" />
      </div>
      <div className={styles.rows}>
        <LogoRow rowRef={leftRowRef} items={items} />
        {items.length > 1 && <LogoRow offset rowRef={rightRowRef} items={items} />}
      </div>
      {items.length > 1 && <div className={styles.controls} role="group" aria-label="Recruiter carousel controls">
        {[0, 1, 2].map((index) => (
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
