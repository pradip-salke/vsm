import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { PageHero } from '@/components/sections/PageHero';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { IconList } from '@/components/sections/IconList';
import { academicSpecialisations, specialisationHero, specialisationTabs } from '@/content/academic-specialisations';
import { admissionSteps } from '@/content/academics';
import { APPLY_PATH, ENQUIRY_ANCHOR } from '@/content/site';
import { AcademicsTabs } from '@/features/academics/AcademicsTabs';
import { AtAGlance } from '@/features/academics/AtAGlance';
import layout from '@/features/academics/AcademicsLayout.module.css';
import styles from './SpecialisationPage.module.css';

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return academicSpecialisations.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const page = academicSpecialisations.find((item) => item.slug === slug);
  return page ? {
    title: { absolute: `${page.heroTitle} | Valia School of Management` },
    description: `Explore the ${page.title} PGDM specialisation at Valia School of Management, including its curriculum, career opportunities and admission information.`,
    alternates: { canonical: `/our-academics/in-demand-specialisations/${page.slug}/` },
  } : { title: 'Academic Specialisation | Valia School of Management' };
}

export default async function SpecialisationPage({ params }: Props) {
  const { slug } = await params;
  const page = academicSpecialisations.find((item) => item.slug === slug);
  if (!page) notFound();

  const breadcrumb = [
    { label: 'Home', href: '/' },
    { label: 'Academics', href: '/our-academics/aicte-pgdm-courses-in-mumbai/' },
    { label: page.title },
  ];
  const overviewFacts = [
    { label: 'Programme', value: 'PGDM' },
    { label: 'Duration', value: '2 Years' },
    { label: 'Study Mode', value: 'Full Time' },
    { label: 'Location', value: 'Andheri, Mumbai' },
  ];
  const listItems = (items: string[]) => items.map((text) => ({ icon: '/images/figma/icon-neutral.svg', iconSize: 32, text }));
  const renderIconList = (items: string[], label: string) => {
    const list = <IconList items={listItems(items)} className={styles.list} />;
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
        slides={[specialisationHero(page.heroTitle)]}
        breadcrumb={breadcrumb}
        actions={<><Button href={APPLY_PATH}>Apply Now</Button><Button variant="arrow" href={ENQUIRY_ANCHOR}>Enquire now</Button></>}
      />
      <AcademicsTabs tabs={specialisationTabs} />
      <div className={`${layout.layout} ${styles.layout}`}>
        <aside className={`${layout.sidebar} ${styles.sidebar}`} aria-label={`${page.title} overview`}>
          <AtAGlance facts={overviewFacts} showActions={false} />
        </aside>
        <main className={layout.main}>
          <section id="overview" className={`${layout.block} ${styles.section}`}>
            <SectionHeading eyebrow="PGDM Specialisation" title={`PGDM in ${page.title}`} />
            {page.overview.map((paragraph) => <p className={styles.paragraph} key={paragraph}>{paragraph}</p>)}
          </section>
          <section id="why-specialisation" className={`${layout.block} ${styles.section}`}>
            <SectionHeading title={`Why Choose PGDM in ${page.title}?`} />
            {renderIconList(page.reasons, 'Reasons to choose this specialisation')}
          </section>
          <section id="career-opportunities" className={`${layout.block} ${styles.section}`}>
            <SectionHeading title={`Careers in ${page.title}`} />
            <p className={styles.paragraph}>The PGDM specialisation combines management fundamentals with applied learning to prepare students for opportunities across industries.</p>
            {renderIconList(page.roles, 'Career opportunities')}
          </section>
          <section id="specialisation-curriculum" className={`${layout.block} ${styles.section}`}>
            <SectionHeading title={`${page.title} Curriculum`} />
            <p className={styles.paragraph}>Alongside the common PGDM foundation, students study specialisation-focused subjects and apply their learning through projects and industry exposure.</p>
            {renderIconList(page.subjects, 'Curriculum subjects')}
          </section>
          <section id="admission-procedure" className={`${layout.block} ${styles.section}`}>
            <SectionHeading title="PGDM Admission Procedure" />
            <IconList items={admissionSteps} ordered divided className={layout.steps} />
            <Button href={APPLY_PATH} className={styles.apply}>Apply for PGDM</Button>
          </section>
        </main>
      </div>
    </div>
  );
}
