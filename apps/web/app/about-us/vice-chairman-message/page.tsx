import type { Metadata } from 'next';
import Image from 'next/image';
import { AboutPageShell, AboutSection } from '../AboutPageShell';
import { Signature, CmsHtml } from '../AboutComponents';
import { viceChairmanMessage as message } from '@/content/about';
import styles from '../about.module.css';
import { withSeo } from '@/lib/seo';
import { getAboutPageContent, cmsImage, cmsString } from '@/lib/cms-content';

const metadata: Metadata = { title: 'Vice Chairman Message', description: 'A message to VSM students and families from the Vice Chairman.', alternates: { canonical: '/about-us/vice-chairman-message/' } };

export async function generateMetadata(): Promise<Metadata> {
  return withSeo('/about-us/vice-chairman-message/', metadata);
}

export default async function ViceChairmanMessagePage() {
  const cms = await getAboutPageContent('vice-chairman-message');
  const section = cms?.sections.message;
  const intro = cmsString(section?.intro, message.intro.map((text) => `<p>${text}</p>`).join(''));
  const closing = cmsString(section?.closing, message.closing.map((text) => `<p>${text}</p>`).join(''));
  const image = cmsImage(section?.image, { src: '/images/about/vice-bryan.jpeg', alt: 'Bryan Dsouza, Vice Chairman', width: 600, height: 900 });
  const list = (value: unknown, fallback: string[]) => Array.isArray(value) ? value.map(String) : fallback;
  const bridge = list(section?.bridge, message.bridge);
  const careers = list(section?.careers, message.careers);
  const signature = list(section?.signature, message.signature);
  return <AboutPageShell title="Vice Chairman Message" active="Vice Chairman Message" viewportContent pageSlug="vice-chairman-message">
    <AboutSection title={cmsString(section?.title, 'Message From Vice Chairman')} className={styles.messagePageSection}>
      <div className={styles.message}>
        <Image src={image.src} alt={image.alt ?? ''} width={image.width ?? 600} height={image.height ?? 900} sizes="(max-width: 650px) min(100vw, 18rem), 15rem" />
        <div className={styles.copy}>
          <p className={styles.profileRole}>{cmsString(section?.greeting, message.greeting)}</p>
          <CmsHtml html={intro} />
          <p>{cmsString(section?.bridgeIntro, 'Our endeavour is to build a strong bridge between academia and industry through:')}</p>
          <ul className={styles.bullets} role="list">{bridge.map((item) => <li key={item}>{item}</li>)}</ul>
          <p>{cmsString(section?.careersIntro, message.careersIntro)}</p>
          <ul className={styles.bullets} role="list">{careers.map((item) => <li key={item}>{item}</li>)}</ul>
          <CmsHtml html={closing} />
          <Signature lines={signature} />
        </div>
      </div>
    </AboutSection>
  </AboutPageShell>;
}
