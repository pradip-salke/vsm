'use client';

import { useState, type CSSProperties, type MouseEvent, type ReactNode } from 'react';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { icons } from '@/components/ui/icons';
import { SectionHeading } from '@/components/ui/SectionHeading';
import styles from './FaqSection.module.css';
import { homeDefaults, type HomeContent } from '@vsmedu/contracts/home';

export type FaqItem = { question: string; answer: ReactNode };

function FaqColumn({ items, startIndex, openIndex, onToggle }: {
  items: FaqItem[];
  startIndex: number;
  openIndex: number | null;
  onToggle: (index: number) => void;
}) {
  return (
    <div className={styles.column}>
      {items.map((faq, index) => {
        const itemIndex = startIndex + index;
        const isOpen = openIndex === itemIndex;
        return (
          <details key={faq.question} className={styles.item} open={isOpen}>
            <summary
              className={styles.question}
              onClick={(event: MouseEvent<HTMLElement>) => {
                event.preventDefault();
                onToggle(itemIndex);
              }}
            >
              <span className={styles.icon} aria-hidden>
                <Icon src={icons.faqAdd} className={styles.add} />
                <Icon src={icons.faqOpen} className={styles.remove} />
              </span>
              <span>{faq.question}</span>
            </summary>
            <div className={styles.answer}>{faq.answer}</div>
          </details>
        );
      })}
    </div>
  );
}

export function FaqList({ items }: { items: FaqItem[] }) {
  const half = Math.ceil(items.length / 2);
  const [openIndex, setOpenIndex] = useState<number | null>(items.length ? 0 : null);
  const toggle = (index: number) => setOpenIndex(current => current === index ? null : index);
  return (
    <div className={styles.grid} style={{ '--faq-rows': half } as CSSProperties}>
      <FaqColumn items={items.slice(0, half)} startIndex={0} openIndex={openIndex} onToggle={toggle} />
      <FaqColumn items={items.slice(half)} startIndex={half} openIndex={openIndex} onToggle={toggle} />
    </div>
  );
}

export function FaqSection({ content = homeDefaults.faq }: { content?: HomeContent['faq'] }) {
  return (
    <section className={styles.section} aria-labelledby="faq-title">
      <div className="container">
        <SectionHeading
          id="faq-title"
          eyebrow={content.eyebrow}
          title={content.title}
          rule
          className={styles.heading}
        >
          <p>{content.description}</p>
        </SectionHeading>
        <FaqList items={content.items} />
        <Button variant="arrow" href={content.buttonHref} className={styles.more}>
          {content.buttonText}
        </Button>
      </div>
    </section>
  );
}
