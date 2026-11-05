import type { Metadata } from 'next';
import Image from 'next/image';
import { AboutPageShell, AboutSection } from '../AboutPageShell';
import { Signature } from '../AboutComponents';
import { viceChairmanMessage as message } from '@/content/about';
import styles from '../about.module.css';

export const metadata: Metadata = { title: 'Vice Chairman Message', description: 'A message to VSM students and families from the Vice Chairman.', alternates: { canonical: '/about-us/vice-chairman-message/' } };

export default function ViceChairmanMessagePage() {
  return <AboutPageShell title="Vice Chairman Message" active="Vice Chairman Message" viewportContent>
    <AboutSection title="Message From Vice Chairman" className={styles.messagePageSection}>
      <div className={styles.message}>
        <Image src="/images/about/vice-bryan.jpeg" alt="Bryan Dsouza, Vice Chairman" width={600} height={900} sizes="(max-width: 650px) min(100vw, 18rem), 15rem" />
        <div className={styles.copy}>
          <p className={styles.profileRole}>{message.greeting}</p>
          {message.intro.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
          <p>Our endeavour is to build a strong bridge between academia and industry through:</p>
          <ul className={styles.bullets} role="list">{message.bridge.map((item) => <li key={item}>{item}</li>)}</ul>
          <p>{message.careersIntro}</p>
          <ul className={styles.bullets} role="list">{message.careers.map((item) => <li key={item}>{item}</li>)}</ul>
          {message.closing.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
          <Signature lines={message.signature} />
        </div>
      </div>
    </AboutSection>
  </AboutPageShell>;
}
