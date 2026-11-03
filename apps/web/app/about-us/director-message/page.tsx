import type { Metadata } from 'next';
import Image from 'next/image';
import { AboutPageShell, AboutSection } from '../AboutPageShell';
import { Signature } from '../AboutComponents';
import { directorMessage as message } from '@/content/about';
import styles from '../about.module.css';

export const metadata: Metadata = { title: "Director's Message", description: 'A message from Dr. Sandeep Sawant, Director of Valia School of Management.', alternates: { canonical: '/about-us/director-message/' } };

export default function DirectorMessagePage() {
  return <AboutPageShell title="Director's Message" active="Director Message">
    <AboutSection title="Message From Director">
      <div className={styles.message}>
        <Image src="/images/about/director-sandeep.jpg" alt="Dr. Sandeep Sawant, Director of Valia School of Management" width={600} height={750} />
        <div className={styles.copy}>
          <p className={styles.profileRole}>{message.greeting}</p>
          {message.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
          <p>Our academic philosophy rests on four transformative pillars:</p>
          <ul className={styles.pillars} role="list">{message.pillars.map(([title, description]) => <li key={title}><strong>{title}</strong> – {description}</li>)}</ul>
          {message.closing.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
          <Signature lines={message.signature} />
        </div>
      </div>
    </AboutSection>
  </AboutPageShell>;
}
