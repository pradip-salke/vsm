import type { Metadata } from 'next';
import { PlacementPageShell, PlacementSection } from '../../PlacementPageShell';
import styles from '../../PlacementPage.module.css';
import { batch2021Highlights, salaryPlacementRows, specializationPlacementRows } from '@/content/placements';
import { CountUpValue } from '@/components/ui/CountUpValue';
import { withSeo } from '@/lib/seo';
import { getPlacementsPageContent, cmsString } from '@/lib/cms-content';
import { CmsHtml } from '@/components/ui/CmsHtml';

const metadata: Metadata = {
  title: 'PGDM 2021–23 Placement Records',
  description: 'Batch-wise PGDM 2021–23 placement results and salary ranges at Valia School of Management.',
  alternates: { canonical: '/placements/placement-records/pgdm-2021-23-batch/' },
};

export async function generateMetadata(): Promise<Metadata> {
  return withSeo('/placements/placement-records/pgdm-2021-23-batch/', metadata);
}

export default async function PlacementBatch2021Page() {
  const cms = await getPlacementsPageContent('pgdm-2021-23-batch');
  const intro = cms?.sections.intro;
  const highlights = cms?.sections.highlights;
  const stats = Array.isArray(highlights?.items) ? highlights.items as { value: string; label: string }[] : batch2021Highlights.map(([value, label]) => ({ value, label }));
  const specialisation = cms?.sections['specialisation-table'];
  const salary = cms?.sections['salary-table'];
  const specialRows = Array.isArray(specialisation?.rows) ? specialisation.rows as { specialisation: string; percentage: string; count: string }[] : specializationPlacementRows.map(([specialisation, percentage, count]) => ({ specialisation, percentage, count }));
  const salaryRows = Array.isArray(salary?.rows) ? salary.rows as { stream: string; average: string; highest: string }[] : salaryPlacementRows.map(([stream, average, highest]) => ({ stream, average, highest }));
  const fallbackIntro = '<p>VSM strives to ensure every student enrolled with us understands the importance of placements and what it takes to help companies that visit our campus provide opportunities to excel.</p><p>Placements is not a one-day process. We provide every student a platform with learning, industry interaction and internships with hands-on experience, helping them understand expectations, become industry ready and build confidence for success.</p>';
  return (
    <PlacementPageShell title="PGDM 2021–23 Batch" active="Placement Records" pageSlug="pgdm-2021-23-batch">
      <PlacementSection className={styles.salaryTableSection} title={cmsString(intro?.title, 'Placements Details of PGDM 2021–23 Batch')} intro={<CmsHtml html={cmsString(intro?.body, fallbackIntro)} />}>
        <h3 className={styles.sectionSubheading}>{cmsString(highlights?.title, 'Key Highlights')}</h3>
        <div className={styles.stats}>{stats.map(({ value, label }) => <div key={label} className={styles.stat}><strong><CountUpValue value={value} /></strong><span>{label}</span></div>)}</div>
        <h3 className={styles.sectionSubheading}>{cmsString(specialisation?.title, 'Specialization-wise Placement Record')}</h3>
        <div className={styles.tableWrap}><table className={styles.table}><thead><tr><th scope="col">{cmsString(specialisation?.specialisationHeading, 'Specialization')}</th><th scope="col">{cmsString(specialisation?.percentageHeading, 'Placed Students %')}</th><th scope="col">{cmsString(specialisation?.countHeading, 'No. of Students')}</th></tr></thead>
          <tbody>{specialRows.map((row) => <tr key={row.specialisation}><td>{row.specialisation}</td><td>{row.percentage}</td><td>{row.count}</td></tr>)}</tbody></table></div>
        <h3 className={styles.sectionSubheading}>{cmsString(salary?.title, 'Average & Highest Salary Range Offered Specialization-wise')}</h3>
        <div className={styles.tableWrap}><table className={styles.table}><thead><tr><th scope="col">{cmsString(salary?.streamHeading, 'Stream')}</th><th scope="col">{cmsString(salary?.averageHeading, 'Average Salary · PGDM Batch 2021–23')}</th><th scope="col">{cmsString(salary?.highestHeading, 'Highest Salary · PGDM Batch 2021–23')}</th></tr></thead>
          <tbody>{salaryRows.map((row) => <tr key={row.stream}><td>{row.stream}</td><td>{row.average}</td><td>{row.highest}</td></tr>)}</tbody></table></div>
      </PlacementSection>
    </PlacementPageShell>
  );
}
