import { SectionHeading } from '@/components/ui/SectionHeading';
import { aboutProgram } from '@/content/academics';
import type { AcademicsContent } from '@vsmedu/contracts/academics';
import styles from './AcademicsBlocks.module.css';

type About = AcademicsContent['about'];

export function AboutProgram({ about = aboutProgram }: { about?: About }) {
  return (
    <section aria-labelledby="about-program-title">
      <SectionHeading
        id="about-program-title"
        eyebrow={about.eyebrow}
        title={about.title}
        className={styles.aboutProgramHeading}
      />
      <div
        className={`${styles.prose} ${styles.aboutBody}`}
        dangerouslySetInnerHTML={{ __html: about.body }}
      />
    </section>
  );
}
