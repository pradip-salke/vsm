import type { Metadata } from 'next';
import { AboutPageShell, AboutSection } from '../AboutPageShell';
import { ProfileGrid } from '../AboutComponents';
import { boardMembers } from '@/content/about';
import styles from '../about.module.css';
import { withSeo } from '@/lib/seo';

const metadata: Metadata = { title: 'Academic Advisory Board', description: 'Meet the academic and industry leaders on the VSM Academic Advisory Board.', alternates: { canonical: '/about-us/academic-advisory-board/' } };

export async function generateMetadata(): Promise<Metadata> {
  return withSeo('/about-us/academic-advisory-board/', metadata);
}

export default function AcademicAdvisoryBoardPage() {
  return <AboutPageShell title="Academic Advisory Board" active="Academic Advisory Board">
    <AboutSection title="Academic Advisory Board"><ProfileGrid profiles={boardMembers} advisory facultyStyle className={styles.advisoryBoardGrid} /></AboutSection>
  </AboutPageShell>;
}
