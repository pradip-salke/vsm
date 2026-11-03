import Image from 'next/image';
import type { AboutProfile } from '@/content/about';
import styles from './about.module.css';

export function AboutCopy({ paragraphs }: { paragraphs: string[] }) {
  return <div className={styles.copy}>{paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}</div>;
}

export function ProfileGrid({ profiles, compact = false }: { profiles: AboutProfile[]; compact?: boolean }) {
  return <div className={compact ? styles.pastYears : styles.profileGrid}>
    {profiles.map((profile) => <article className={styles.profile} key={profile.name}>
      {profile.image && <Image src={`/images/about/${profile.image}`} alt={profile.name} width={600} height={750} />}
      <div className={styles.profileCopy}>
        <h3>{profile.name}</h3>
        {profile.role && <p className={styles.profileRole}>{profile.role}</p>}
        {profile.details && <ul className={styles.profileDetails} role="list">{profile.details.map((detail) => <li key={detail}>{detail}</li>)}</ul>}
      </div>
    </article>)}
  </div>;
}

export function MessageBlock({ name, role, image, paragraphs }: { name?: string; role?: string; image: string; paragraphs?: string[] }) {
  return <article className={styles.message}>
    <Image src={`/images/about/${image}`} alt={name ?? ''} width={600} height={750} />
    <div>
      {name && <h3>{name}</h3>}
      {role && <p className={styles.messageRole}>{role}</p>}
      {paragraphs && paragraphs.length > 0 && <div className={styles.messageCopy}>{paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}</div>}
    </div>
  </article>;
}

export function Signature({ lines }: { lines: string[] }) {
  return <div className={styles.signature}>{lines.map((line, index) => index === 1 ? <strong key={line}>{line}</strong> : <span key={line}>{line}</span>)}</div>;
}
