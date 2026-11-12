import type { Metadata } from 'next';
import Image from 'next/image';
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
  return (
    <div className={layout.page}>
      <PageHero
        size="inner"
        slides={[{ ...banner, ...hero }]}
        breadcrumb={hero.breadcrumb}
        actions={
          <>
            {banner.primaryText && banner.primaryHref && <Button href={banner.primaryHref}>{banner.primaryText}</Button>}
            {banner.secondaryText && banner.secondaryHref && <Button variant="arrow" href={banner.secondaryHref}>{banner.secondaryText}</Button>}
          </>
        }
      />
      <AcademicsTabs tabs={tabs} />

      <div className={layout.layout}>
        <aside className={layout.sidebar} aria-label="AIMA PGDM summary">
          <AtAGlance title={glance.title} facts={glance.facts} applyText={glance.buttonText} applyHref={glance.buttonHref} brochureText={glance.brochureText} brochureHref={glance.brochureHref} contactText={glance.contactText} contactHref={glance.contactHref} />
        </aside>

        <div className={layout.main}>
          <div id="about-program" className={`${layout.block} ${styles.aboutProgram}`}>
          <section id={sectionAnchor(0, 'about-vsm')} className={styles.sectionLead}>
            <SectionHeading eyebrow={sections['about-vsm'].eyebrow} title={sections['about-vsm'].title} />
            <div className={blocks.prose}><div dangerouslySetInnerHTML={{ __html: sections['about-vsm'].body }} /><IconList items={sections['about-vsm'].specialisations} divided className={styles.iconList} /></div>
          </section>
          </div>

          <section id={sectionAnchor(1, 'about-aima')} className={layout.block}>
            <SectionHeading title={sections['about-aima'].title} />
            <div className={blocks.prose}><div dangerouslySetInnerHTML={{ __html: sections['about-aima'].body }} /><h3 className={styles.subheading}>{sections['about-aima'].subsectionTitle}</h3>
              <IconList items={sections['about-aima'].items} divided className={styles.iconList} />
            </div>
          </section>

          <section id={sectionAnchor(2, 'about-pgdm')} className={layout.block}>
            <SectionHeading title={sections['about-pgdm'].title} />
            <div className={blocks.prose}><div dangerouslySetInnerHTML={{ __html: sections['about-pgdm'].body }} /></div>
          </section>

          <section id={sectionAnchor(3, 'program-structure')} className={layout.block}>
            <SectionHeading title={sections['program-structure'].title} />
            <p className={styles.moduleNote}>{sections['program-structure'].note}</p>
            <IconList items={sections['program-structure'].items} divided className={styles.iconList} />
          </section>

          <section id={sectionAnchor(4, 'specialisations')} className={layout.block}>
            <SectionHeading title={sections.specialisations.title} />
            <IconList items={sections.specialisations.items} divided className={styles.iconList} />
          </section>

          <div id={sectionAnchor(5, 'course-modules')} className={layout.block}>
            <AimaCourseModules content={sections['course-modules']} />
          </div>

          <section id={sectionAnchor(6, 'aima-fees')} className={layout.block}>
            <SectionHeading title={sections.fees.title} />
            <div className={blocks.tableScroll} tabIndex={0}>
              <table className={`${blocks.table} ${blocks.feeTable}`}>
                <caption className="visually-hidden">AIMA PGDM course fees</caption>
                <thead><tr><th scope="col">{sections.fees.columnLabel}</th><th scope="col">{sections.fees.columnValue}</th></tr></thead>
                <tbody>{sections.fees.rows.map(({ label, amount }) => <tr key={label}><th scope="row">{label}</th><td>{amount}</td></tr>)}</tbody>
              </table>
            </div>
          </section>

          <section id={sectionAnchor(7, 'other-details')} className={layout.block}>
            <SectionHeading title={sections['other-details'].title} />
            <div className={styles.otherDetailsViewport}>
              <IconList items={sections['other-details'].details} divided className={`${styles.iconList} ${styles.otherDetailsList}`} />
            </div>
            <h3 className={styles.subheading}>{sections['other-details'].multiExitTitle}</h3>
            <IconList items={sections['other-details'].exitAwards} divided className={styles.iconList} />
            <div className={styles.certificate}>
              <h3>{sections['other-details'].certificateBlockTitle}</h3>
              <Image
                className={styles.certificateImage}
                src={sections['other-details'].certificateImage.src}
                alt={sections['other-details'].certificateImage.alt}
                width={sections['other-details'].certificateImage.width}
                height={sections['other-details'].certificateImage.height}
                sizes="(max-width: 767px) 45vw, 160px"
              />
              <Button href={sections['other-details'].certificateButtonHref}>{sections['other-details'].certificateButtonText}</Button>
            </div>
          </section>

          <section id={sectionAnchor(8, 'admission-procedure')} className={layout.block} aria-labelledby="admission-title">
            <SectionHeading id="admission-title" title={sections.admission.title} />
            <IconList items={sections.admission.steps} ordered divided className={layout.steps} />
          </section>
        </div>
      </div>
      <AcademicClosingSections
        faq={sections.faq}
        internships={masters.internships.items}
        internshipTitle={sections.internships.title}
        testimonials={masters.testimonials.items}
        testimonialHeading={sections.testimonials}
      />
    </div>
  );
}
