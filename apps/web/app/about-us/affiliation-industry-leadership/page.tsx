import type { Metadata } from 'next';
import { AboutPageShell, AboutSection } from '../AboutPageShell';
import { ProfileGrid, AboutCopy } from '../AboutComponents';
import { affiliationIntro, aimaPastPresidents, industryLeaders } from '@/content/about';
import { withSeo } from '@/lib/seo';

const metadata: Metadata = { title: 'Affiliation & Industry Leadership', description: 'Explore VSM affiliations and the leaders of the All India Management Association.', alternates: { canonical: '/about-us/affiliation-industry-leadership/' } };

export async function generateMetadata(): Promise<Metadata> {
  return withSeo('/about-us/affiliation-industry-leadership/', metadata);
}

export default function AffiliationPage() {
  return <AboutPageShell title="Affiliation & Industry Leadership" active="Affiliation & Industry Leadership">
    <AboutSection title="Affiliation and Industry Leadership at Valia School of Management"><AboutCopy paragraphs={affiliationIntro} /></AboutSection>
    <AboutSection title="Industry Leadership"><ProfileGrid profiles={industryLeaders} advisory facultyStyle /></AboutSection>
    <AboutSection title="AIMA Past Presidents - A Decade of Exemplary Leadership"><ProfileGrid profiles={aimaPastPresidents} compact advisory facultyStyle /></AboutSection>
  </AboutPageShell>;
}
