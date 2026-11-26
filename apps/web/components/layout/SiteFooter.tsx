'use client';

import { useState } from 'react';
import { Link } from '@/components/navigation/Link';
import { aboutLinks, careerAndBlogLinks, footer, specialisationLinks } from '@/content/site';
import type { FooterContent } from '@vsmedu/contracts/footer';
import { Icon } from '@/components/ui/Icon';
import { icons } from '@/components/ui/icons';
import styles from './SiteFooter.module.css';
import { useContactLocation } from './ContactLocationProvider';

export function SiteFooter({ logoSrc, contacts }: { logoSrc: string; contacts: FooterContent['contacts'] }) {
  const contactLocation = useContactLocation();
  const [aboutExpanded, setAboutExpanded] = useState(false);
  const visibleAboutLinks = aboutLinks.slice(0, 5);
  const remainingAboutLinks = aboutLinks.slice(5);

  return (
    <footer id="site-footer" className={styles.footer}>
      <div className="container">
        <div className={styles.grid}>
          <div className={styles.about}>
            <Link href="/" className={styles.logo} aria-label="Valia School of Management home">
              <img src={logoSrc} alt="Valia School of Management" width={266} height={78} />
            </Link>
            <p>{footer.about}</p>
          </div>

          <nav aria-labelledby="footer-specialisation">
            <h2 id="footer-specialisation" className={styles.heading}>
              Specialisation
            </h2>
            <ul className={styles.links} role="list">
              {specialisationLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href}>{link.label}</Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-labelledby="footer-about">
            <h2 id="footer-about" className={styles.heading}>About Us</h2>
            <ul className={`${styles.links} ${styles.aboutLinks}`} role="list">
              {visibleAboutLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} target={link.href.endsWith('.pdf') ? '_blank' : undefined} rel={link.href.endsWith('.pdf') ? 'noopener noreferrer' : undefined}>{link.label}</Link>
                </li>
              ))}
            </ul>
            {remainingAboutLinks.length > 0 && (
              <>
                <div className={`${styles.moreLinks} ${aboutExpanded ? styles.moreLinksExpanded : ''}`} aria-hidden={!aboutExpanded}>
                  <ul className={`${styles.links} ${styles.aboutLinks}`} role="list">
                    {remainingAboutLinks.map((link) => (
                      <li key={link.href}>
                        <Link href={link.href} tabIndex={aboutExpanded ? undefined : -1} target={link.href.endsWith('.pdf') ? '_blank' : undefined} rel={link.href.endsWith('.pdf') ? 'noopener noreferrer' : undefined}>{link.label}</Link>
                      </li>
                    ))}
                  </ul>
                </div>
                <button
                  type="button"
                  className={styles.aboutToggle}
                  aria-expanded={aboutExpanded}
                  onClick={() => setAboutExpanded((expanded) => !expanded)}
                >
                  {aboutExpanded ? 'Show Less ↑' : 'Show More ↓'}
                </button>
              </>
            )}
            <ul className={`${styles.links} ${styles.careerLinks}`} role="list">
              {careerAndBlogLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href}>{link.label}</Link>
                </li>
              ))}
            </ul>
          </nav>

          <div>
            <h2 className={styles.heading}>{contacts.heading}</h2>
            <ul className={styles.contacts} role="list">
              <li>
                <span className={styles.contactIcon}>
                  <Icon src={icons.mailOutline} />
                </span>
                <a href={`mailto:${contacts.email}`}>{contacts.email}</a>
              </li>
              <li>
                <span className={styles.contactIcon}>
                  <Icon src={icons.callOutline} />
                </span>
                <span>
                  {contacts.phones.map((phone, index) => <span key={`${phone.href}-${phone.label}`}>
                    {index > 0 && ' | '}<a href={phone.href}>{phone.label}</a>
                  </span>)}
                </span>
              </li>
              <li>
                <span className={styles.contactIcon}>
                  <Icon src={icons.location} />
                </span>
                <address>{contactLocation.isContactPage
                  ? <><strong>{contactLocation.selectedLocation.label}</strong>{contactLocation.selectedLocation.address && <><br />{contactLocation.selectedLocation.mapLink
                    ? <a href={contactLocation.selectedLocation.mapLink} target="_blank" rel="noreferrer">{contactLocation.selectedLocation.address}</a>
                    : contactLocation.selectedLocation.address}</>}</>
                    : contacts.address}</address>
              </li>
            </ul>
          </div>
        </div>

        <nav className={styles.bottomNav} aria-label="Footer">
          <ul role="list">
            {footer.bottomLinks.map((link) => (
              <li key={link.label}>
                <Link
                  href={link.href}
                  target={link.href === 'https://fees.easebuzz.in/cf/vsmedu-online' ? '_blank' : undefined}
                  rel={link.href === 'https://fees.easebuzz.in/cf/vsmedu-online' ? 'noopener noreferrer' : undefined}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <p className={styles.copyright}>{footer.copyright}</p>
      </div>
    </footer>
  );
}
