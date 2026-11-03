import type { Metadata } from 'next';
import { Button } from '@/components/ui/Button';
import { AdmissionsPageShell, AdmissionSection } from '../AdmissionsPageShell';
import { APPLY_PATH } from '@/content/site';
import styles from '../Admissions.module.css';

export const metadata: Metadata = {
  title: 'PGDM Admissions 2026 at VSM',
  description: 'Eligibility criteria and application steps for the PGDM admissions process at Valia School of Management.',
  alternates: { canonical: '/admissions/mba-pgdm-admissions-process/' },
};

const eligibility = [
  ['Graduation', 'A bachelor’s degree from a recognized university.'],
  ['Minimum Score', 'At least 50% aggregate in graduation (45% for reserved categories).'],
  ['Entrance Exams', 'Valid scores in CAT, MAT, XAT, ATMA, MHCET, CMAT or equivalent management entrance tests.'],
  ['Final Year Students', 'Those in the final year of graduation can apply provisionally.'],
];
const steps = [
  ['Online Application', 'Complete the online application form on the VSM website.'],
  ['Submit Documents', 'Upload necessary academic and entrance exam score documents.'],
  ['Application Review', 'The admissions team will review your application.'],
  ['Interview Round', 'Shortlisted candidates will be invited for a personal interview.'],
  ['Admission Offer', 'Successful candidates will receive an admission offer letter.'],
];

export default function AdmissionsProcessPage() {
  return <AdmissionsPageShell title="PGDM Admissions 2026 at VSM" subtitle="Embark on a Journey of Excellence" active="Admissions Process">
    <AdmissionSection title="Eligibility Criteria">
      <ul className={styles.list} role="list">{eligibility.map(([label, text], i) => <li key={label}><span className={styles.marker} aria-hidden>{i + 1}</span><p><strong>{label}:</strong> {text}</p></li>)}</ul>
    </AdmissionSection>
    <AdmissionSection title="Steps to Apply">
      <div className={styles.stepGrid}>{steps.map(([title, text], i) => <article key={title} className={styles.step}><span className={styles.marker} aria-hidden>{i + 1}</span><h3>{title}</h3><p>{text}</p></article>)}</div>
    </AdmissionSection>
    <AdmissionSection title="Begin Your Management Journey – Apply Now">
      <p className={styles.lead}>Take the first step toward your management career. Complete the application form to get started.</p>
      <div className={styles.actions}><Button href={APPLY_PATH}>Complete Application Form</Button><Button variant="arrow" href="mailto:admissions@vsmedu.in">Contact Admissions</Button></div>
    </AdmissionSection>
  </AdmissionsPageShell>;
}
