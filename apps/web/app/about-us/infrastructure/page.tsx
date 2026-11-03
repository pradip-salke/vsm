import type { Metadata } from 'next';
import { AboutPageShell, AboutSection } from '../AboutPageShell';

export const metadata: Metadata = { title: 'Infrastructure', description: 'Infrastructure at Valia School of Management.', alternates: { canonical: '/about-us/infrastructure/' } };

export default function InfrastructurePage() {
  return <AboutPageShell title="Infrastructure" active="Infrastructure">
    <AboutSection title="Infrastructure">{null}</AboutSection>
  </AboutPageShell>;
}
