import type { Metadata } from 'next';
import Image from 'next/image';
import { Button } from '@/components/ui/Button';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { AcademicClosingSections } from '@/components/sections/AcademicClosingSections';
import { IconList } from '@/components/sections/IconList';
import { PageHero } from '@/components/sections/PageHero';
import { admissionSteps } from '@/content/academics';
import { AcademicsTabs } from '@/features/academics/AcademicsTabs';
import { AimaCourseModules } from '@/features/academics/AimaCourseModules';
import { AtAGlance } from '@/features/academics/AtAGlance';
import { APPLY_PATH, ENQUIRY_ANCHOR } from '@/content/site';
import {
  aimaBreadcrumb,
  aimaExitAwardItems,
  aimaFees,
  aimaHero,
  aimaOtherDetailItems,
  aimaProgramStructureItems,
  aimaSpecialisationItems,
  aimaTabs,
  aimaWhyItems,
} from '@/content/aima-pgdm';
import layout from '@/features/academics/AcademicsLayout.module.css';
import blocks from '@/features/academics/AcademicsBlocks.module.css';
import styles from './AimaPgdmPage.module.css';

export const metadata: Metadata = {
  title: { absolute: 'AIMA PGDM in Mumbai | Valia School of Management' },
  description: 'Explore the AIMA-Centre for Management Education PGDM at Valia School of Management, including course modules, specialisations, fees and program details.',
  alternates: { canonical: '/our-academics/aima-pgdm/' },
};

const aimaGlance = [
  { label: 'Duration', value: '2 Years' },
  { label: 'Study Mode', value: 'Blended' },
  { label: 'Total Fees', value: 'INR 4 Lakhs' },
];

export default function AimaPgdmPage() {
  return (
    <div className={layout.page}>
      <PageHero
        size="inner"
        slides={[aimaHero]}
        breadcrumb={aimaBreadcrumb}
        actions={
          <>
            <Button href={APPLY_PATH}>Apply Now</Button>
            <Button variant="arrow" href={ENQUIRY_ANCHOR}>Enquire now</Button>
          </>
        }
      />
      <AcademicsTabs tabs={aimaTabs} />

      <div className={layout.layout}>
        <aside className={layout.sidebar} aria-label="AIMA PGDM summary">
          <AtAGlance facts={aimaGlance} />
        </aside>

        <div className={layout.main}>
          <div id="about-program" className={`${layout.block} ${styles.aboutProgram}`}>
          <section id="about-vsm" className={styles.sectionLead}>
            <SectionHeading eyebrow="About Program" title="About Valia School of Management" />
            <div className={blocks.prose}>
              <p>The Cosmopolitan Education Society, established in 1961, through VSM offers a transformative 2-year PGDM program as an AIMA – Centre for Management Education. This AICTE-approved program is designed to go beyond academic theory, providing a hands-on journey toward industry excellence.</p>
              <IconList items={aimaSpecialisationItems} divided className={styles.iconList} />
              <p>Our curriculum emphasizes practical learning through rigorous case studies and valuable guest sessions led by industry experts. This immersive approach equips students with deep management knowledge and essential skills to excel in today’s dynamic business world.</p>
              <p>Join us to experience one of the top AIMA-PGDM programs and launch your journey to success.</p>
            </div>
          </section>
          </div>

          <section id="about-aima" className={layout.block}>
            <SectionHeading title="About AIMA" />
            <div className={blocks.prose}>
              <p>The All India Management Association (AIMA) is the Voice of India’s Leaders and Managers, and the apex body of the management profession in India. AIMA is a not for profit, nonlobbying organization.</p>
              <h3 className={styles.subheading}>Why AIMA- Centre for Management Education?</h3>
              <IconList items={aimaWhyItems} divided className={styles.iconList} />
            </div>
          </section>

          <section id="about-pgdm" className={layout.block}>
            <SectionHeading title="About PGDM" />
            <div className={blocks.prose}>
              <p>PGDM – Post Graduate Diploma in Management is a two year programme approved by AICTE divided into 4 modules, with both traditional and new age specializations in HR, Marketing, Finance, Operations, IT, International business, Financial Research and valuation modelling, Digital Marketing, Business Analytics, Supply chain management and public procurement.</p>
              <p>One of the most prestigious programme offered in blended mode. AIMA-PGDM is designed with the objective of nurturing the competencies of working professional and fresh graduates aspiring to work. The curriculum is aligned to cover all the management specializations in the most-flexi learning and interactive way as per the industry needs. This programme allows students to balance the work life challenges and professional management commitments.</p>
            </div>
          </section>

          <section id="program-structure" className={layout.block}>
            <SectionHeading title="PGDM Program Structure" />
            <p className={styles.moduleNote}>4 Modules / Six Months each</p>
            <IconList items={aimaProgramStructureItems} divided className={styles.iconList} />
          </section>

          <section id="specialisations" className={layout.block}>
            <SectionHeading title="Specialisations" />
            <IconList items={aimaSpecialisationItems} divided className={styles.iconList} />
          </section>

          <div id="course-modules" className={layout.block}>
            <AimaCourseModules />
          </div>

          <section id="aima-fees" className={layout.block}>
            <SectionHeading title="AIMA PGDM Course Fees" />
            <div className={blocks.tableScroll} tabIndex={0}>
              <table className={`${blocks.table} ${blocks.feeTable}`}>
                <caption className="visually-hidden">AIMA PGDM course fees</caption>
                <thead><tr><th scope="col">Fee Particulars</th><th scope="col">Fee</th></tr></thead>
                <tbody>{aimaFees.map(([label, fee]) => <tr key={label}><th scope="row">{label}</th><td>{fee}</td></tr>)}</tbody>
              </table>
            </div>
          </section>

          <section id="other-details" className={layout.block}>
            <SectionHeading title="Other Details" />
            <div className={styles.otherDetailsViewport}>
              <IconList items={aimaOtherDetailItems} divided className={`${styles.iconList} ${styles.otherDetailsList}`} />
            </div>
            <h3 className={styles.subheading}>Multi Exit</h3>
            <IconList items={aimaExitAwardItems} divided className={styles.iconList} />
            <div className={styles.certificate}>
              <h3>PGDM Certificate</h3>
              <Image
                className={styles.certificateImage}
                src="https://vsmedu.com/wp-content/uploads/2024/01/pgdm_certificate.jpg"
                alt="AIMA PGDM Certificate"
                width={1452}
                height={1820}
                sizes="(max-width: 767px) 45vw, 160px"
              />
              <Button href={APPLY_PATH}>Apply Now</Button>
            </div>
          </section>

          <section id="admission-procedure" className={layout.block} aria-labelledby="admission-title">
            <SectionHeading id="admission-title" title="PGDM Admission Procedure" />
            <IconList items={admissionSteps} ordered divided className={layout.steps} />
          </section>
        </div>
      </div>
      <AcademicClosingSections />
    </div>
  );
}
