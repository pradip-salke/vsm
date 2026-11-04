import type { Metadata } from 'next';
import { AboutPageShell, AboutSection } from '../AboutPageShell';
import { ProfileGrid } from '../AboutComponents';
import { boardMembers } from '@/content/about';

export const metadata: Metadata = { title: 'Academic Advisory Board', description: 'Meet the academic and industry leaders on the VSM Academic Advisory Board.', alternates: { canonical: '/about-us/academic-advisory-board/' } };

export default function AcademicAdvisoryBoardPage() {
  return <AboutPageShell title="Academic Advisory Board" active="Academic Advisory Board">
    <AboutSection title="Academic Advisory Board"><ProfileGrid profiles={boardMembers} advisory facultyStyle /></AboutSection>
  </AboutPageShell>;
}
