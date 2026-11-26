import type { CSSProperties } from 'react';
import Image from 'next/image';
import type { FooterSocialLink } from '@vsmedu/contracts/footer';
import { contact } from '@/content/site';
import { Icon } from '@/components/ui/Icon';
import { icons, topBarSocialIcons } from '@/components/ui/icons';
import { MailIcon } from '@/components/ui/MailIcon';
import styles from './TopBar.module.css';

export function TopBar({ socials }: { socials?: FooterSocialLink[] }) {
  const topBarKeys = new Set(['facebook', 'instagram', 'youtube']);
  const visibleSocials = (socials ?? []).filter((social) => topBarKeys.has(social.key) && social.href?.trim());

  return (
    <div className={styles.topBar}>
      <div className={`container ${styles.inner}`}>
        <details className={`${styles.mobileContact} ${styles.mobilePhone}`}>
          <summary className={styles.circle} aria-label="Show phone numbers">
            <Icon src={icons.phone} size="calc(var(--circle) * 19.25 / 44)" />
          </summary>
          <div className={styles.contactPopup}>
            {contact.phones.map((phone) => <a key={phone.href} href={phone.href}>{phone.label}</a>)}
          </div>
        </details>
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
          <li className={styles.mobileEmailItem}>
            <details className={styles.mobileContact}>
              <summary className={`${styles.social} ${styles.mobileEmailIcon}`} aria-label="Show email address">
                <MailIcon className={styles.mobileMail} />
              </summary>
              <div className={`${styles.contactPopup} ${styles.emailPopup}`}>
                <a href={`mailto:${contact.email}`}>{contact.email}</a>
              </div>
            </details>
          </li>
          {visibleSocials.map((social) => {
            const glyph = topBarSocialIcons[social.key];
            if (!glyph) return null;
            return (
              <li key={social.key}>
                <a className={styles.social} href={social.href!.trim()} target="_blank" rel="noopener noreferrer" aria-label={social.label}>
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
