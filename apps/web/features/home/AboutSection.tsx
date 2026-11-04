import { Button } from '@/components/ui/Button';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { about } from '@/content/home';
import styles from './AboutSection.module.css';

export function AboutSection() {
  return (
    <section className={styles.section} aria-labelledby="about-title">
      <div className="container">
        <SectionHeading id="about-title" eyebrow="Nurturing Future Leaders in the Age of Innovation" title="About Us" size="display" uppercase rule className={styles.heading} />
        <div className={styles.body}>
          <p>{about}</p>
          <Button className={styles.action} variant="arrow" href="/about-us/about-vsm-mba-pgdm-colleges-in-mumbai/">
            Explore now
          </Button>
        </div>
      </div>
    </section>
  );
}
