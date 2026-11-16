import type { Metadata } from 'next';
import { Link } from '@/components/navigation/Link';
import { PlacementPageShell, PlacementSection } from './PlacementPageShell';
import styles from './PlacementPage.module.css';
import { batch2022Highlights, placementIntro } from '@/content/placements';
import { CountUpValue } from '@/components/ui/CountUpValue';
import { withSeo } from '@/lib/seo';
import { getPlacementsPageContent, cmsString } from '@/lib/cms-content';
import { CmsHtml } from '@/components/ui/CmsHtml';

const metadata: Metadata = {
  title: 'PGDM Placements',
  description: 'Explore PGDM placements, recruiters, placement records, alumni outcomes and corporate connections at Valia School of Management.',
  alternates: { canonical: '/placements/' },
};

const pages = [
  { title: 'Our Recruiters', text: 'Meet organizations that recruit VSM students across industries.', href: '/placements/our-recruiters/' },
  { title: 'Placement Records', text: 'Review recent internship records and batch-wise placement outcomes.', href: '/placements/placement-records/' },
  { title: 'Alumni', text: 'Read about distinguished alumni and the paths they have built after PGDM.', href: '/placements/alumni/' },
];

export async function generateMetadata(): Promise<Metadata> {
  return withSeo('/placements/', metadata);
}

export default async function PlacementsPage() {
  const cms = await getPlacementsPageContent('placements');
  const intro = cms?.sections.intro;
  const cardSection = cms?.sections.cards;
  const highlights = cms?.sections.highlights;
  const cards = Array.isArray(cardSection?.items) ? cardSection.items as { title: string; text: string; linkText: string; href: string }[] : pages.map((page) => ({ ...page, linkText: `Explore ${page.title}` }));
  const stats = Array.isArray(highlights?.items) ? highlights.items as { value: string; label: string }[] : batch2022Highlights.map(([value, label]) => ({ value, label }));
  const introBody = cmsString(intro?.body, placementIntro.map((paragraph) => `<p>${paragraph}</p>`).join(''));
  return (
    <PlacementPageShell title="Placements" active="Placements" pageSlug="placements">
      <PlacementSection title={cmsString(intro?.title, 'Achieve Your Career Goals with VSM’s PGDM Placements')} intro={<CmsHtml html={introBody} />}>
        <div className={styles.cards}>
          {cards.map((page) => <article className={styles.card} key={page.href}>
            <h3>{page.title}</h3><p>{page.text}</p><Link href={page.href}>{page.linkText}<span aria-hidden>→</span></Link>
          </article>)}
          <article className={styles.card}>
            <h3>Connect With Us</h3><p>Contact our team to discuss student engagement, internships and recruitment opportunities.</p>
            <Link href="/connect-with-us/">Connect with VSM<span aria-hidden>→</span></Link>
          </article>
        </div>
      </PlacementSection>
      <PlacementSection title={cmsString(highlights?.title, 'PGDM 2022–24 Batch · Internship Highlights')}>
        <div className={styles.stats}>{stats.map(({ value, label }) => <div key={label} className={styles.stat}><strong><CountUpValue value={value} /></strong><span>{label}</span></div>)}</div>
        <div className={styles.batchNav}><Link href={cmsString(highlights?.linkHref, '/placements/placement-records/')}>{cmsString(highlights?.linkText, 'View placement records →')}</Link></div>
      </PlacementSection>
    </PlacementPageShell>
  );
}
