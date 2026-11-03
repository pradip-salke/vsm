import type { Metadata } from 'next';
import { PageHero } from '@/components/sections/PageHero';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { academicsHero } from '@/content/academics';
import { facultyDirectory } from '@/content/faculty-directory';
import { AcademicsTabs } from '@/features/academics/AcademicsTabs';
import layout from '@/features/academics/AcademicsLayout.module.css';
import styles from './FacultyPage.module.css';

export const metadata: Metadata = {
  title: { absolute: 'Teaching Faculty | Valia School of Management' },
  description: 'Meet the experienced academic and industry faculty at Valia School of Management.',
  alternates: { canonical: '/faculty/' },
};

const tabs = [
  { label: 'Our Faculty', id: 'our-faculty' },
  { label: 'Teaching & Industry Experience', id: 'faculty-experience' },
];

export default function FacultyPage() {
  return (
    <div className={layout.page}>
      <PageHero
        size="inner"
        slides={[{ ...academicsHero, title: 'Teaching Faculty', subtitle: 'Mentors Crafting Tomorrow’s Leaders' }]}
        breadcrumb={[{ label: 'Home', href: '/' }, { label: 'Academics', href: '/our-academics/aicte-pgdm-courses-in-mumbai/' }, { label: 'Teaching Faculty' }]}
        actions={<a className={styles.heroLink} href="#our-faculty">Meet Our Faculty <span aria-hidden="true">↓</span></a>}
      />
      <AcademicsTabs tabs={tabs} />
      <div className={`${layout.layout} ${styles.layout}`}>
        <aside className={`${layout.sidebar} ${styles.sidebar}`} aria-label="Faculty overview">
          <div className={styles.summary}>
            <p className={styles.eyebrow}>Academic Excellence</p>
            <h2>Faculty at a Glance</h2>
            <p>Learn from educators and professionals with experience across management, finance, marketing, human resources, operations, and law.</p>
            <dl><div><dt>Profiles</dt><dd>{facultyDirectory.length}</dd></div><div><dt>Experience</dt><dd>Academic + Industry</dd></div></dl>
          </div>
        </aside>
        <main className={layout.main}>
          <section id="our-faculty" className={`${layout.block} ${styles.section}`}>
            <SectionHeading eyebrow="Masters of Their Craft, Mentors for the Future" title="Meet Our Industry-Oriented PGDM Faculty">
              <p>At Valia School of Management, our faculty brings academic knowledge and practical experience to the classroom. Their industry backgrounds and teaching experience help students connect management concepts with real business situations.</p>
            </SectionHeading>
            <div className={styles.grid}>
              {facultyDirectory.map((member) => (
                <article className={styles.card} key={member.name}>
                  <div className={styles.avatar} aria-hidden="true">{member.name.split(' ').filter((part) => !['Prof.', 'Dr.'].includes(part)).slice(0, 2).map((part) => part[0]).join('')}</div>
                  <h2>{member.name}</h2>
                  <p className={styles.expertise}>{member.expertise}</p>
                  <dl className={styles.details}>
                    <div><dt>Experience</dt><dd>{member.experience}</dd></div>
                    <div><dt>Position</dt><dd>{member.role}</dd></div>
                    {member.previous && <div><dt>Previous experience</dt><dd>{member.previous}</dd></div>}
                    {member.organisations && <div><dt>Organisations</dt><dd>{member.organisations}</dd></div>}
                    {member.academic && <div><dt>Academic assignments</dt><dd>{member.academic}</dd></div>}
                  </dl>
                </article>
              ))}
            </div>
          </section>
          <section id="faculty-experience" className={`${layout.block} ${styles.section}`}>
            <SectionHeading title="Teaching Meets Industry Experience" />
            <p className={styles.closing}>Our faculty brings perspectives from business, finance, marketing, human resources, operations, law, and higher education. This mix supports case-based teaching and helps students understand how management decisions work in practice.</p>
          </section>
        </main>
      </div>
    </div>
  );
}
