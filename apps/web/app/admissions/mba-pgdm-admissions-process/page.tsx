import type { Metadata } from 'next';
import { Button } from '@/components/ui/Button';
import { AdmissionsPageShell, AdmissionSection } from '../AdmissionsPageShell';
import { APPLY_PATH } from '@/content/site';
import styles from '../Admissions.module.css';
import { withSeo } from '@/lib/seo';
import { getAdmissionsPageContent, cmsString } from '@/lib/cms-content';

const metadata: Metadata = {
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

export async function generateMetadata(): Promise<Metadata> {
  return withSeo('/admissions/mba-pgdm-admissions-process/', metadata);
}

export default async function AdmissionsProcessPage() {
  const content = await getAdmissionsPageContent('mba-pgdm-admissions-process');
  const eligibilityContent = content?.sections.eligibility;
  const eligibilityItems = Array.isArray(eligibilityContent?.items) ? eligibilityContent.items as {label:string;detail:string}[] : eligibility.map(([label, detail]) => ({label, detail}));
  const stepsContent = content?.sections.steps;
  const stepItems = Array.isArray(stepsContent?.items) ? stepsContent.items as {title:string;text:string}[] : steps.map(([title,text]) => ({title,text}));
  const cta = content?.sections['apply-cta'];
  return <AdmissionsPageShell title="PGDM Admissions 2026 at VSM" subtitle="Embark on a Journey of Excellence" active="Admissions Process" content={content}>
    <AdmissionSection title={cmsString(eligibilityContent?.title, 'Eligibility Criteria')}>
      <ul className={styles.list} role="list">{eligibilityItems.map(({label, detail}, i) => <li key={`${label}-${i}`}><span className={styles.marker} aria-hidden>{i + 1}</span><p><strong>{label}:</strong> {detail}</p></li>)}</ul>
    </AdmissionSection>
    <AdmissionSection title={cmsString(stepsContent?.title, 'Steps to Apply')}>
      <div className={styles.stepGrid}>{stepItems.map(({title, text}, i) => <article key={`${title}-${i}`} className={styles.step}><span className={styles.marker} aria-hidden>{i + 1}</span><h3>{title}</h3><p>{text}</p></article>)}</div>
    </AdmissionSection>
    <AdmissionSection title={cmsString(cta?.title, 'Begin Your Management Journey – Apply Now')}>
      <p className={styles.lead} dangerouslySetInnerHTML={{ __html: cmsString(cta?.lead, '<p>Take the first step toward your management career. Complete the application form to get started.</p>') }} />
      <div className={styles.actions}><Button href={APPLY_PATH}>Complete Application Form</Button><Button variant="arrow" href="/contact-us/">Contact Admissions</Button></div>
    </AdmissionSection>
  </AdmissionsPageShell>;
}
