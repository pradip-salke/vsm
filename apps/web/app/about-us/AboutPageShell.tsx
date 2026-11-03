import type { ReactNode } from 'react';
import { Link } from '@/components/navigation/Link';
import { PageHero } from '@/components/sections/PageHero';
import { academicsHero } from '@/content/academics';
import { aboutPageList } from '@/content/about';
import styles from './about.module.css';

export function AboutPageShell({ title, active, children, trusteeMessages = false, viewportContent = false }: { title: string; active: string; children: ReactNode; trusteeMessages?: boolean; viewportContent?: boolean }) {
  const slide = { ...academicsHero, title, subtitle: aboutPageList.find((page) => page.label === active)?.subtitle ?? academicsHero.subtitle };
  return <>
    <PageHero
      size="inner"
      slides={[slide]}
      actions={null}
      breadcrumb={[{ label: 'Home', href: '/' }, { label: 'About', href: aboutPageList[0].href }, { label: title }]}
    />
    <div className={styles.body}>
      <div className={`container ${styles.layout}${trusteeMessages ? ` ${styles.trusteeMessages}` : ''}${viewportContent ? ` ${styles.viewportContent}` : ''}`}>
        <aside className={styles.sidebar} aria-label="About pages">
          <h2>About</h2>
          <nav aria-label="About pages">
            <ul role="list">
              {aboutPageList.map((page) => <li key={page.href}><Link href={page.href} target={page.href.endsWith('.pdf') ? '_blank' : undefined} rel={page.href.endsWith('.pdf') ? 'noopener noreferrer' : undefined} aria-current={active === page.label ? 'page' : undefined}>{page.label}</Link></li>)}
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
