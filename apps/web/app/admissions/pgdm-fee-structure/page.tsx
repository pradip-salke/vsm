import type { Metadata } from 'next';
import { AdmissionsPageShell, AdmissionSection } from '../AdmissionsPageShell';
import styles from '../Admissions.module.css';
import { withSeo } from '@/lib/seo';
import { getAdmissionsPageContent, cmsString, cmsParagraphs } from '@/lib/cms-content';

const metadata: Metadata = {
  title: 'PGDM Fees Structure 2026–28',
  description: 'PGDM program fee structure for 2026–28 at Valia School of Management.',
  alternates: { canonical: '/admissions/pgdm-fee-structure/' },
};

export async function generateMetadata(): Promise<Metadata> {
  return withSeo('/admissions/pgdm-fee-structure/', metadata);
}

export default async function FeesStructurePage() {
  const content = await getAdmissionsPageContent('pgdm-fee-structure');
  const intro = content?.sections.intro;
  const introParagraphs = cmsParagraphs(intro?.body, []);
  return <AdmissionsPageShell title="PGDM Fees Structure: Batch 2026–28" subtitle="Your Investment in World-Class Education" active="Fees Structure" content={content}>
    <AdmissionSection title={cmsString(intro?.title, 'PGDM Course Fees in Mumbai')}>
      {(introParagraphs.length ? introParagraphs : ['Discover the value of a transformative education at Valia School of Management. Our PGDM fee structure is designed to be clear and inclusive, ensuring that students from diverse backgrounds can plan their educational journey with confidence. At VSM, we believe in transparency and affordability, providing you with a detailed breakdown of costs for our PGDM and PGDM Dual Specialization programs.', 'Explore our detailed PGDM fee structure below, tailored for both Indian Nationals and International Students:']).map((paragraph, index) => <p key={index} className={index === 0 ? styles.lead : undefined}>{paragraph}</p>)}
      <p className={styles.note}>* INR 50,000 Scholarship for Valia College Students</p>
    </AdmissionSection>
  </AdmissionsPageShell>;
}
