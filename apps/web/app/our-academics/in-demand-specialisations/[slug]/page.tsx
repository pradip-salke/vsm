import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { AcademicClosingSections } from '@/components/sections/AcademicClosingSections';
import { PageHero } from '@/components/sections/PageHero';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { IconList } from '@/components/sections/IconList';
import { academicSpecialisations } from '@/content/academic-specialisations';
import { academicsSpecialisationDefaults } from '@vsmedu/contracts/academics-specialisations';
import { APPLY_PATH, ENQUIRY_ANCHOR } from '@/content/site';
import { AcademicsTabs } from '@/features/academics/AcademicsTabs';
import { AtAGlance } from '@/features/academics/AtAGlance';
import layout from '@/features/academics/AcademicsLayout.module.css';
import blocks from '@/features/academics/AcademicsBlocks.module.css';
import styles from './SpecialisationPage.module.css';
import { withSeo } from '@/lib/seo';
import { getSpecialisationClosingContent } from '@/lib/academics-specialisations-content';

type Props = { params: Promise<{ slug: string }> };

export const dynamic = 'force-dynamic';

export function generateStaticParams() {
  return academicSpecialisations.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const page = academicSpecialisations.find((item) => item.slug === slug);
  return page ? withSeo(`/our-academics/in-demand-specialisations/${page.slug}/`, {
    title: { absolute: `${page.heroTitle} | Valia School of Management` },
    description: `Explore the ${page.title} PGDM specialisation at Valia School of Management, including its curriculum, career opportunities and admission information.`,
    alternates: { canonical: `/our-academics/in-demand-specialisations/${page.slug}/` },
  }) : { title: 'Academic Specialisation | Valia School of Management' };
}

export default async function SpecialisationPage({ params }: Props) {
  const { slug } = await params;
  const page = academicSpecialisations.find((item) => item.slug === slug);
  if (!page) notFound();
  const specPage =
    academicsSpecialisationDefaults[slug as keyof typeof academicsSpecialisationDefaults];
  if (!specPage) notFound();
  const closingContent = await getSpecialisationClosingContent(slug);
  const customSections = (closingContent.templateSections?.sections ?? []).map((section, index) => ({ section, index })).sort((a, b) => a.section.displayOrder - b.section.displayOrder || a.index - b.index);
  const sectionsAt = (position: number) => customSections.filter(({ section }) => Math.max(1, Math.min(6, section.displayOrder || 1)) === position).map(({ section, index }) => <section key={`custom-${index}`} className={`${layout.block} ${layout.customTemplateSection} ${section.sectionType === 'text' ? layout.customTextSection : ''}`}>{section.title && <SectionHeading title={section.title} />}<div className={blocks.prose}><div className={section.sectionType === 'text' && section.imageUrl ? blocks.templateTextWithImage : undefined}><div className={blocks.templateRichText} dangerouslySetInnerHTML={{ __html: section.body }} />{section.sectionType === 'text' && section.imageUrl && <img className={blocks.templateTextImage} src={section.imageUrl} alt="" />}</div>{section.subsectionTitle && <h3>{section.subsectionTitle}</h3>}{section.items.length > 0 && <div className={section.items.length > 5 ? layout.customListViewport : undefined} role={section.items.length > 5 ? 'region' : undefined} aria-label={section.items.length > 5 ? `${section.title || 'Content'} list` : undefined} tabIndex={section.items.length > 5 ? 0 : undefined}><IconList items={section.items.slice().sort((a, b) => a.displayOrder - b.displayOrder)} divided className={styles.list} /></div>}</div></section>);

  const defaultBreadcrumb = [
    { label: 'Home', href: '/' },
    { label: 'Academics', href: '/our-academics/aicte-pgdm-courses-in-mumbai/' },
    { label: page.title },
  ];
  const overviewFacts = [
    { label: 'Duration', value: '2 Years' },
    { label: 'Study Mode', value: 'Full Time' },
    { label: 'Location', value: 'Andheri, Mumbai' },
  ];
  const renderIconList = (items: { icon: string; iconSize: number; text: string }[], label: string) => {
    const list = <IconList items={items} divided className={styles.list} />;
    return items.length > 5 ? (
      <div className={styles.listViewport} role="region" aria-label={`${label} list`} tabIndex={0}>
        {list}
      </div>
    ) : list;
  };

  return (
    <div className={layout.page}>
      <PageHero
        size="inner"
        slides={[closingContent.hero]}
        breadcrumb={closingContent.breadcrumb ?? defaultBreadcrumb}
        actions={<><Button href={APPLY_PATH}>Apply Now</Button><Button variant="arrow" href={ENQUIRY_ANCHOR}>Enquire now</Button></>}
      />
      <AcademicsTabs tabs={closingContent.tabs.links.filter(({ anchor }) => !(['financial-management-specialisation', 'mba-pgdm-in-human-resources-mumbai', 'mba-in-marketing-mumbai'].includes(slug) && ['specialisation-curriculum', 'admission-procedure'].includes(anchor))).map(({ label, anchor }) => ({ label, id: anchor }))} />
      <div className={`${layout.layout} ${styles.layout}`}>
        <aside className={`${layout.sidebar} ${styles.sidebar}`} aria-label={`${page.title} overview`}>
          <AtAGlance
            title={closingContent.glance.title}
            facts={closingContent.glance.facts.length ? closingContent.glance.facts : overviewFacts}
            applyText={closingContent.glance.buttonText}
            applyHref={closingContent.glance.buttonHref}
            brochureText={closingContent.glance.brochureText}
            brochureHref={closingContent.glance.brochureHref}
            contactText={closingContent.glance.contactText}
            contactHref={closingContent.glance.contactHref}
            showActions={false}
          />
        </aside>
        <main className={layout.main}>
          {sectionsAt(1)}
          <div id="about-program" className={layout.block}>
            <section id="overview" className={styles.section}>
              <SectionHeading eyebrow={closingContent.overview.eyebrow} title={closingContent.overview.title} />
              <div className={styles.paragraph} dangerouslySetInnerHTML={{ __html: closingContent.overview.body }} />
            </section>
          </div>
          {sectionsAt(2)}
          {closingContent.why && <section id="why-specialisation" className={`${layout.block} ${styles.section}`}>
            <SectionHeading title={closingContent.why.title} />
            {closingContent.why.intro && <div className={styles.paragraph} dangerouslySetInnerHTML={{ __html: closingContent.why.intro }} />}
            {closingContent.why.itemsTitle && <h3>{closingContent.why.itemsTitle}</h3>}
            {closingContent.why.itemsIntro && <div className={styles.paragraph} dangerouslySetInnerHTML={{ __html: closingContent.why.itemsIntro }} />}
            {slug === 'mba-in-marketing-mumbai' && closingContent.why.items.length > 5 ? (
              <div className={layout.customListViewport} role="region" aria-label={`${closingContent.why.title} list`} tabIndex={0}>
                <IconList items={closingContent.why.items} divided className={styles.list} />
              </div>
            ) : <IconList items={closingContent.why.items} divided className={styles.list} />}
            {closingContent.why.outro && <div className={styles.paragraph} dangerouslySetInnerHTML={{ __html: closingContent.why.outro }} />}
          </section>}
          {sectionsAt(3)}
          {closingContent.careers && <section id="career-opportunities" className={`${layout.block} ${styles.section}`}>
            <SectionHeading title={closingContent.careers.title} />
            <div className={styles.paragraph} dangerouslySetInnerHTML={{ __html: closingContent.careers.intro }} />
            {renderIconList(closingContent.careers.roles, 'Career opportunities')}
            {closingContent.careers.employers && <div className={styles.paragraph} dangerouslySetInnerHTML={{ __html: closingContent.careers.employers }} />}
          </section>}
          {sectionsAt(4)}
          {closingContent.curriculum && <section id="specialisation-curriculum" className={`${layout.block} ${styles.section}`}>
            <SectionHeading title={closingContent.curriculum.title} />
            <div className={styles.paragraph} dangerouslySetInnerHTML={{ __html: closingContent.curriculum.intro }} />
            {closingContent.curriculum.moduleTitle && <h3>{closingContent.curriculum.moduleTitle}</h3>}
            {renderIconList(closingContent.curriculum.subjects, 'Curriculum subjects')}
          </section>}
          {sectionsAt(5)}
          {closingContent.admission && <section id="admission-procedure" className={`${layout.block} ${styles.section}`}>
            <SectionHeading title={closingContent.admission.title} />
            <IconList items={closingContent.admission.steps} ordered divided className={layout.steps} />
          </section>}
          {sectionsAt(6)}
        </main>
      </div>
      <AcademicClosingSections
        scope={slug}
        faq={closingContent.faq}
        internships={closingContent.internships.items}
        internshipTitle={closingContent.internships.title}
        testimonials={closingContent.testimonials.items}
        testimonialHeading={closingContent.testimonials}
      />
    </div>
  );
}
