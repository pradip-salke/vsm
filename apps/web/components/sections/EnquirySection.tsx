import { contact, contactCardSocials } from '@/content/site';
import { Icon } from '@/components/ui/Icon';
import { icons } from '@/components/ui/icons';
import { PhoneList } from '@/components/ui/PhoneList';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { EnquiryForm } from './EnquiryForm';
import styles from './EnquirySection.module.css';

export function EnquirySection() {
  return (
    <section id="enquire-now" className={styles.section} aria-labelledby="enquire-title">
      <div className={`container ${styles.grid}`}>
        <div>
          <SectionHeading id="enquire-title" eyebrow="Download Now" title="Enquire Now" />
          <div className={styles.form}>
            <EnquiryForm />
          </div>
        </div>

        <aside className={styles.card} aria-label="Contact details">
          <div>
            <h3 className={styles.label}>Address</h3>
            <address className={styles.value}>
              {contact.addressTitle}
              <br />
              {contact.address}
            </address>
          </div>
          <div>
            <h3 className={styles.label}>Contact</h3>
            <p className={styles.value}>
              <PhoneList />
            </p>
          </div>
          <div>
            <h3 className={styles.label}>Open Time</h3>
            <p className={styles.value}>
              {contact.openTime[0]}
              <br />
              {contact.openTime[1]}
            </p>
          </div>
          <div>
            <h3 className={styles.label}>Stay Connected</h3>
            <ul className={styles.socials} role="list">
              {contactCardSocials.map((social) => (
                <li key={social.key}>
                  {social.href ? (
                    <a href={social.href} target="_blank" rel="noopener noreferrer" aria-label={social.label} className={styles.social}>
                      <Icon src={icons.social[social.key]} />
                    </a>
                  ) : (
                    <span role="img" aria-label={social.label} className={styles.social}>
                      <Icon src={icons.social[social.key]} />
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </div>
    </section>
  );
}
