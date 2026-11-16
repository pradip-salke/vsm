import type { Metadata } from 'next';
import { AboutPageShell, AboutSection } from '../AboutPageShell';
import { ProfileGrid } from '../AboutComponents';
import { boardMembers } from '@/content/about';
import styles from '../about.module.css';
import { withSeo } from '@/lib/seo';
import { getAboutPageContent, cmsProfiles } from '@/lib/cms-content';

const metadata: Metadata = { title: 'Academic Advisory Board', description: 'Meet the academic and industry leaders on the VSM Academic Advisory Board.', alternates: { canonical: '/about-us/academic-advisory-board/' } };

export async function generateMetadata(): Promise<Metadata> {
  return withSeo('/about-us/academic-advisory-board/', metadata);
}

export default async function AcademicAdvisoryBoardPage() {
  const cms = await getAboutPageContent('academic-advisory-board');
  const section = cms?.sections.board;
  const profiles = cmsProfiles(section?.profiles, boardMembers).map((profile) => ({ ...profile, image: typeof profile.image === 'string' ? profile.image : profile.image?.src }));
  return <AboutPageShell title="Academic Advisory Board" active="Academic Advisory Board" pageSlug="academic-advisory-board">
    <AboutSection title={typeof section?.title === 'string' ? section.title : 'Academic Advisory Board'}><ProfileGrid profiles={profiles} advisory facultyStyle className={styles.advisoryBoardGrid} /></AboutSection>
  </AboutPageShell>;
}
