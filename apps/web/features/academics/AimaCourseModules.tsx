'use client';

import { useId, useState, type KeyboardEvent } from 'react';
import { IconList } from '@/components/sections/IconList';
import { SectionHeading } from '@/components/ui/SectionHeading';
import type { AimaContent } from '@vsmedu/contracts/academics-aima';
import blocks from './AcademicsBlocks.module.css';
import styles from './AimaCourseModules.module.css';

const years = ['Year 1', 'Year 2'] as const;

export function AimaCourseModules({ content }: { content: AimaContent['course-modules'] }) {
  const [selected, setSelected] = useState(0);
  const baseId = useId();

  const onKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (event.key !== 'ArrowRight' && event.key !== 'ArrowLeft') return;
    event.preventDefault();
    const next = (selected + (event.key === 'ArrowRight' ? 1 : years.length - 1)) % years.length;
    setSelected(next);
    document.getElementById(`${baseId}-tab-${next}`)?.focus();
  };

  return (
    <section aria-labelledby="course-modules-title">
      <SectionHeading id="course-modules-title" title="Course Modules" />
      <div className={blocks.yearTabs} role="tablist" aria-label="AIMA PGDM course year">
        {years.map((year, index) => (
          <button
            key={year}
            id={`${baseId}-tab-${index}`}
            type="button"
            role="tab"
            className={blocks.yearTab}
            aria-selected={selected === index}
            aria-controls={`${baseId}-panel-${index}`}
            tabIndex={selected === index ? 0 : -1}
            onClick={() => setSelected(index)}
            onKeyDown={onKeyDown}
          >
            {year}
          </button>
        ))}
      </div>

      <div
        id={`${baseId}-panel-0`}
        role="tabpanel"
        aria-labelledby={`${baseId}-tab-0`}
        hidden={selected !== 0}
        className={styles.panel}
        tabIndex={0}
      >
        <div className={blocks.tableScroll} tabIndex={0}>
          <table className={`${blocks.table} ${blocks.curriculumTable} ${styles.yearOneTable}`}>
            <caption className="visually-hidden">AIMA PGDM Year 1 course modules</caption>
            <thead><tr><th scope="col">{content.year1Module1Heading}</th><th scope="col">{content.year1Module2Heading}</th></tr></thead>
            <tbody>{content.year1Rows.map(({ left, right }) => <tr key={left}><td>{left}</td><td>{right}</td></tr>)}</tbody>
          </table>
        </div>
      </div>

      <div
        id={`${baseId}-panel-1`}
        role="tabpanel"
        aria-labelledby={`${baseId}-tab-1`}
        hidden={selected !== 1}
        className={styles.panel}
        tabIndex={0}
      >
        <p className={styles.intro}>{content.year2Intro}</p>
        <div className={blocks.tableScroll} tabIndex={0}>
          <table className={`${blocks.table} ${blocks.curriculumTable} ${styles.specialisationTable}`}>
            <caption className="visually-hidden">AIMA PGDM Year 2 specialisation papers</caption>
            <thead><tr><th scope="col">Specialisation</th><th scope="col">Paper 1</th><th scope="col">Paper 2</th><th scope="col">Paper 3</th><th scope="col">Paper 4</th><th scope="col">Paper 5</th></tr></thead>
            <tbody>{content.year2Rows.map(({ label, paper1, paper2, paper3, paper4, paper5 }) => <tr key={label}><th scope="row">{label}</th>{[paper1, paper2, paper3, paper4, paper5].map((paper, index) => <td key={`${label}-${index}`}>{paper}</td>)}</tr>)}</tbody>
          </table>
        </div>
        <h3 className={styles.moduleFourTitle}>{content.moduleFourTitle}</h3>
        <IconList items={content.moduleFourItems} divided className={styles.iconList} />
      </div>
    </section>
  );
}
