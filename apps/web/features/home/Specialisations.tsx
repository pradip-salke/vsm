import Image from 'next/image';
import { Button } from '@/components/ui/Button';
import { SectionHeading } from '@/components/ui/SectionHeading';
import styles from './Specialisations.module.css';
import { homeDefaults, type HomeContent } from '@vsmedu/contracts/home';

export function Specialisations({ content = homeDefaults.specialisations }: { content?: HomeContent['specialisations'] }) {
  const specialisations = content.items;
  return (
    <section className={styles.section} aria-labelledby="specialisations-title">
      <div className="container">
        <SectionHeading id="specialisations-title" title={content.title} tone="light" uppercase className={styles.heading} />
      </div>
      <div className={styles.gridWrap}>
        <ul className={`container ${styles.grid}`} role="list">
          {specialisations.map((item) => (
            <li key={item.title} className={styles.cell}>
              <Image src={item.icon} alt="" width={88} height={88} sizes="88px" className={styles.icon} />
              <h3 className={styles.title}>{item.title}</h3>
              <p className={styles.description}>{item.description}</p>
              <Button variant="arrow" tone="muted" href={item.href} className={styles.link} aria-label={`Know more about ${item.title}`}>
                {content.buttonText}
              </Button>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
