import Image from 'next/image';
import Link from 'next/link';
import { aboutLinks, careerAndBlogLinks, contact, footer, specialisationLinks } from '@/content/site';
import { Icon } from '@/components/ui/Icon';
import { icons } from '@/components/ui/icons';
import { PhoneList } from '@/components/ui/PhoneList';
import styles from './SiteFooter.module.css';

export function SiteFooter() {
  return (
    <footer className={styles.footer}>
      <div className="container">
        <div className={styles.grid}>
          <div className={styles.about}>
            <Link href="/" className={styles.logo} aria-label="Valia School of Management home">
              <Image src="/images/brand/vsm-logo.webp" alt="Valia School of Management" width={413} height={121} />
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
                  <Link href={link.href}>PGDM in {link.label}</Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-labelledby="footer-about">
            <h2 id="footer-about" className={styles.heading}>
              About
            </h2>
            <ul className={styles.links} role="list">
              {[...aboutLinks, ...careerAndBlogLinks].map((link) => (
                <li key={link.href}>
                  <Link href={link.href}>{link.label}</Link>
                </li>
              ))}
            </ul>
          </nav>

          <div>
            <h2 className={styles.heading}>Contacts</h2>
            <ul className={styles.contacts} role="list">
              <li>
                <span className={styles.contactIcon}>
                  <Icon src={icons.mailOutline} />
                </span>
                <a href={`mailto:${contact.email}`}>{contact.email}</a>
              </li>
              <li>
                <span className={styles.contactIcon}>
                  <Icon src={icons.callOutline} />
                </span>
                <PhoneList />
              </li>
              <li>
                <span className={styles.contactIcon}>
                  <Icon src={icons.location} />
                </span>
                <address>{contact.address}</address>
              </li>
            </ul>
          </div>
        </div>

        <nav className={styles.bottomNav} aria-label="Footer">
          <ul role="list">
            {footer.bottomLinks.map((link) => (
              <li key={link.label}>
                <a href={link.href}>{link.label}</a>
              </li>
            ))}
          </ul>
        </nav>

        <p className={styles.copyright}>{footer.copyright}</p>
      </div>
    </footer>
  );
}
