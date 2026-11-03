'use client';

import { useEffect, useState, type CSSProperties } from 'react';
import styles from './BackToTop.module.css';

export function BackToTop() {
  const [visible, setVisible] = useState(false);
  const [bottom, setBottom] = useState(24);

  useEffect(() => {
    let frame = 0;
    const updatePosition = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const base = Math.min(24, Math.max(16, window.innerWidth * 0.0125));
        const footer = document.getElementById('site-footer');
        const footerTop = footer?.getBoundingClientRect().top ?? window.innerHeight;
        const footerOffset = footerTop < window.innerHeight ? window.innerHeight - footerTop + base : base;

        setVisible(window.scrollY > 240);
        setBottom((current) => Math.abs(current - footerOffset) < 1 ? current : footerOffset);
      });
    };

    updatePosition();
    window.addEventListener('scroll', updatePosition, { passive: true });
    window.addEventListener('resize', updatePosition);
    const footer = document.getElementById('site-footer');
    const observer = footer && typeof ResizeObserver !== 'undefined' ? new ResizeObserver(updatePosition) : null;
    if (footer) observer?.observe(footer);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', updatePosition);
      window.removeEventListener('resize', updatePosition);
      observer?.disconnect();
    };
  }, []);

  if (!visible) return null;

  const style = { '--back-to-top-bottom': `${bottom}px` } as CSSProperties;
  return (
    <button
      type="button"
      className={styles.button}
      style={style}
      aria-label="Go to top"
      onClick={() => window.scrollTo({ top: 0, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' })}
    >
      <span className={styles.arrow} aria-hidden="true" />
    </button>
  );
}
