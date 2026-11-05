import type { Metadata } from 'next';
import { AdmissionsPageShell, AdmissionSection } from '../AdmissionsPageShell';
import { AdmissionsApplicationForm } from './AdmissionsApplicationForm';
import { FaqList, type FaqItem } from '@/components/sections/FaqSection';
import faqStyles from '@/components/sections/FaqSection.module.css';
import styles from '../Admissions.module.css';

export const metadata: Metadata = {
  title: 'PGDM Application Form 2026',
  description: 'Apply for the 2026–28 PGDM programme at Valia School of Management.',
  alternates: { canonical: '/admissions/application-form/' },
};

const faqs: FaqItem[] = [
  { question: 'What is the PGDM admission process at VSM?', answer: <>Beginning your PGDM journey at Valia School of Management is an organized and smooth process. Follow these simple steps to secure your place in our prestigious PGDM program:<ol><li><strong>Step 1: ONLINE APPLICATION:</strong> Complete the online application form on the VSM website.</li><li><strong>Step 2: SUBMIT DOCUMENTS:</strong> Upload necessary academic and entrance exam score documents.</li><li><strong>Step 3: APPLICATION REVIEW:</strong> The admissions team will review your application.</li><li><strong>Step 4: INTERVIEW ROUND:</strong> Shortlisted candidates will be invited for a personal interview.</li><li><strong>Step 5: ADMISSION OFFER:</strong> Successful candidates will receive an admission offer letter.</li></ol></> },
  { question: 'What is PGDM eligibility at VSM?', answer: <>PGDM course eligibility requires a bachelor’s degree from a recognized university and a minimum of 50% valid score in a management entrance exam such as CAT, CMAT, MAT, XAT, ATMA, or MAH MBA CET.</> },
  { question: 'Is the PGDM program officially recognized under AICTE?', answer: <>Yes, the PGDM program is approved by AICTE.</> },
  { question: 'What are the specializations being offered in PGDM at VSM?', answer: <>The specializations offered by VSM under PGDM are Marketing, Finance, HR, Business Analytics, Operations &amp; Supply Chain Management.</> },
  { question: 'Is PGDM a 2 year course?', answer: <>Yes, the PGDM programs at VSM are two-year full-time programs, comprising four semesters (2 semesters per year). Students complete classroom learning, internships, and industry projects during this period.</> },
];

export default function ApplicationFormPage() {
  return <AdmissionsPageShell title="PGDM Application Form – 2026" subtitle="Begin Your Management Journey – Apply Now" active="Application Form">
    <AdmissionSection title="PGDM Admission 2026–28 | Apply Now" className={styles.applicationFormSection}><h3 className={styles.subheading}>Application Form</h3><AdmissionsApplicationForm /></AdmissionSection>
    <AdmissionSection title="FAQs" className={faqStyles.section} titleClassName={faqStyles.title}>
      <FaqList items={faqs} />
    </AdmissionSection>
  </AdmissionsPageShell>;
}
