'use client';

import { useEffect, useRef, useState } from 'react';
import { academicsTabs } from '@/content/academics';
import styles from './AcademicsTabs.module.css';

/** In-page section navigation; the active tab follows the section in view. */
export type AcademicTab = { label: string; id: string };

export function AcademicsTabs({ tabs = academicsTabs, className }: { tabs?: AcademicTab[]; className?: string }) {
  const [active, setActive] = useState(tabs[0]?.id ?? '');
  const listRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    const sections = tabs
      .map((tab) => document.getElementById(tab.id))
      .filter((section): section is HTMLElement => Boolean(section));
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((entry) => entry.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActive(visible[0].target.id);
      },
      { rootMargin: '-20% 0px -65% 0px' },
    );
    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, [tabs]);

  useEffect(() => {
    const link = listRef.current?.querySelector<HTMLElement>(`[data-id="${active}"]`);
    const list = listRef.current;
    if (!link || !list) return;
    const offset = link.offsetLeft - list.clientWidth / 2 + link.offsetWidth / 2;
    list.scrollTo({ left: offset, behavior: 'smooth' });
  }, [active]);

  return (
    <nav className={`${styles.tabs} ${className ?? ''}`} aria-label="On this page">
      <ul ref={listRef} className={`container ${styles.list}`} role="list">
        {tabs.map((tab) => (
          <li key={tab.id}>
            <a
              href={`#${tab.id}`}
              data-id={tab.id}
              className={styles.link}
              aria-current={active === tab.id ? 'location' : undefined}
              onClick={() => setActive(tab.id)}
            >
              {tab.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
