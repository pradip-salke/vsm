import Image from 'next/image';
import { Link } from '@/components/navigation/Link';
import { Fragment } from 'react';
import { Icon } from '@/components/ui/Icon';
import { icons } from '@/components/ui/icons';
import type { CSSProperties, ReactNode } from 'react';
import { Carousel } from '@/components/ui/Carousel';
import type { HeroSlide } from '@/content/types';
import { heroSlides } from '@/content/home';
import styles from './PageHero.module.css';

type Crumb = { label: string; href?: string };

type PageHeroProps = {
  slides: HeroSlide[];
  actions: ReactNode;
  breadcrumb?: Crumb[];
  className?: string;
  /** `home` = 820px slider, `inner` = 559px page banner. */
  size?: 'home' | 'inner';
};

export function PageHero({ slides, actions, breadcrumb, size = 'home', className }: PageHeroProps) {
  // Inner pages have one copy block, but the banner still needs to behave as
  // the same three-image carousel shown in the shared hero design.
  const bannerSlides = size === 'inner' && slides.length === 1
    ? [slides[0], ...heroSlides.slice(1).map(({ image, imagePosition, mobileImagePosition }) => ({ ...slides[0], image, imagePosition, mobileImagePosition }))]
    : slides;

  const rendered = bannerSlides.map((slide, index) => {
    const Heading = index === 0 ? 'h1' : 'p';
    return (
      <div
        key={slide.title + index}
        className={styles.slide}
        style={{
          '--hero-image-position': slide.imagePosition ?? '70% 100%',
          '--hero-image-position-mobile': slide.mobileImagePosition ?? '78% 50%',
        } as CSSProperties}
      >
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
                {breadcrumb.map((crumb, index) => (
                  <Fragment key={`${crumb.label}-${index}`}>
                    {index > 0 && (
                      <li className={styles.separator} aria-hidden="true">
                        <Icon src={icons.chevronDown} className={styles.chevron} />
                      </li>
                    )}
                    <li>
                      {crumb.href ? <Link href={crumb.href}>{crumb.label}</Link> : <span aria-current="page">{crumb.label}</span>}
                    </li>
                  </Fragment>
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
    <section className={`${styles.hero} ${styles[size]}${className ? ` ${className}` : ''}`} aria-label="Introduction">
      {rendered.length > 1 ? (
        <Carousel label="Highlights" slides={rendered} dotsPlacement="overlay" dotsTone={size === 'home' ? 'dark' : 'light'} autoplayMs={6000} className={styles.carousel} />
      ) : (
        <>
          {rendered[0]}
          {size === 'inner' && <div className={styles.singleDots} aria-hidden="true"><span data-active /><span /><span /></div>}
        </>
      )}
    </section>
  );
}
