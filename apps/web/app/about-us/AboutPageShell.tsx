import type { ReactNode } from 'react';
import { PageHero } from '@/components/sections/PageHero';
import { academicsHero } from '@/content/academics';
import { aboutPageList } from '@/content/about';
import styles from './about.module.css';
import { AboutPageNavigation } from './AboutPageNavigation';

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
      <div className={`${styles.layout}${trusteeMessages ? ` ${styles.trusteeMessages}` : ''}${viewportContent ? ` ${styles.viewportContent}` : ''}`}>
        <AboutPageNavigation active={active} />
        <div className={styles.content}>{children}</div>
      </div>
    </div>
  </>;
}

export function AboutSection({ title, children, intro, className }: { title?: string; children: ReactNode; intro?: string; className?: string }) {
  return <section className={`${styles.section}${className ? ` ${className}` : ''}`}>
    {title && <header className={styles.sectionHeading}><h2>{title}</h2>{intro && <p>{intro}</p>}</header>}
    {children}
  </section>;
}
