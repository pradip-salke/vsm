import type { Metadata } from 'next';
import Image from 'next/image';
import { AboutPageShell, AboutSection } from '../AboutPageShell';
import { philosophyValues } from '@/content/about';
import styles from '../about.module.css';

export const metadata: Metadata = { title: 'Our Philosophy', description: 'The values that shape the learning community at Valia School of Management.', alternates: { canonical: '/about-us/our-philosophy/' } };

export default function PhilosophyPage() {
  return <AboutPageShell title="Our Philosophy" active="Our Philosophy">
    <AboutSection title="Our Philosophy at Valia School of Management">
      <div className={styles.valueGrid}>{philosophyValues.map((value) => <article className={styles.valueCard} key={value.title}>
        <Image src={`/images/about/${value.image}`} alt="" width={100} height={100} />
        <div><h3>{value.title}</h3><p>{value.text}</p></div>
      </article>)}</div>
    </AboutSection>
  </AboutPageShell>;
}
