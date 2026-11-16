import type { Metadata } from 'next';
import Image from 'next/image';
import { AboutPageShell, AboutSection } from '../AboutPageShell';
import { Signature, CmsHtml } from '../AboutComponents';
import { directorMessage as message } from '@/content/about';
import styles from '../about.module.css';
import { withSeo } from '@/lib/seo';
import { getAboutPageContent, cmsImage, cmsString } from '@/lib/cms-content';

const metadata: Metadata = { title: "Director's Message", description: 'A message from Dr. Sandeep Sawant, Director of Valia School of Management.', alternates: { canonical: '/about-us/director-message/' } };

export async function generateMetadata(): Promise<Metadata> {
  return withSeo('/about-us/director-message/', metadata);
}

export default async function DirectorMessagePage() {
  const cms = await getAboutPageContent('director-message');
  const section = cms?.sections.message;
  const intro = cmsString(section?.intro, message.paragraphs.map((text) => `<p>${text}</p>`).join(''));
  const closing = cmsString(section?.closing, message.closing.map((text) => `<p>${text}</p>`).join(''));
  const image = cmsImage(section?.image, { src: '/images/about/director-sandeep.jpg', alt: 'Dr. Sandeep Sawant, Director of Valia School of Management', width: 600, height: 750 });
  const pillars = Array.isArray(section?.pillars) ? section.pillars as { label: string; detail: string }[] : message.pillars.map(([label, detail]) => ({ label, detail }));
  const signature = Array.isArray(section?.signature) ? section.signature.map(String) : message.signature;
  return <AboutPageShell title="Director's Message" active="Director Message" viewportContent pageSlug="director-message">
    <AboutSection title={cmsString(section?.title, 'Message From Director')}>
      <div className={styles.message}>
        <Image src={image.src} alt={image.alt ?? ''} width={image.width ?? 600} height={image.height ?? 750} sizes="(max-width: 650px) min(100vw, 18rem), 15rem" />
        <div className={styles.copy}>
          <p className={styles.profileRole}>{cmsString(section?.greeting, message.greeting)}</p>
          <CmsHtml html={intro} />
          <p>{cmsString(section?.pillarsIntro, 'Our academic philosophy rests on four transformative pillars:')}</p>
          <ul className={styles.pillars} role="list">{pillars.map((pillar) => <li key={pillar.label}><strong>{pillar.label}</strong>  -  {pillar.detail}</li>)}</ul>
          <CmsHtml html={closing} />
          <Signature lines={signature} />
        </div>
      </div>
    </AboutSection>
  </AboutPageShell>;
}
