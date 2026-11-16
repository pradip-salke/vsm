import type { Metadata } from 'next';
import { AboutPageShell, AboutSection } from '../AboutPageShell';
import { MessageBlock } from '../AboutComponents';
import { trusteeMessages } from '@/content/about';
import styles from '../about.module.css';
import { withSeo } from '@/lib/seo';
import { getAboutPageContent, cmsString } from '@/lib/cms-content';

const metadata: Metadata = { title: 'Message From Trustee', description: 'Messages from the President and Trustees of Cosmopolitan Education Society.', alternates: { canonical: '/about-us/trustee-message/' } };

export async function generateMetadata(): Promise<Metadata> {
  return withSeo('/about-us/trustee-message/', metadata);
}

export default async function TrusteeMessagePage() {
  const cms = await getAboutPageContent('trustee-message');
  const section = cms?.sections.messages;
  const messages = Array.isArray(section?.items) ? section.items as { name?: string; role?: string; image: string | { src: string; alt?: string }; body?: string }[] : trusteeMessages.map((message) => ({ ...message, body: message.paragraphs.map((text) => `<p>${text}</p>`).join('') }));
  return <AboutPageShell title="Message From Trustee" active="Trustee’s Message" trusteeMessages pageSlug="trustee-message">
    <AboutSection title={cmsString(section?.title, 'Message From Trustee')} className={styles.messagePageSection}>{messages.map((message) => <MessageBlock key={message.name} {...message} />)}</AboutSection>
  </AboutPageShell>;
}
