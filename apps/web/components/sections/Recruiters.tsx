'use client';

import { useEffect, useRef, useState, type CSSProperties } from 'react';
import Image from 'next/image';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { recruiters } from '@/content/shared';
import styles from './Recruiters.module.css';

/** Each group repeats the logos so one group is wider than a 1920px viewport. */
const groupLogos = [...recruiters, ...recruiters];

function LogoRow({ offset = false }: { offset?: boolean }) {
  // Rendered twice so the CSS loop is seamless; the copy is hidden from assistive tech.
  return (
    <div className={`${styles.row} ${offset ? styles.offset : ''}`}>
      {[0, 1].map((copy) => (
        <ul key={copy} className={styles.group} role="list" aria-hidden={copy === 1 || offset || undefined}>
          {groupLogos.map((logo, index) => {
            const announced = copy === 0 && !offset && index < recruiters.length;
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
}

export function Recruiters() {
  const [activePage, setActivePage] = useState(0);
  const pausedRef = useRef(false);
  const pageStyle = { '--page-offset': `${activePage * 30}vw` } as CSSProperties;

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const timer = window.setInterval(() => {
      if (!pausedRef.current) {
        setActivePage((page) => (page + 1) % 3);
      }
    }, 6000);
    return () => window.clearInterval(timer);
  }, []);

  return (
    <section
      className={styles.section}
      aria-labelledby="recruiters-title"
      onFocusCapture={() => { pausedRef.current = true; }}
      onBlurCapture={() => { pausedRef.current = false; }}
    >
      <div className="container">
        <SectionHeading id="recruiters-title" title="Companies Hiring Our PGDM Students" align="center" />
      </div>
      <div className={styles.rows} style={pageStyle}>
        <LogoRow />
        <LogoRow offset />
      </div>
      <div className={styles.controls} role="group" aria-label="Company logo carousel controls">
        {[0, 1, 2].map((page) => (
          <button
            key={page}
            type="button"
            className={styles.control}
            aria-label={`Show company logos, page ${page + 1}`}
            aria-current={page === activePage ? 'true' : undefined}
            onClick={() => setActivePage(page)}
          />
        ))}
      </div>
    </section>
  );
}
