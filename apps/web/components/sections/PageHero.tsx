import Image from 'next/image';
import Link from 'next/link';
import type { ReactNode } from 'react';
import { Carousel } from '@/components/ui/Carousel';
import type { HeroSlide } from '@/content/types';
import styles from './PageHero.module.css';

type Crumb = { label: string; href?: string };

type PageHeroProps = {
  slides: HeroSlide[];
  actions: ReactNode;
  breadcrumb?: Crumb[];
  /** `home` = 820px slider, `inner` = 559px page banner. */
  size?: 'home' | 'inner';
};

export function PageHero({ slides, actions, breadcrumb, size = 'home' }: PageHeroProps) {
  const rendered = slides.map((slide, index) => {
    const Heading = index === 0 ? 'h1' : 'p';
    return (
      <div key={slide.title + index} className={styles.slide}>
        <Image
          className={styles.image}
          src={slide.image.src}
          alt={slide.image.alt}
          width={slide.image.width}
          height={slide.image.height}
          sizes="100vw"
          priority={index === 0}
          loading={index === 0 ? undefined : 'lazy'}
        />
        <div className={`container ${styles.content}`}>
          {breadcrumb && (
            <nav aria-label="Breadcrumb" className={styles.breadcrumb}>
              <ol role="list">
                {breadcrumb.map((crumb) => (
                  <li key={crumb.label}>
                    {crumb.href ? <Link href={crumb.href}>{crumb.label}</Link> : <span aria-current="page">{crumb.label}</span>}
                  </li>
                ))}
              </ol>
            </nav>
          )}
          <div className={styles.copy}>
            <Heading className={styles.title}>{slide.title}</Heading>
            <p className={styles.subtitle}>{slide.subtitle}</p>
            <div className={styles.actions}>{actions}</div>
          </div>
        </div>
      </div>
    );
  });

  return (
    <section className={`${styles.hero} ${styles[size]}`} aria-label="Introduction">
      {rendered.length > 1 ? (
        <Carousel label="Highlights" slides={rendered} dotsPlacement="overlay" autoplayMs={6000} className={styles.carousel} />
      ) : (
        rendered[0]
      )}
    </section>
  );
}
