import type { Metadata } from 'next';
import { AboutPageShell, AboutSection } from '../AboutPageShell';
import { MessageBlock } from '../AboutComponents';
import { trusteeMessages } from '@/content/about';

export const metadata: Metadata = { title: 'Message From Trustee', description: 'Messages from the President and Trustees of Cosmopolitan Education Society.', alternates: { canonical: '/about-us/trustee-message/' } };

export default function TrusteeMessagePage() {
  return <AboutPageShell title="Message From Trustee" active="Trustee’s Message">
    <AboutSection title="Message From Trustee">{trusteeMessages.map((message) => <MessageBlock key={message.name} {...message} />)}</AboutSection>
  </AboutPageShell>;
}
