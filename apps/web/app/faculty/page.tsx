import type { Metadata } from 'next';
import { PageHero } from '@/components/sections/PageHero';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { AcademicsTabs } from '@/features/academics/AcademicsTabs';
import layout from '@/features/academics/AcademicsLayout.module.css';
import { FacultyDirectoryCards } from './FacultyDirectoryCards';
import styles from './FacultyPage.module.css';
import { getFacultyContent } from '@/lib/faculty-content';
import { withSeo } from '@/lib/seo';

const metadata: Metadata = {
  title: { absolute: 'Teaching Faculty | Valia School of Management' },
  description: 'Meet the experienced academic and industry faculty at Valia School of Management.',
  alternates: { canonical: '/faculty/' },
};

export async function generateMetadata(): Promise<Metadata> {
  return withSeo('/faculty/', metadata);
}

export default async function FacultyPage() {
  const { sections, masters } = await getFacultyContent();
  const profiles = masters.profiles.items;
  const tabs = sections.tabs.links.map(({ label, anchor }) => ({ label, id: anchor }));
  return (
    <div className={layout.page}>
      <PageHero
        size="inner"
        slides={[{ ...sections.hero, ...masters.hero.items[0] }]}
        breadcrumb={sections.hero.breadcrumb}
        actions={<a className={styles.heroLink} href={sections.hero.linkHref}>{sections.hero.linkText} <span aria-hidden="true">↓</span></a>}
      />
      <AcademicsTabs tabs={tabs} className={styles.facultyTabs} />
      <div className={`${layout.layout} ${styles.layout}`}>
        <aside className={`${layout.sidebar} ${styles.sidebar}`} aria-label="Faculty overview">
          <div className={styles.summary}>
            <p className={styles.eyebrow}>{sections.glance.eyebrow}</p>
            <h2>{sections.glance.title}</h2>
            <p>{sections.glance.description}</p>
            <dl><div><dt>{sections.glance.profilesLabel}</dt><dd>{profiles.length}</dd></div><div><dt>{sections.glance.experienceLabel}</dt><dd>{sections.glance.experienceValue}</dd></div></dl>
          </div>
        </aside>
        <main className={layout.main}>
          <section id={tabs[0]?.id ?? 'our-faculty'} className={`${layout.block} ${styles.section} ${styles.firstSection}`}>
            <SectionHeading className={styles.facultyHeading} eyebrow={sections.intro.eyebrow} title={sections.intro.title}>
              <p>{sections.intro.description}</p>
            </SectionHeading>
            <FacultyDirectoryCards profiles={profiles} />
          </section>
          <section id={tabs[1]?.id ?? 'faculty-experience'} className={`${layout.block} ${styles.section}`}>
            <SectionHeading title={sections.experience.title} />
            <div className={styles.closing} dangerouslySetInnerHTML={{ __html: sections.experience.body }} />
          </section>
        </main>
      </div>
    </div>
  );
}
