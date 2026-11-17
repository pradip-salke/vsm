import type { Metadata } from 'next';
import { AboutPageShell, AboutSection } from '../AboutPageShell';
import { ProfileGrid, CmsHtml } from '../AboutComponents';
import { affiliationIntro, aimaPastPresidents, industryLeaders } from '@/content/about';
import { withSeo } from '@/lib/seo';
import { getAboutPageContent, cmsProfiles, cmsString } from '@/lib/cms-content';

const metadata: Metadata = { title: 'Affiliation & Industry Leadership', description: 'Explore VSM affiliations and the leaders of the All India Management Association.', alternates: { canonical: '/about-us/affiliation-industry-leadership/' } };

export async function generateMetadata(): Promise<Metadata> {
  return withSeo('/about-us/affiliation-industry-leadership/', metadata);
}

export default async function AffiliationPage() {
  const cms = await getAboutPageContent('affiliation-industry-leadership');
  const intro = cms?.sections.intro;
  const leaderSection = cms?.sections.leaders;
  const pastSection = cms?.sections['past-presidents'];
  const profiles = (value: unknown, fallback: typeof industryLeaders) => cmsProfiles(value, fallback).map((profile) => ({ ...profile, image: typeof profile.image === 'string' ? profile.image : profile.image?.src }));
  const leaders = profiles(leaderSection?.profiles, industryLeaders);
  const pastPresidents = profiles(pastSection?.profiles, aimaPastPresidents);
  return <AboutPageShell title="Affiliation & Industry Leadership" active="Affiliation & Industry Leadership" pageSlug="affiliation-industry-leadership">
    <AboutSection title={cmsString(intro?.title, 'Affiliation and Industry Leadership at Valia School of Management')}><CmsHtml html={cmsString(intro?.body, affiliationIntro.map((text) => `<p>${text}</p>`).join(''))} /></AboutSection>
    {leaderSection?.enabled !== false && leaders.length > 0 && <AboutSection title={cmsString(leaderSection?.title, 'Industry Leadership')}><ProfileGrid profiles={leaders} advisory facultyStyle /></AboutSection>}
    {pastSection?.enabled !== false && pastPresidents.length > 0 && <AboutSection title={cmsString(pastSection?.title, 'AIMA Past Presidents - A Decade of Exemplary Leadership')}><ProfileGrid profiles={pastPresidents} compact advisory facultyStyle /></AboutSection>}
  </AboutPageShell>;
}
