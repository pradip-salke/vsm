import type { Metadata } from 'next';
import { AboutPageShell, AboutSection } from '../AboutPageShell';
import { CmsHtml } from '../AboutComponents';
import styles from '../about.module.css';
import { withSeo } from '@/lib/seo';
import { getAboutPageContent, cmsString } from '@/lib/cms-content';

const metadata: Metadata = { title: 'Student Residence', description: 'Student accommodation information for Valia School of Management students.', alternates: { canonical: '/about-us/student-residence/' } };

export async function generateMetadata(): Promise<Metadata> {
  return withSeo('/about-us/student-residence/', metadata);
}

export default async function StudentResidencePage() {
  const cms = await getAboutPageContent('student-residence');
  const content = cms?.sections.content;
  const fallback = '<p>Student living is not your everyday life in Mumbai. It’s your second home. VSM has tied-up with one of the finest student residence providers – Stanza Living, a professionally managed accommodation for students.</p><p>For further details, refer to the <a href="https://vsmedu.com/wp-content/uploads/2024/09/VSM-AICTE-PGDM-Brochure.pdf" rel="noreferrer">VSM PGDM brochure (PDF)</a>.</p>';
  return <AboutPageShell title="Student Residence" active="Student Residence" pageSlug="student-residence">
    <AboutSection title={cmsString(content?.title, 'Student Residence')}>
      <CmsHtml html={cmsString(content?.body, fallback)} className={styles.copy} />
    </AboutSection>
  </AboutPageShell>;
}
