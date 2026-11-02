import Image from 'next/image';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { whyChooseIntro, whyChooseItems, type IconListItem, type ImageAsset } from '@/content/shared';
import { IconList } from './IconList';
import styles from './WhyChoose.module.css';

type WhyChooseProps = {
  id?: string;
  image: ImageAsset;
  items?: IconListItem[];
  /** `page` = full-width Home section; `column` = inside the Academics content column. */
  variant?: 'page' | 'column';
};

export function WhyChoose({ id = 'why-vsm', image, items = whyChooseItems, variant = 'page' }: WhyChooseProps) {
  const headingId = `${id}-title`;
  return (
    <section id={id} className={styles[variant]} aria-labelledby={headingId}>
      <div className={variant === 'page' ? 'container' : undefined}>
        {variant === 'page' ? (
          <SectionHeading id={headingId} eyebrow="Elevating Your Professional Aspirations" title="Why Choose VSM Among PGDM Colleges in Mumbai?" rule>
            <p>{whyChooseIntro}</p>
          </SectionHeading>
        ) : (
          <SectionHeading id={headingId} title="Why Choose VSM" />
        )}
        <div className={styles.body}>
          <IconList items={items} className={styles.list} />
          <div className={styles.media}>
            <Image
              src={image.src}
              alt={image.alt}
              width={image.width}
              height={image.height}
              sizes={variant === 'page' ? '(max-width: 1023px) 100vw, 45vw' : '(max-width: 1023px) 100vw, 30vw'}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
