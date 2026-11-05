import Image from 'next/image';
import { Link } from '@/components/navigation/Link';
import { Carousel } from '@/components/ui/Carousel';
import { Icon } from '@/components/ui/Icon';
import { icons } from '@/components/ui/icons';
import { SectionHeading } from '@/components/ui/SectionHeading';
import type { MediaItem } from '@/content/types';
import styles from './MediaCarousel.module.css';

type MediaCarouselProps = {
  id: string;
  title: string;
  items: MediaItem[];
  /** Slide geometry in Figma px: Events 688×454, Life 535×426, Videos 790×454. */
  layout: 'events' | 'life' | 'video';
  /** `page` = centred section; `column` = left-aligned inside the Academics column. */
  variant?: 'page' | 'column';
  uppercase?: boolean;
  /** Decorative play badge on video stills. */
  play?: boolean;
  background?: 'page' | 'cream';
  homeEventSpacing?: boolean;
};

export function MediaCarousel({
  id,
  title,
  items,
  layout,
  variant = 'page',
  uppercase = false,
  play = false,
  background = 'page',
  homeEventSpacing = false,
}: MediaCarouselProps) {
  const headingId = `${id}-title`;
  const slides = items.map((item, index) => {
    const media = (
      <>
        <span className={styles.frame}>
          <Image
            src={item.image.src}
            alt={item.image.alt}
            width={item.image.width}
            height={item.image.height}
            sizes={variant === 'page' ? '(max-width: 767px) 85vw, 36vw' : '(max-width: 767px) 85vw, 42vw'}
          />
          {play && (
            <span className={styles.play} aria-hidden>
              <Icon src={icons.playSmall} size="100%" />
            </span>
          )}
        </span>
        {item.caption && <span className={styles.caption}>{item.caption}</span>}
      </>
    );
    return item.href ? (
      <Link key={index} href={item.href} className={styles.item}>
        {media}
      </Link>
    ) : (
      <div key={index} className={styles.item}>
        {media}
      </div>
    );
  });

  return (
    <section
      id={id}
      className={[styles[variant], styles[layout], styles[`bg-${background}`], homeEventSpacing ? styles.homeEventSpacing : ''].filter(Boolean).join(' ')}
      aria-labelledby={headingId}
    >
      <div className={variant === 'page' ? 'container' : undefined}>
        <SectionHeading id={headingId} title={title} align={variant === 'page' ? 'center' : 'start'} uppercase={uppercase} />
        <Carousel
          label={title}
          slides={slides}
          className={styles.carousel}
          bleed={layout !== 'life' || variant === 'column'}
          dotsAlign={variant === 'page' ? 'center' : 'start'}
        />
      </div>
    </section>
  );
}
