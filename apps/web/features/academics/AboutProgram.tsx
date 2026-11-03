import { SectionHeading } from '@/components/ui/SectionHeading';
import { aboutProgram } from '@/content/academics';
import styles from './AcademicsBlocks.module.css';

export function AboutProgram() {
  const { link } = aboutProgram;
  return (
    <section aria-labelledby="about-program-title">
      <SectionHeading
        id="about-program-title"
        eyebrow="About Program"
        title={aboutProgram.title}
        className={styles.aboutProgramHeading}
      />
      <div className={styles.prose}>
        {aboutProgram.paragraphs.map((paragraph) => {
          const [before, after] = paragraph.split('{link}');
          return (
            <p key={paragraph.slice(0, 32)}>
              {before}
              {after !== undefined && (
                <>
                  <a href={link.href} target="_blank" rel="noopener noreferrer" className={styles.inlineLink}>
                    {link.label}
                  </a>
                  {after}
                </>
              )}
            </p>
          );
        })}
      </div>
    </section>
  );
}
