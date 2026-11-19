import type { Metadata } from 'next';
import { PlacementPageShell, PlacementSection } from '../placements/PlacementPageShell';
import { withSeo } from '@/lib/seo';
import { getPlacementsPageContent, cmsString } from '@/lib/cms-content';

const metadata: Metadata = {
  title: 'Recruitment Enquiry',
  description: 'Contact Valia School of Management with your questions, suggestions and feedback.',
  alternates: { canonical: '/connect-with-us/' },
};

export async function generateMetadata(): Promise<Metadata> {
  return withSeo('/connect-with-us/', metadata);
}

export default async function ConnectWithUsPage() {
  const cms = await getPlacementsPageContent('connect-with-us');
  const contact = cms?.sections.contact;
  const title = 'Recruitment Enquiry';
  const emails = Array.isArray(contact?.emails) ? contact.emails.filter((item): item is string => typeof item === 'string' && Boolean(item.trim())) : [];
  const phones = Array.isArray(contact?.phones) ? contact.phones.filter((item): item is string => typeof item === 'string' && Boolean(item.trim())) : [];

  return (
    <PlacementPageShell title={title} active={title} activeHref="/connect-with-us/" pageSlug="connect-with-us">
      <PlacementSection title={cmsString(contact?.title)} eyebrow={cmsString(contact?.eyebrow)}>
        {cmsString(contact?.body) && <p>{cmsString(contact?.body)}</p>}
        {emails.length > 0 && <p><strong>{cmsString(contact?.emailLabel)}</strong> {emails.map((email, index) => <span key={`${email}-${index}`}>{index > 0 && ' · '}<a href={`mailto:${email}`}>{email}</a></span>)}</p>}
        {phones.length > 0 && <p><strong>{cmsString(contact?.phoneLabel)}</strong> {phones.map((phone, index) => <span key={`${phone}-${index}`}>{index > 0 && ' · '}<a href={`tel:${phone.replace(/[^+\d]/g, '')}`}>{phone}</a></span>)}</p>}
      </PlacementSection>
    </PlacementPageShell>
  );
}
