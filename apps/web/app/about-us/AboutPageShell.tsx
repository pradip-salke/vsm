import type { ReactNode } from 'react';
import Link from 'next/link';
import { PageHero } from '@/components/sections/PageHero';
import { academicsHero } from '@/content/academics';
import { aboutPageList } from '@/content/about';
import styles from './about.module.css';

export function AboutPageShell({ title, active, children }: { title: string; active: string; children: ReactNode }) {
  const slide = { ...academicsHero, title, subtitle: aboutPageList.find((page) => page.label === active)?.subtitle ?? academicsHero.subtitle };
  return <>
    <PageHero
      size="inner"
      slides={[slide]}
      actions={null}
      breadcrumb={[{ label: 'Home', href: '/' }, { label: 'About', href: aboutPageList[0].href }, { label: title }]}
    />
    <div className={styles.body}>
      <div className={`container ${styles.layout}`}>
        <aside className={styles.sidebar} aria-label="About pages">
          <h2>About</h2>
          <nav aria-label="About pages">
            <ul role="list">
              {aboutPageList.map((page) => <li key={page.href}><Link href={page.href} aria-current={active === page.label ? 'page' : undefined}>{page.label}</Link></li>)}
            </ul>
          </nav>
        </aside>
        <div className={styles.content}>{children}</div>
      </div>
    </div>
  </>;
}

export function AboutSection({ title, children, intro }: { title?: string; children: ReactNode; intro?: string }) {
  return <section className={styles.section}>
    {title && <header className={styles.sectionHeading}><h2>{title}</h2>{intro && <p>{intro}</p>}</header>}
    {children}
  </section>;
}
