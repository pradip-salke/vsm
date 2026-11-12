import Image from 'next/image';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { icons } from '@/components/ui/icons';
import { SectionHeading } from '@/components/ui/SectionHeading';
import styles from './PgdmProgram.module.css';
import { homeDefaults, type HomeContent } from '@vsmedu/contracts/home';

export function PgdmProgram({ content = homeDefaults.program }: { content?: HomeContent['program'] }) {
  const pgdmProgram = content;
  const { poster } = pgdmProgram;
  return (
    <section className={styles.section} aria-labelledby="pgdm-title">
      <div className={styles.media}>
        <Image src={poster.src} alt={poster.alt} width={poster.width} height={poster.height} sizes="(max-width: 1023px) 100vw, 50vw" />
        <span className={styles.play} aria-hidden>
          <Icon src={icons.play} size="100%" />
        </span>
      </div>
      <div className={styles.content}>
        <SectionHeading id="pgdm-title" eyebrow={content.eyebrow} title={content.title} />
        <h3 className={styles.subtitle}>{pgdmProgram.subtitle}</h3>
        <p className={styles.lead}>{pgdmProgram.lead}</p>
        <p>{pgdmProgram.body}</p>
        <ul className={styles.highlights} role="list">
          {pgdmProgram.highlights.map((item) => (
            <li key={item}>
              <Icon src={icons.check} className={styles.check} />
              {item}
            </li>
          ))}
        </ul>
        <Button variant="arrow" href={content.buttonHref} className={styles.link}>
          {content.buttonText}
        </Button>
      </div>
    </section>
  );
}
