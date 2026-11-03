import type { ReactNode } from 'react';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { icons } from '@/components/ui/icons';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { faqIntro, faqs } from '@/content/shared';
import styles from './FaqSection.module.css';

export type FaqItem = { question: string; answer: ReactNode };

function FaqColumn({ items }: { items: FaqItem[] }) {
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
          <div className={styles.answer}>{faq.answer}</div>
        </details>
      ))}
    </div>
  );
}

export function FaqList({ items }: { items: FaqItem[] }) {
  const half = Math.ceil(items.length / 2);
  return (
    <div className={styles.grid}>
      <FaqColumn items={items.slice(0, half)} />
      <FaqColumn items={items.slice(half)} />
    </div>
  );
}

export function FaqSection() {
  return (
    <section className={styles.section} aria-labelledby="faq-title">
      <div className="container">
        <SectionHeading
          id="faq-title"
          eyebrow="Empowering Your Academic Journey: Your Questions Answered"
          title="FAQ About PGDM Admissions"
          rule
          className={styles.heading}
        >
          <p>{faqIntro}</p>
        </SectionHeading>
        <FaqList items={faqs} />
        <Button variant="arrow" href="/admissions/mba-pgdm-admissions-process/" className={styles.more}>
          More FAQs
        </Button>
      </div>
    </section>
  );
}
