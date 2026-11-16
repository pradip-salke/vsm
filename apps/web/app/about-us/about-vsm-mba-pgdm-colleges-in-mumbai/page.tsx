import type { Metadata } from 'next';
import Image from 'next/image';
import { AboutPageShell, AboutSection } from '../AboutPageShell';
import { aboutVsm } from '@/content/about';
import { AboutCopy } from '../AboutComponents';
import styles from '../about.module.css';
import { withSeo } from '@/lib/seo';
import { getAboutCardImages } from '@/lib/about-card-icons';

const metadata: Metadata = { title: 'About VSM', description: 'Learn about Valia School of Management, its vision and mission.', alternates: { canonical: '/about-us/about-vsm-mba-pgdm-colleges-in-mumbai/' } };

export async function generateMetadata(): Promise<Metadata> {
  return withSeo('/about-us/about-vsm-mba-pgdm-colleges-in-mumbai/', metadata);
}

export default async function AboutVsmPage() {
  const images = await getAboutCardImages('about-vsm-mba-pgdm-colleges-in-mumbai', 'vision-mission');
  return <AboutPageShell title="About VSM" active="About VSM">
    <AboutSection><AboutCopy paragraphs={aboutVsm.paragraphs} /></AboutSection>
    <AboutSection title="Our Vision & Mission">
      <div className={styles.visionMission}>
        {(images ?? [{ title: 'Our Vision', text: aboutVsm.vision, image: { src: '/images/about/vision.png', alt: '', width: 100, height: 100 } }, { title: 'Our Mission', text: aboutVsm.mission, image: { src: '/images/about/mission.png', alt: '', width: 100, height: 100 } }]).map(card => <article className={styles.visionCard} key={card.title}><Image src={card.image.src} alt={card.image.alt} width={100} height={100} sizes="100px" /><div><h3>{card.title}</h3><p>{card.text}</p></div></article>)}
      </div>
    </AboutSection>
  </AboutPageShell>;
}
