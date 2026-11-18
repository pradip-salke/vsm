'use client';

import { useEffect, useState, type CSSProperties, type MouseEvent, type ReactNode } from 'react';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { icons } from '@/components/ui/icons';
import { SectionHeading } from '@/components/ui/SectionHeading';
import styles from './FaqSection.module.css';

export type FaqItem = { question: string; answer: ReactNode };
export type FaqSectionContent = { title: string; eyebrow?: string; description?: string; items: FaqItem[] };

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
  const [showAll, setShowAll] = useState(false);
  const [openIndex, setOpenIndex] = useState<number | null>(items.length ? 0 : null);
  const itemSignature = items.map(item => item.question).join('\u0000');
  const itemCount = items.length;
  useEffect(() => {
    setShowAll(false);
    setOpenIndex(itemCount ? 0 : null);
  }, [itemCount, itemSignature]);
  if (!items.length) return null;
  const visibleItems = showAll ? items : items.slice(0, 4);
  const half = Math.ceil(visibleItems.length / 2);
  const toggle = (index: number) => setOpenIndex(current => current === index ? null : index);
  return (
    <>
      <div className={styles.grid} style={{ '--faq-rows': half } as CSSProperties}>
        <FaqColumn items={visibleItems.slice(0, half)} startIndex={0} openIndex={openIndex} onToggle={toggle} />
        <FaqColumn items={visibleItems.slice(half)} startIndex={half} openIndex={openIndex} onToggle={toggle} />
      </div>
      {items.length > 4 && <Button
        variant="arrow"
        className={styles.more}
        aria-expanded={showAll}
        onClick={() => {
          setShowAll(value => !value);
          if (showAll) setOpenIndex(current => current !== null && current >= 4 ? null : current);
        }}
      >
        {showAll ? 'Show Less' : 'More FAQs'}
      </Button>}
    </>
  );
}

export function FaqSection({ content, className }: { content?: FaqSectionContent; className?: string }) {
  if (!content?.items?.length) return null;
  return (
    <section className={`${styles.section} ${className ?? ''}`} aria-labelledby="faq-title">
      <div className="container">
        <SectionHeading
          id="faq-title"
          eyebrow={content.eyebrow}
          title={content.title}
          rule
          className={styles.heading}
        >
          {content.description && <p>{content.description}</p>}
        </SectionHeading>
        <FaqList items={content.items} />
      </div>
    </section>
  );
}
