import Image from 'next/image';
import type { AboutProfile } from '@/content/about';
import type { CmsImage } from '@/lib/cms-content';
import styles from './about.module.css';

export function AboutCopy({ paragraphs }: { paragraphs: string[] }) {
  return <div className={styles.copy}>{paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}</div>;
}

export function CmsHtml({ html, className = styles.copy }: { html: string; className?: string }) {
  return <div className={className} dangerouslySetInnerHTML={{ __html: html }} />;
}

export function ProfileGrid({ profiles, compact = false, advisory = false, uniformImage = false, facultyStyle = false, className = '' }: { profiles: AboutProfile[]; compact?: boolean; advisory?: boolean; uniformImage?: boolean; facultyStyle?: boolean; className?: string }) {
  return <div className={`${compact ? styles.pastYears : styles.profileGrid}${advisory ? ` ${styles.advisoryGrid}` : ''}${uniformImage ? ` ${styles.uniformImageGrid}` : ''}${facultyStyle ? ` ${styles.facultyStyleGrid}` : ''}${className ? ` ${className}` : ''}`}>
    {profiles.map((profile) => <article className={`${styles.profile}${advisory ? ` ${styles.advisoryProfile}` : ''}${facultyStyle ? ` ${styles.facultyStyleProfile}` : ''}`} key={profile.name}>
      {profile.image && <Image src={profile.image.startsWith('https://') || profile.image.startsWith('/') ? profile.image : `/images/about/${profile.image}`} alt={profile.name} width={600} height={750} sizes={facultyStyle ? '(max-width: 650px) 100vw, (max-width: 1023px) 50vw, 25vw' : '(max-width: 650px) min(100vw, 18rem), (max-width: 900px) 8rem, 10rem'} />}
      <div className={styles.profileCopy}>
        <h3>{profile.name}</h3>
        {profile.role && <p className={styles.profileRole}>{profile.role}</p>}
        {profile.details && <ul className={styles.profileDetails} role="list">{profile.details.map((detail) => <li key={detail}>{detail}</li>)}</ul>}
      </div>
    </article>)}
  </div>;
}

export function MessageBlock({ name, role, image, paragraphs, body }: { name?: string; role?: string; image: string | CmsImage; paragraphs?: string[]; body?: string }) {
  const src = typeof image === 'string' ? image : image.src;
  const alt = typeof image === 'string' ? name ?? '' : image.alt ?? name ?? '';
  return <article className={styles.message}>
    <Image src={src.startsWith('https://') || src.startsWith('/') ? src : `/images/about/${src}`} alt={alt} width={600} height={750} sizes="(max-width: 650px) min(100vw, 18rem), 15rem" />
    <div>
      {name && <h3>{name}</h3>}
      {role && <p className={styles.messageRole}>{role}</p>}
      {body ? <CmsHtml html={body} className={styles.messageCopy} /> : paragraphs && paragraphs.length > 0 && <div className={styles.messageCopy}>{paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}</div>}
    </div>
  </article>;
}

export function Signature({ lines }: { lines: string[] }) {
  return <div className={styles.signature}>{lines.map((line, index) => index === 1 ? <strong key={line}>{line}</strong> : <span key={line}>{line}</span>)}</div>;
}
