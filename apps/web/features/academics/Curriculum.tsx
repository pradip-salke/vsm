'use client';

import { useId, useState, type KeyboardEvent } from 'react';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { curriculum, curriculumIntro, type CurriculumCell } from '@/content/academics';
import styles from './AcademicsBlocks.module.css';

function Cell({ value }: { value: CurriculumCell }) {
  if (Array.isArray(value)) {
    return (
      <ul className={styles.courseList} role="list">
        {value.map((course) => (
          <li key={course}>{course}</li>
        ))}
      </ul>
    );
  }
  return <>{value}</>;
}

export function Curriculum() {
  const [selected, setSelected] = useState(0);
  const baseId = useId();

  const onKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (event.key !== 'ArrowRight' && event.key !== 'ArrowLeft') return;
    const next = (selected + (event.key === 'ArrowRight' ? 1 : -1) + curriculum.length) % curriculum.length;
    setSelected(next);
    document.getElementById(`${baseId}-tab-${next}`)?.focus();
  };

  return (
    <section aria-labelledby="curriculum-title">
      <SectionHeading id="curriculum-title" title="Academic Curriculum">
        <p>{curriculumIntro}</p>
      </SectionHeading>

      <div className={styles.yearTabs} role="tablist" aria-label="Curriculum year">
        {curriculum.map((table, index) => (
          <button
            key={table.year}
            id={`${baseId}-tab-${index}`}
            type="button"
            role="tab"
            className={styles.yearTab}
            aria-selected={selected === index}
            aria-controls={`${baseId}-panel-${index}`}
            tabIndex={selected === index ? 0 : -1}
            onClick={() => setSelected(index)}
            onKeyDown={onKeyDown}
          >
            {table.year}
          </button>
        ))}
      </div>

      {curriculum.map((table, index) => (
        <div
          key={table.year}
          id={`${baseId}-panel-${index}`}
          role="tabpanel"
          aria-labelledby={`${baseId}-tab-${index}`}
          hidden={selected !== index}
          className={styles.tableScroll}
          tabIndex={0}
        >
          <table className={`${styles.table} ${styles.curriculumTable}`}>
            <caption className="visually-hidden">PGDM curriculum, {table.year.replace('+', '')}</caption>
            <thead>
              <tr>
                <td />
                {table.columns.map((column) => (
                  <th key={column} scope="col">
                    {column}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {table.rows.map((row, rowIndex) => (
                <tr key={`${row.label}-${rowIndex}`}>
                  {row.label ? <th scope="row">{row.label}</th> : <td />}
                  {row.cells.map((cell, cellIndex) => (
                    <td key={cellIndex}>
                      <Cell value={cell} />
                    </td>
                  ))}
                </tr>
              ))}
              <tr className={styles.totalRow}>
                <th scope="row">{table.total.label}</th>
                <td colSpan={table.columns.length}>{table.total.value}</td>
              </tr>
            </tbody>
          </table>
          {table.note ? <p className={styles.note}>{table.note}</p> : null}
        </div>
      ))}
    </section>
  );
}
