import type { Metadata } from 'next';
import { AboutPageShell, AboutSection } from '../AboutPageShell';
import { GalleryImages } from '@/app/events/GalleryImages';
import { infrastructureImages } from '@/content/infrastructure';

export const metadata: Metadata = { title: 'Infrastructure', description: 'Infrastructure at Valia School of Management.', alternates: { canonical: '/about-us/infrastructure/' } };

export default function InfrastructurePage() {
  return <AboutPageShell title="Infrastructure" active="Infrastructure">
    <AboutSection title="Infrastructure">
      <GalleryImages
        items={infrastructureImages.map((image, index) => ({ title: `Infrastructure image ${index + 1}`, image }))}
        slideshowImages={infrastructureImages}
        hideCaptions
      />
    </AboutSection>
  </AboutPageShell>;
}
