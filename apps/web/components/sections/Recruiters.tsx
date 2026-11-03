'use client';

import { memo } from 'react';
import Image from 'next/image';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { recruiters } from '@/content/shared';
import styles from './Recruiters.module.css';

const LogoRow = memo(function LogoRow({ offset = false }: { offset?: boolean }) {
  // Three identical sets keep the track wider than the viewport throughout its loop.
  return (
    <div className={`${styles.row} ${offset ? styles.offset : ''}`}>
      {[0, 1, 2].map((copy) => (
        <ul key={copy} className={styles.group} role="list" aria-hidden={copy > 0 || offset || undefined}>
          {recruiters.map((logo, index) => {
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

export function Recruiters() {
  return (
    <section className={styles.section} aria-labelledby="recruiters-title">
      <div className="container">
        <SectionHeading id="recruiters-title" title="Companies Hiring Our PGDM Students" align="center" />
      </div>
      <div className={styles.rows}>
        <LogoRow />
        <LogoRow offset />
      </div>
      <div className={styles.controls} aria-hidden="true">
        <span className={styles.control} />
        <span className={styles.control} />
        <span className={styles.control} />
      </div>
    </section>
  );
}
