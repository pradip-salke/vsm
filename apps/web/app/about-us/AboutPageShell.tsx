import type { ReactNode } from 'react';
import { PageHero } from '@/components/sections/PageHero';
import { academicsHero } from '@/content/academics';
import { aboutPageList } from '@/content/about';
import styles from './about.module.css';
import { AboutPageNavigation } from './AboutPageNavigation';
import { getAboutPageContent, cmsString } from '@/lib/cms-content';

export async function AboutPageShell({ title, active, children, pageSlug, trusteeMessages = false, viewportContent = false }: { title: string; active: string; children: ReactNode; pageSlug: string; trusteeMessages?: boolean; viewportContent?: boolean }) {
  const cms = await getAboutPageContent(pageSlug);
  const heroMaster = cms?.masters.hero;
  const heroItems = Array.isArray(heroMaster?.items) ? heroMaster.items as Record<string, unknown>[] : [];
  const hero = { ...academicsHero, ...(heroItems[0] ?? {}), ...(cms?.sections.hero ?? {}), title: cmsString(cms?.sections.hero?.title, title) };
  const nav = cms?.sections['page-nav'];
  const navLinks = Array.isArray(nav?.links) ? nav.links as { label: string; href: string }[] : undefined;
  const slide = { ...hero, subtitle: cmsString(hero.subtitle, aboutPageList.find((page) => page.label === active)?.subtitle ?? academicsHero.subtitle) };
  return <>
    <PageHero
      size="inner"
      slides={heroItems.filter(item => item.enabled !== false).map(item => ({ ...slide, ...item }) as typeof slide)}
      actions={null}
      breadcrumb={[{ label: 'Home', href: '/' }, { label: 'About', href: aboutPageList[0].href }, { label: title }]}
    />
    <div className={styles.body}>
      <div className={`${styles.layout}${trusteeMessages ? ` ${styles.trusteeMessages}` : ''}${viewportContent ? ` ${styles.viewportContent}` : ''}`}>
        <AboutPageNavigation active={active} links={navLinks} title={cmsString(nav?.title, 'About')} />
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
