import type { Metadata } from 'next';
import { AboutPageShell, AboutSection } from '../AboutPageShell';
import { GalleryImages } from '@/app/events/GalleryImages';
import { infrastructureImages } from '@/content/infrastructure';
import { withSeo } from '@/lib/seo';
import { getAboutPageContent, cmsString, type CmsImage } from '@/lib/cms-content';

const metadata: Metadata = { title: 'Infrastructure', description: 'Infrastructure at Valia School of Management.', alternates: { canonical: '/about-us/infrastructure/' } };

export async function generateMetadata(): Promise<Metadata> {
  return withSeo('/about-us/infrastructure/', metadata);
}

export default async function InfrastructurePage() {
  const cms = await getAboutPageContent('infrastructure');
  const gallery = cms?.sections.gallery;
  const images = Array.isArray(gallery?.images) ? gallery.images as CmsImage[] : infrastructureImages;
  const galleryItems = images.map((image, index) => ({ title: `Infrastructure image ${index + 1}`, image: { src: image.src, alt: image.alt ?? `Valia School of Management infrastructure photograph ${index + 1}`, width: image.width ?? 300, height: image.height ?? 225 } }));
  return <AboutPageShell title="Infrastructure" active="Infrastructure" pageSlug="infrastructure">
    <AboutSection title={cmsString(gallery?.title, 'Infrastructure')}>
      <GalleryImages
        items={galleryItems}
        slideshowImages={galleryItems.map((item) => item.image)}
        hideCaptions
      />
    </AboutSection>
  </AboutPageShell>;
}
