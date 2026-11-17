import type { Metadata } from 'next';
import { CmsHtml } from '../about-us/AboutComponents';
import { DisclosurePageShell } from '../DisclosurePageShell';
import { cmsString, getAboutPageContent } from '@/lib/cms-content';
import { withSeo } from '@/lib/seo';
import styles from '../disclosure.module.css';

const slug = 'committee';
const path = '/committee/';
type Member = { name: string; designation: string };
type Committee = { title: string; intro: string; members: Member[] };

export async function generateMetadata(): Promise<Metadata> {
  const cms = await getAboutPageContent(slug);
  const seo = cms?.sections.seo;
  return withSeo(path, {
    ...(cmsString(seo?.metaTitle) ? { title: cmsString(seo?.metaTitle) } : {}),
    ...(cmsString(seo?.metaDescription) ? { description: cmsString(seo?.metaDescription) } : {}),
    alternates: { canonical: path },
  });
}

function CommitteeTable({ label, rows }: { label: string; rows: Member[] }) {
  return <div className={styles.tableScroll} tabIndex={0} aria-label={`${label} members`}>
    <table className={styles.table}>
      <caption className="visually-hidden">{label}</caption>
      <thead><tr><th scope="col">Sr. No.</th><th scope="col">Name</th><th scope="col">Designation</th></tr></thead>
      <tbody>{rows.map((row, index) => <tr key={`${row.name}-${index}`}>
        <th scope="row">{index + 1}.</th><td>{row.name}</td><td>{row.designation}</td>
      </tr>)}</tbody>
    </table>
  </div>;
}

export default async function CommitteePage() {
  const cms = await getAboutPageContent(slug);
  const stored = cms?.sections.committees as { groups?: Committee[] } | undefined;
  const groups = Array.isArray(stored?.groups) ? stored.groups : [];
  return <DisclosurePageShell slug={slug}>
    {groups.map((group, index) => <section className={styles.section} key={`${group.title}-${index}`}>
      {group.title && <h2 className={styles.subheading}>{group.title}</h2>}
      {group.intro && <CmsHtml html={group.intro} className={styles.copy} />}
      <CommitteeTable label={group.title} rows={Array.isArray(group.members) ? group.members : []} />
    </section>)}
  </DisclosurePageShell>;
}
