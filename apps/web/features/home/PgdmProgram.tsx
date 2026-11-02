import Image from 'next/image';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { icons } from '@/components/ui/icons';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { pgdmProgram } from '@/content/home';
import { ACADEMICS_PGDM_PATH } from '@/content/site';
import styles from './PgdmProgram.module.css';

export function PgdmProgram() {
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
        <SectionHeading id="pgdm-title" eyebrow="Empower Your Future with Industry-Focused Education" title="Our PGDM Program" />
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
        <Button variant="arrow" href={ACADEMICS_PGDM_PATH} className={styles.link}>
          choose your pgdm program
        </Button>
      </div>
    </section>
  );
}
