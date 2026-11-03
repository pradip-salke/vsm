import type { Metadata } from 'next';
import { PlacementPageShell, PlacementSection } from '../placements/PlacementPageShell';

export const metadata: Metadata = {
  title: 'Connect With Us',
  description: 'Contact Valia School of Management with your questions, suggestions and feedback.',
  alternates: { canonical: '/connect-with-us/' },
};

export default function ConnectWithUsPage() {
  return (
    <PlacementPageShell title="Connect With Us" active="Connect With Us">
      <PlacementSection title="We’re Here to Answer Your Queries">
        <p>At Valia School of Management, we’re always open to your questions, suggestions, and feedback. Whether you’re a prospective student, a parent, or just curious about our programs, our team is here to provide you with the information you need. Reach out to us within our working hours, and we’ll be more than happy to assist you.</p>
        <p><strong>Email address:</strong> <a href="mailto:info@vsmedu.in">info@vsmedu.in</a> · <a href="mailto:placement@vsmedu.in">placement@vsmedu.in</a></p>
        <p><strong>Contact number:</strong> <a href="tel:+917304343478">+91 73043 43478</a> · <a href="tel:+917304343460">+91 73043 43460</a></p>
      </PlacementSection>
    </PlacementPageShell>
  );
}
