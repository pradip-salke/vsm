'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { CarouselDots } from '@/components/ui/CarouselDots';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { internships } from '@/content/shared';
import styles from './Internships.module.css';

export function Internships({ variant = 'default' }: { variant?: 'default' | 'academic' }) {
  const carouselRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);

  useEffect(() => {
    const carousel = carouselRef.current;
    if (!carousel) return;
    const measure = () => carousel.style.setProperty('--carousel-space', `${carousel.clientWidth}px`);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(carousel);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const timer = window.setInterval(() => {
      const animation = trackRef.current?.getAnimations()[0];
      if (!animation || typeof animation.currentTime !== 'number') return;
      setActive(Math.floor((animation.currentTime % 18000) / 6000));
    }, 120);
    return () => window.clearInterval(timer);
  }, []);

  const selectGroup = (index: number) => {
    const animation = trackRef.current?.getAnimations()[0];
    if (animation) animation.currentTime = index * 6000;
    setActive(index);
  };

  return (
    <section className={`${styles.section} ${variant === 'academic' ? styles.academic : ''}`} aria-labelledby="internship-title">
      <div className="container">
        <SectionHeading id="internship-title" title="Summer Internship 2025-27" align="center" />
        <div ref={carouselRef} className={styles.carousel} role="region" aria-roledescription="carousel" aria-label="Summer Internship 2025-27">
          <div className={styles.viewport}>
            <div ref={trackRef} className={styles.track}>
              {[0, 1, 2].map((copy) => (
                <ul key={copy} className={styles.group} role="list" aria-hidden={copy > 0 || undefined}>
                  {internships.map((card, index) => (
                    <li key={`${card.src}-${index}`} className={styles.card}>
                      <Image src={card.src} alt={copy === 0 ? card.alt : ''} width={card.width} height={card.height} sizes="(max-width: 767px) 85vw, 30vw" />
                    </li>
                  ))}
                </ul>
              ))}
            </div>
          </div>
          <div className={styles.controls}>
            <CarouselDots count={3} active={active} onSelect={selectGroup} tone="dark" label="Summer Internship 2025-27" />
          </div>
        </div>
      </div>
    </section>
  );
}
