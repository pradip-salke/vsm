import type { Metadata } from 'next';
import { PlacementPageShell, PlacementSection } from '../PlacementPageShell';
import styles from '../PlacementPage.module.css';
import { alumniProfiles } from '@/content/placements';

export const metadata: Metadata = {
  title: 'VSM Alumni Network',
  description: 'Meet distinguished alumni of Valia School of Management and explore their professional journeys.',
  alternates: { canonical: '/placements/alumni/' },
};

export default function AlumniPage() {
  return (
    <PlacementPageShell title="Alumni" active="Alumni">
      <PlacementSection title="Meet Our Alumni" intro={<p>The students graduating from a two-year regular PGDM program across India are of high caliber, doing very well in their profession and have secured high positions in different industries. Here is a list of some distinguished alumni:</p>}>
        <div className={styles.alumniGrid}>
          {alumniProfiles.map((alumni) => <article className={styles.alumniCard} key={alumni.name}>
            <h3>{alumni.name}</h3><h4>{alumni.qualification}</h4><p>{alumni.bio}</p>
          </article>)}
        </div>
      </PlacementSection>
    </PlacementPageShell>
  );
}
