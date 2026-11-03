import type { CSSProperties } from 'react';
import Image from 'next/image';
import { contact, topBarSocials } from '@/content/site';
import { Icon } from '@/components/ui/Icon';
import { icons, topBarSocialIcons } from '@/components/ui/icons';
import { MailIcon } from '@/components/ui/MailIcon';
import styles from './TopBar.module.css';

export function TopBar() {
  return (
    <div className={styles.topBar}>
      <div className={`container ${styles.inner}`}>
        <ul className={styles.contacts} role="list">
          <li className={styles.contact}>
            <span className={styles.circle}>
              <Icon src={icons.phone} size="calc(var(--circle) * 19.25 / 44)" />
            </span>
            <span className={styles.label}>Call Now:</span>
            {contact.phones.map((phone, index) => (
              <a key={phone.href} className={`${styles.value} ${index > 0 ? styles.secondary : ''}`} href={phone.href}>
                {phone.label}
              </a>
            ))}
          </li>
          <li className={`${styles.contact} ${styles.email}`}>
            <span className={styles.circle}>
              <MailIcon className={styles.mail} />
            </span>
            <span className={styles.label}>Email Address:</span>
            <a className={styles.value} href={`mailto:${contact.email}`}>
              {contact.email}
            </a>
          </li>
        </ul>
        <ul className={styles.socials} role="list">
          {topBarSocials.map((social) => {
            const glyph = topBarSocialIcons[social.key];
            if (!glyph) return null;
            return (
              <li key={social.key}>
                <a className={styles.social} href={social.href!} target="_blank" rel="noopener noreferrer" aria-label={social.label}>
                  <Image
                    src={glyph.src}
                    alt=""
                    width={glyph.size}
                    height={glyph.size}
                    sizes={`${glyph.size}px`}
                    style={{ '--glyph': glyph.size } as CSSProperties}
                  />
                </a>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
