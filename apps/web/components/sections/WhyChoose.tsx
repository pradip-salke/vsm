import Image from 'next/image';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { whyChooseIntro, whyChooseItems, type IconListItem, type ImageAsset } from '@/content/shared';
import { IconList } from './IconList';
import styles from './WhyChoose.module.css';
import type { HomeHeading } from '@vsmedu/contracts/home';

type WhyChooseProps = {
  id?: string;
  image: ImageAsset;
  items?: IconListItem[];
  /** `page` = full-width Home section; `column` = inside the Academics content column. */
  variant?: 'page' | 'column';
  heading?: HomeHeading;
};

export function WhyChoose({ id = 'why-vsm', image, items = whyChooseItems, variant = 'page', heading }: WhyChooseProps) {
  const headingId = `${id}-title`;
  return (
    <section id={id} className={styles[variant]} aria-labelledby={headingId}>
      <div className={variant === 'page' ? 'container' : undefined}>
        {variant === 'page' ? (
          <SectionHeading id={headingId} eyebrow={heading?.eyebrow ?? 'Elevating Your Professional Aspirations'} title={heading?.title ?? 'Why Choose VSM Among PGDM Colleges in Mumbai?'} rule>
            <p>{heading?.description ?? whyChooseIntro}</p>
          </SectionHeading>
        ) : (
          <SectionHeading id={headingId} title={heading?.title ?? 'Why Choose VSM'} />
        )}
        <div className={styles.body}>
          {(variant === 'page' ? items.length > 6 : items.length > 5) ? (
            <div className={styles.scrollList} tabIndex={0} role="region" aria-label="Why Choose VSM benefits">
              <IconList items={items} className={styles.list} />
            </div>
          ) : <IconList items={items} className={styles.list} />}
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
