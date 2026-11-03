import type { Metadata } from 'next';
import Image from 'next/image';
import { AboutPageShell, AboutSection } from '../AboutPageShell';
import { aboutVsm } from '@/content/about';
import { AboutCopy } from '../AboutComponents';
import styles from '../about.module.css';

export const metadata: Metadata = { title: 'About VSM', description: 'Learn about Valia School of Management, its vision and mission.', alternates: { canonical: '/about-us/about-vsm-mba-pgdm-colleges-in-mumbai/' } };

export default function AboutVsmPage() {
  return <AboutPageShell title="About VSM" active="About VSM">
    <AboutSection><AboutCopy paragraphs={aboutVsm.paragraphs} /></AboutSection>
    <AboutSection title="Our Vision & Mission">
      <div className={styles.visionMission}>
        <article className={styles.visionCard}><Image src="/images/about/vision.png" alt="" width={100} height={100} /><div><h3>Our Vision</h3><p>{aboutVsm.vision}</p></div></article>
        <article className={styles.visionCard}><Image src="/images/about/mission.png" alt="" width={100} height={100} /><div><h3>Our Mission</h3><p>{aboutVsm.mission}</p></div></article>
      </div>
    </AboutSection>
  </AboutPageShell>;
}
