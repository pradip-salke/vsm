import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { icons } from '@/components/ui/icons';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { faqIntro, faqs, type Faq } from '@/content/shared';
import styles from './FaqSection.module.css';

function FaqColumn({ items }: { items: Faq[] }) {
  return (
    <div className={styles.column}>
      {items.map((faq, index) => (
        <details key={faq.question} className={styles.item} open={index === 0}>
          <summary className={styles.question}>
            <span className={styles.icon} aria-hidden>
              <Icon src={icons.faqAdd} className={styles.add} />
              <Icon src={icons.faqOpen} className={styles.remove} />
            </span>
            <span>{faq.question}</span>
          </summary>
          <p className={styles.answer}>{faq.answer}</p>
        </details>
      ))}
    </div>
  );
}

export function FaqSection() {
  const half = Math.ceil(faqs.length / 2);
  return (
    <section className={styles.section} aria-labelledby="faq-title">
      <div className="container">
        <SectionHeading
          id="faq-title"
          eyebrow="Empowering Your Academic Journey: Your Questions Answered"
          title="FAQ About PGDM Admissions"
          rule
        >
          <p>{faqIntro}</p>
        </SectionHeading>
        <div className={styles.grid}>
          <FaqColumn items={faqs.slice(0, half)} />
          <FaqColumn items={faqs.slice(half)} />
        </div>
        <Button variant="arrow" href="/admissions/mba-pgdm-admissions-process/" className={styles.more}>
          More FAQs
        </Button>
      </div>
    </section>
  );
}
