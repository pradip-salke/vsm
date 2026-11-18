import type { Metadata } from 'next';
import { Button } from '@/components/ui/Button';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { AcademicClosingSections } from '@/components/sections/AcademicClosingSections';
import { IconList } from '@/components/sections/IconList';
import { PageHero } from '@/components/sections/PageHero';
import { AcademicsTabs } from '@/features/academics/AcademicsTabs';
import { AimaCourseModules } from '@/features/academics/AimaCourseModules';
import { AtAGlance } from '@/features/academics/AtAGlance';
import layout from '@/features/academics/AcademicsLayout.module.css';
import blocks from '@/features/academics/AcademicsBlocks.module.css';
import styles from './AimaPgdmPage.module.css';
import { getAimaContent } from '@/lib/aima-content';
import { withSeo } from '@/lib/seo';

const metadata: Metadata = {
  title: { absolute: 'AIMA PGDM in Mumbai | Valia School of Management' },
  description: 'Explore the AIMA-Centre for Management Education PGDM at Valia School of Management, including course modules, specialisations, fees and program details.',
  alternates: { canonical: '/our-academics/aima-pgdm/' },
};

export async function generateMetadata(): Promise<Metadata> {
  return withSeo('/our-academics/aima-pgdm/', metadata);
}

export default async function AimaPgdmPage() {
  const { sections, masters } = await getAimaContent();
  const hero = sections.hero;
  const banner = masters.hero.items[0];
  const tabs = sections.tabs.links.map(({ label, anchor }) => ({ label, id: anchor }));
  const glance = sections.glance;
  const sectionAnchor = (index: number, fallback: string) => sections.tabs.links[index]?.anchor ?? fallback;
  // Display order is a position in the page's main content, starting before About VSM.
  const customSections = (sections.templateSections?.sections ?? []).map((section, index) => ({ section, index })).sort((a, b) => a.section.displayOrder - b.section.displayOrder || a.index - b.index);
  const sectionsAt = (position: number) => customSections.filter(({ section }) => Math.max(1, Math.min(9, section.displayOrder || 1)) === position).map(({ section, index }) => (
    <section key={`custom-${index}`} className={`${layout.block} ${layout.customTemplateSection} ${section.sectionType === 'text' ? layout.customTextSection : ''}`}>
      {section.title && <SectionHeading title={section.title} />}
      <div className={blocks.prose}>
        <div className={section.sectionType === 'text' && section.imageUrl ? blocks.templateTextWithImage : undefined}><div className={blocks.templateRichText} dangerouslySetInnerHTML={{ __html: section.body }} />{section.sectionType === 'text' && section.imageUrl && <img className={blocks.templateTextImage} src={section.imageUrl} alt="" />}</div>
        {section.subsectionTitle && <h3 className={styles.subheading}>{section.subsectionTitle}</h3>}
        {section.items.length > 0 && <div className={section.items.length > 5 ? layout.customListViewport : undefined} role={section.items.length > 5 ? 'region' : undefined} aria-label={section.items.length > 5 ? `${section.title} list` : undefined} tabIndex={section.items.length > 5 ? 0 : undefined}>
          <IconList items={section.items.slice().sort((a, b) => a.displayOrder - b.displayOrder)} divided className={styles.iconList} />
        </div>}
      </div>
    </section>
  ));
  return (
    <div className={layout.page}>
      <PageHero
        size="inner"
        slides={masters.hero.items.filter(item => item.enabled !== false).map(item => ({ ...hero, ...item }))}
        breadcrumb={hero.breadcrumb}
        actions={
          <>
            {banner?.primaryText && banner.primaryHref && <Button href={banner.primaryHref}>{banner.primaryText}</Button>}
            {banner?.secondaryText && banner.secondaryHref && <Button variant="arrow" href={banner.secondaryHref}>{banner.secondaryText}</Button>}
          </>
        }
      />
      <AcademicsTabs tabs={tabs} />

      <div className={layout.layout}>
        <aside className={layout.sidebar} aria-label="AIMA PGDM summary">
          <AtAGlance title={glance.title} facts={glance.facts} applyText={glance.buttonText} applyHref={glance.buttonHref} brochureText={glance.brochureText} brochureHref={glance.brochureHref} contactText={glance.contactText} contactHref={glance.contactHref} />
        </aside>

        <div className={layout.main}>
          {sectionsAt(1)}
          <div id="about-program" className={`${layout.block} ${styles.aboutProgram}`}>
          <section id={sectionAnchor(0, 'about-vsm')} className={styles.sectionLead}>
            <SectionHeading eyebrow={sections['about-vsm'].eyebrow} title={sections['about-vsm'].title} />
            <div className={blocks.prose}><div dangerouslySetInnerHTML={{ __html: sections['about-vsm'].body }} /><IconList items={sections['about-vsm'].specialisations} divided className={styles.iconList} /></div>
          </section>
          </div>

          {sectionsAt(2)}
          <section id={sectionAnchor(1, 'about-aima')} className={layout.block}>
            <SectionHeading title={sections['about-aima'].title} />
            <div className={blocks.prose}><div dangerouslySetInnerHTML={{ __html: sections['about-aima'].body }} /><h3 className={styles.subheading}>{sections['about-aima'].subsectionTitle}</h3>
              <IconList items={sections['about-aima'].items} divided className={styles.iconList} />
            </div>
          </section>

          {sectionsAt(3)}
          <section id={sectionAnchor(2, 'about-pgdm')} className={layout.block}>
            <SectionHeading title={sections['about-pgdm'].title} />
            <div className={blocks.prose}><div dangerouslySetInnerHTML={{ __html: sections['about-pgdm'].body }} /></div>
          </section>

          {sectionsAt(4)}
          <section id={sectionAnchor(3, 'program-structure')} className={layout.block}>
            <SectionHeading title={sections['program-structure'].title} />
            <p className={styles.moduleNote}>{sections['program-structure'].note}</p>
            <IconList items={sections['program-structure'].items} divided className={styles.iconList} />
          </section>

          {sectionsAt(5)}
          <section id={sectionAnchor(4, 'specialisations')} className={layout.block}>
            <SectionHeading title={sections.specialisations.title} />
            <IconList items={sections.specialisations.items} divided className={styles.iconList} />
          </section>

          {sectionsAt(6)}
          <div id={sectionAnchor(5, 'course-modules')} className={layout.block}>
            <AimaCourseModules content={sections['course-modules']} />
          </div>

          {sectionsAt(7)}
          <section id={sectionAnchor(6, 'aima-fees')} className={layout.block}>
            <SectionHeading title={sections.fees.title} />
            <div className={blocks.tableScroll} tabIndex={0}>
              <table className={`${blocks.table} ${blocks.feeTable} ${styles.feeTable}`}>
                <caption className="visually-hidden">AIMA PGDM course fees</caption>
                <thead><tr><th scope="col">{sections.fees.columnLabel}</th><th scope="col">{sections.fees.columnValue}</th></tr></thead>
                <tbody>{sections.fees.rows.map(({ label, amount }) => <tr key={label}><th scope="row">{label}</th><td>{amount}</td></tr>)}</tbody>
              </table>
            </div>
          </section>

          {sectionsAt(8)}
          <section id={sectionAnchor(7, 'other-details')} className={layout.block}>
            <SectionHeading title={sections['other-details'].title} />
            <div className={styles.otherDetailsViewport}>
              <IconList items={sections['other-details'].details} divided className={`${styles.iconList} ${styles.otherDetailsList}`} />
            </div>
          </section>

          {sectionsAt(9)}
        </div>
      </div>
      <AcademicClosingSections
        scope="aima"
        faq={sections.faq}
        internships={masters.internships.items}
        internshipTitle={sections.internships.title}
        testimonials={masters.testimonials.items}
        testimonialHeading={sections.testimonials}
      />
    </div>
  );
}
