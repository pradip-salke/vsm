import type { Metadata } from 'next';
import { DisclosurePageShell } from '../DisclosurePageShell';
import { cmsString, getAboutPageContent } from '@/lib/cms-content';
import { withSeo } from '@/lib/seo';
import styles from '../disclosure.module.css';

const slug = 'eoa-report';
const path = '/eoa-report/';
type Report = { title: string; intro: string; description: string; linkText: string; linkHref: string };

export async function generateMetadata(): Promise<Metadata> {
  const cms = await getAboutPageContent(slug);
  const seo = cms?.sections.seo;
  return withSeo(path, {
    ...(cmsString(seo?.metaTitle) ? { title: cmsString(seo?.metaTitle) } : {}),
    ...(cmsString(seo?.metaDescription) ? { description: cmsString(seo?.metaDescription) } : {}),
    alternates: { canonical: path },
  });
}

export default async function EoaReportPage() {
  const cms = await getAboutPageContent(slug);
  const report = cms?.sections.report as Report | undefined;
  return <DisclosurePageShell slug={slug}>
    {report && <section className={styles.section}>
      {report.title && <h2 className={styles.heading}>{report.title}</h2>}
      <div className={styles.reportCard}>
        <div>
          {report.intro && <p className={styles.reportTitle}>{report.intro}</p>}
          {report.description && <p className={styles.copy}>{report.description}</p>}
        </div>
        {report.linkHref && <a className={styles.reportLink} href={report.linkHref} target="_blank" rel="noopener noreferrer">
          {report.linkText} <span aria-hidden="true">↗</span>
        </a>}
      </div>
    </section>}
  </DisclosurePageShell>;
}
