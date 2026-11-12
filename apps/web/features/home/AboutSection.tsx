import { Button } from '@/components/ui/Button';
import { SectionHeading } from '@/components/ui/SectionHeading';
import styles from './AboutSection.module.css';
import { homeDefaults, type HomeContent } from '@vsmedu/contracts/home';

export function AboutSection({ content = homeDefaults.about }: { content?: HomeContent['about'] }) {
  return (
    <section className={styles.section} aria-labelledby="about-title">
      <div className="container">
        <SectionHeading id="about-title" eyebrow={content.eyebrow} title={content.title} size="display" uppercase rule className={styles.heading} />
        <div className={styles.body}>
          <p>{content.body}</p>
          <Button className={styles.action} variant="arrow" href={content.buttonHref}>
            {content.buttonText}
          </Button>
        </div>
      </div>
    </section>
  );
}
