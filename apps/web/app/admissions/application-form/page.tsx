import type { Metadata } from 'next';
import { AdmissionsPageShell, AdmissionSection } from '../AdmissionsPageShell';
import { AdmissionsApplicationForm } from './AdmissionsApplicationForm';
import { FaqSection } from '@/components/sections/FaqSection';
import styles from '../Admissions.module.css';
import { withSeo } from '@/lib/seo';
import { getAdmissionsPageContent, cmsString } from '@/lib/cms-content';

const metadata: Metadata = {
  title: 'PGDM Application Form 2026',
  description: 'Apply for the 2026–28 PGDM programme at Valia School of Management.',
  alternates: { canonical: '/admissions/application-form/' },
};

export async function generateMetadata(): Promise<Metadata> {
  return withSeo('/admissions/application-form/', metadata);
}

export default async function ApplicationFormPage() {
  const content = await getAdmissionsPageContent('application-form');
  const formSection = content?.sections['form-section'];
  const faqSection = content?.sections.faq;
  const cmsFaqs = Array.isArray(faqSection?.items) ? faqSection.items as {question:string;answer:string}[] : [];
  const renderedFaqs = cmsFaqs.map((faq) => ({ question: faq.question, answer: <div dangerouslySetInnerHTML={{ __html: faq.answer }} /> }));
  const faqContent = renderedFaqs.length ? {
    title: cmsString(faqSection?.title, 'FAQs'),
    eyebrow: '',
    description: '',
    items: renderedFaqs,
  } : undefined;
  return <AdmissionsPageShell title="PGDM Application Form – 2026" subtitle="Begin Your Management Journey – Apply Now" active="Application Form" content={content}>
    <AdmissionSection title={cmsString(formSection?.title, 'PGDM Admission 2026–28 | Apply Now')} className={styles.applicationFormSection}><h3 className={styles.subheading}>{cmsString(formSection?.subheading, 'Application Form')}</h3><AdmissionsApplicationForm /></AdmissionSection>
    <FaqSection content={faqContent} className={styles.applicationFaq} />
  </AdmissionsPageShell>;
}
