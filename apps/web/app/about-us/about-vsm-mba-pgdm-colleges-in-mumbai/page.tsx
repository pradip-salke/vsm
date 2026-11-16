import type { Metadata } from 'next';
import Image from 'next/image';
import { AboutPageShell, AboutSection } from '../AboutPageShell';
import { aboutVsm } from '@/content/about';
import { CmsHtml } from '../AboutComponents';
import styles from '../about.module.css';
import { withSeo } from '@/lib/seo';
import { getAboutPageContent, cmsString } from '@/lib/cms-content';

const metadata: Metadata = { title: 'About VSM', description: 'Learn about Valia School of Management, its vision and mission.', alternates: { canonical: '/about-us/about-vsm-mba-pgdm-colleges-in-mumbai/' } };

export async function generateMetadata(): Promise<Metadata> {
  return withSeo('/about-us/about-vsm-mba-pgdm-colleges-in-mumbai/', metadata);
}

export default async function AboutVsmPage() {
  const cms = await getAboutPageContent('about-vsm-mba-pgdm-colleges-in-mumbai');
  const introBody = cmsString(cms?.sections.intro?.body, aboutVsm.paragraphs.map((text) => `<p>${text}</p>`).join(''));
  const visionMission = cms?.sections['vision-mission'];
  const cards = Array.isArray(visionMission?.cards) ? visionMission.cards as { title: string; text: string; image: { src: string; alt: string } }[] : null;
  return <AboutPageShell title="About VSM" active="About VSM" pageSlug="about-vsm-mba-pgdm-colleges-in-mumbai">
    <AboutSection><CmsHtml html={introBody} /></AboutSection>
    <AboutSection title={cmsString(visionMission?.title, 'Our Vision & Mission')}>
      <div className={styles.visionMission}>
        {(cards ?? [{ title: 'Our Vision', text: aboutVsm.vision, image: { src: '/images/about/vision.png', alt: '' } }, { title: 'Our Mission', text: aboutVsm.mission, image: { src: '/images/about/mission.png', alt: '' } }]).map(card => <article className={styles.visionCard} key={card.title}><Image src={card.image.src} alt={card.image.alt} width={100} height={100} sizes="100px" /><div><h3>{card.title}</h3><p>{card.text}</p></div></article>)}
      </div>
    </AboutSection>
  </AboutPageShell>;
}
