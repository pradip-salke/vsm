import type { Metadata } from 'next';
import { PlacementPageShell, PlacementSection } from '../PlacementPageShell';
import styles from '../PlacementPage.module.css';
import { alumniProfiles } from '@/content/placements';
import { withSeo } from '@/lib/seo';
import { getPlacementsPageContent, cmsString } from '@/lib/cms-content';
import { CmsHtml } from '@/components/ui/CmsHtml';

const metadata: Metadata = {
  title: 'VSM Alumni Network',
  description: 'Meet distinguished alumni of Valia School of Management and explore their professional journeys.',
  alternates: { canonical: '/placements/alumni/' },
};

export async function generateMetadata(): Promise<Metadata> {
  return withSeo('/placements/alumni/', metadata);
}

export default async function AlumniPage() {
  const cms = await getPlacementsPageContent('alumni');
  const intro = cms?.sections.intro;
  const profiles = Array.isArray(cms?.masters.alumni?.items) ? cms.masters.alumni.items as { name: string; qualification: string; bio: string }[] : alumniProfiles;
  return (
    <PlacementPageShell title="Alumni" active="Alumni" pageSlug="alumni">
      <PlacementSection title={cmsString(intro?.title, 'Meet Our Alumni')} intro={<CmsHtml html={cmsString(intro?.body, '<p>The students graduating from a two-year regular PGDM program across India are of high caliber, doing very well in their profession and have secured high positions in different industries. Here is a list of some distinguished alumni:</p>')} />}>
        <div className={styles.alumniGrid}>
          {profiles.map((alumni) => <article className={styles.alumniCard} key={alumni.name}>
            <h3>{alumni.name}</h3><h4>{alumni.qualification}</h4><p>{alumni.bio}</p>
          </article>)}
        </div>
      </PlacementSection>
    </PlacementPageShell>
  );
}
