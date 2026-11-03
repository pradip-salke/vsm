'use client';

import { useEffect, useRef } from 'react';
import { Link } from '@/components/navigation/Link';
import { aboutPageList } from '@/content/about';
import styles from './about.module.css';

export function AboutPageNavigation({ active }: { active: string }) {
  const listRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    const list = listRef.current;
    const link = list?.querySelector<HTMLElement>('[aria-current="page"]');
    if (!list || !link) return;

    const linkRect = link.getBoundingClientRect();
    const listRect = list.getBoundingClientRect();
    const left = list.scrollLeft + linkRect.left - listRect.left - (list.clientWidth - linkRect.width) / 2;
    list.scrollTo({ left: Math.max(0, left), behavior: 'smooth' });
  }, [active]);

  return (
    <aside className={styles.sidebar} aria-label="About pages">
      <h2>About</h2>
      <nav aria-label="About pages">
        <ul ref={listRef} className="container" role="list">
          {aboutPageList.map((page) => (
            <li key={page.href}>
              <Link
                href={page.href}
                target={page.href.endsWith('.pdf') ? '_blank' : undefined}
                rel={page.href.endsWith('.pdf') ? 'noopener noreferrer' : undefined}
                aria-current={active === page.label ? 'page' : undefined}
              >
                {page.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}
