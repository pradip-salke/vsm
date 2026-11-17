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
      <AcademicsTabs tabs={closingContent.tabs.links.map(({ label, anchor }) => ({ label, id: anchor }))} />
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
          <div id="about-program" className={layout.block}>
            <section id="overview" className={styles.section}>
              <SectionHeading eyebrow={closingContent.overview.eyebrow} title={closingContent.overview.title} />
              <div className={styles.paragraph} dangerouslySetInnerHTML={{ __html: closingContent.overview.body }} />
            </section>
          </div>
          <section id="why-specialisation" className={`${layout.block} ${styles.section}`}>
            <SectionHeading title={closingContent.why.title} />
            <IconList items={closingContent.why.items} divided className={styles.list} />
          </section>
          <section id="career-opportunities" className={`${layout.block} ${styles.section}`}>
            <SectionHeading title={closingContent.careers.title} />
            <div className={styles.paragraph} dangerouslySetInnerHTML={{ __html: closingContent.careers.intro }} />
            {renderIconList(closingContent.careers.roles, 'Career opportunities')}
          </section>
          <section id="specialisation-curriculum" className={`${layout.block} ${styles.section}`}>
            <SectionHeading title={closingContent.curriculum.title} />
            <div className={styles.paragraph} dangerouslySetInnerHTML={{ __html: closingContent.curriculum.intro }} />
            {renderIconList(closingContent.curriculum.subjects, 'Curriculum subjects')}
          </section>
          <section id="admission-procedure" className={`${layout.block} ${styles.section}`}>
            <SectionHeading title={closingContent.admission.title} />
            <IconList items={closingContent.admission.steps} ordered divided className={layout.steps} />
          </section>
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
