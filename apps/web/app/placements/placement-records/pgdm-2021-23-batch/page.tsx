import type { Metadata } from 'next';
import { PlacementPageShell, PlacementSection } from '../../PlacementPageShell';
import styles from '../../PlacementPage.module.css';
import { batch2021Highlights, salaryPlacementRows, specializationPlacementRows } from '@/content/placements';

export const metadata: Metadata = {
  title: 'PGDM 2021–23 Placement Records',
  description: 'Batch-wise PGDM 2021–23 placement results and salary ranges at Valia School of Management.',
  alternates: { canonical: '/placements/placement-records/pgdm-2021-23-batch/' },
};

export default function PlacementBatch2021Page() {
  return (
    <PlacementPageShell title="PGDM 2021–23 Batch" active="Placement Records">
      <PlacementSection title="Placements Details of PGDM 2021–23 Batch" intro={<>
        <p>VSM strives to ensure every student enrolled with us understands the importance of placements and what it takes to help companies that visit our campus provide opportunities to excel.</p>
        <p>Placements is not a one-day process. We provide every student a platform with learning, industry interaction and internships with hands-on experience, helping them understand expectations, become industry ready and build confidence for success.</p>
      </>}>
        <h3 className={styles.sectionSubheading}>Key Highlights</h3>
        <div className={styles.stats}>{batch2021Highlights.map(([value, label]) => <div key={label} className={styles.stat}><strong>{value}</strong><span>{label}</span></div>)}</div>
        <h3 className={styles.sectionSubheading}>Specialization-wise Placement Record</h3>
        <div className={styles.tableWrap}><table className={styles.table}><thead><tr><th scope="col">Specialization</th><th scope="col">Placed Students %</th><th scope="col">No. of Students</th></tr></thead>
          <tbody>{specializationPlacementRows.map(([name, percentage, count]) => <tr key={name}><td>{name}</td><td>{percentage}</td><td>{count}</td></tr>)}</tbody></table></div>
        <h3 className={styles.sectionSubheading}>Average &amp; Highest Salary Range Offered Specialization-wise</h3>
        <div className={styles.tableWrap}><table className={styles.table}><thead><tr><th scope="col">Stream</th><th scope="col">Average Salary · PGDM Batch 2021–23</th><th scope="col">Highest Salary · PGDM Batch 2021–23</th></tr></thead>
          <tbody>{salaryPlacementRows.map(([name, average, highest]) => <tr key={name}><td>{name}</td><td>{average}</td><td>{highest}</td></tr>)}</tbody></table></div>
      </PlacementSection>
    </PlacementPageShell>
  );
}
