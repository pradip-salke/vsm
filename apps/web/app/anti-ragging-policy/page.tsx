import type { Metadata } from 'next';
import { CmsHtml } from '../about-us/AboutComponents';
import { DisclosurePageShell } from '../DisclosurePageShell';
import { cmsString, getAboutPageContent } from '@/lib/cms-content';
import { withSeo } from '@/lib/seo';
import styles from '../disclosure.module.css';

const slug = 'anti-ragging-policy';
const path = '/anti-ragging-policy/';
type Policy = { title: string; intro: string; linkText: string; linkHref: string };

export async function generateMetadata(): Promise<Metadata> {
  const cms = await getAboutPageContent(slug);
  const seo = cms?.sections.seo;
  return withSeo(path, {
    ...(cmsString(seo?.metaTitle) ? { title: cmsString(seo?.metaTitle) } : {}),
    ...(cmsString(seo?.metaDescription) ? { description: cmsString(seo?.metaDescription) } : {}),
    alternates: { canonical: path },
  });
}

export default async function AntiRaggingPolicyPage() {
  const cms = await getAboutPageContent(slug);
  const policy = cms?.sections.policy as Policy | undefined;
  return <DisclosurePageShell slug={slug}>
    {policy && <section className={styles.section}>
      {policy.title && <h2 className={styles.heading}>{policy.title}</h2>}
      {policy.intro && <CmsHtml html={policy.intro} className={styles.copy} />}
      {policy.linkHref && <p className={styles.copy}><a href={policy.linkHref} target="_blank" rel="noopener noreferrer">{policy.linkText}</a></p>}
    </section>}
  </DisclosurePageShell>;
}
