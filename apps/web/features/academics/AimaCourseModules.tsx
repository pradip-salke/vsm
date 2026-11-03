'use client';

import { useId, useState, type KeyboardEvent } from 'react';
import { IconList } from '@/components/sections/IconList';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { aimaYearOne, aimaYearTwo, aimaModuleFourItems } from '@/content/aima-pgdm';
import blocks from './AcademicsBlocks.module.css';
import styles from './AimaCourseModules.module.css';

const years = ['Year 1', 'Year 2'] as const;

export function AimaCourseModules() {
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
        <p className={styles.intro}>Module 1 – Common for all Specialisations (Exit – Certificate in Management). Module 2 – Common for all Specialisations (Exit – Advance Certificate in Management).</p>
        <div className={blocks.tableScroll} tabIndex={0}>
          <table className={`${blocks.table} ${blocks.curriculumTable}`}>
            <caption className="visually-hidden">AIMA PGDM Year 1 course modules</caption>
            <thead><tr><th scope="col">Module 1</th><th scope="col">Module 2</th></tr></thead>
            <tbody>{aimaYearOne.map(([first, second]) => <tr key={first}><td>{first}</td><td>{second}</td></tr>)}</tbody>
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
        <p className={styles.intro}>Module 3 Specialisation-wise (Exit – Professional Certificate in Management PGDM).</p>
        <div className={blocks.tableScroll} tabIndex={0}>
          <table className={`${blocks.table} ${blocks.curriculumTable} ${styles.specialisationTable}`}>
            <caption className="visually-hidden">AIMA PGDM Year 2 specialisation papers</caption>
            <thead><tr><th scope="col">Specialisation</th><th scope="col">Paper 1</th><th scope="col">Paper 2</th><th scope="col">Paper 3</th><th scope="col">Paper 4</th><th scope="col">Paper 5</th></tr></thead>
            <tbody>{aimaYearTwo.map(([name, ...papers]) => <tr key={name}><th scope="row">{name}</th>{papers.map((paper, index) => <td key={`${name}-${index}`}>{paper}</td>)}</tr>)}</tbody>
          </table>
        </div>
        <h3 className={styles.moduleFourTitle}>Module 4 – Common for all Specialisations (Post Graduate Diploma in Management PGDM)</h3>
        <IconList items={aimaModuleFourItems} divided className={styles.iconList} />
      </div>
    </section>
  );
}
