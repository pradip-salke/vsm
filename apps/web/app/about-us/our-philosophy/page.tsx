import type { Metadata } from 'next';
import Image from 'next/image';
import { AboutPageShell, AboutSection } from '../AboutPageShell';
import { philosophyValues } from '@/content/about';
import styles from '../about.module.css';
import { withSeo } from '@/lib/seo';
import { getAboutPageContent, cmsString } from '@/lib/cms-content';

const metadata: Metadata = { title: 'Our Philosophy', description: 'The values that shape the learning community at Valia School of Management.', alternates: { canonical: '/about-us/our-philosophy/' } };

export async function generateMetadata(): Promise<Metadata> {
  return withSeo('/about-us/our-philosophy/', metadata);
}

export default async function PhilosophyPage() {
  const cms = await getAboutPageContent('our-philosophy');
  const section = cms?.sections.values;
  const cards = Array.isArray(section?.cards) ? section.cards as { title: string; text: string; image: { src: string; alt: string } }[] : null;
  return <AboutPageShell title="Our Philosophy" active="Our Philosophy" pageSlug="our-philosophy">
    <AboutSection className={styles.philosophySection} title={cmsString(section?.title, 'Our Philosophy at Valia School of Management')}>
      <div className={styles.valueGrid}>{(cards ?? philosophyValues.map(value => ({ ...value, image: { src: `/images/about/${value.image}`, alt: '' } }))).map((value) => <article className={styles.valueCard} key={value.title}>
        <Image src={value.image.src} alt={value.image.alt} width={100} height={100} sizes="100px" />
        <div><h3>{value.title}</h3><p>{value.text}</p></div>
      </article>)}</div>
    </AboutSection>
  </AboutPageShell>;
}
