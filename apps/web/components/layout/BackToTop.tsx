'use client';

import { useEffect, useState } from 'react';
import styles from './BackToTop.module.css';

export function BackToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let frame = 0;
    const updateVisibility = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        setVisible(window.scrollY > 240);
      });
    };

    updateVisibility();
    window.addEventListener('scroll', updateVisibility, { passive: true });

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', updateVisibility);
    };
  }, []);

  if (!visible) return null;

  return (
    <button
      type="button"
      className={styles.button}
      aria-label="Go to top"
      onClick={() => window.scrollTo({ top: 0, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' })}
    >
      <span className={styles.arrow} aria-hidden="true" />
    </button>
  );
}
