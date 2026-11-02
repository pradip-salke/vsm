import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { icons } from '@/components/ui/icons';
import { MailIcon } from '@/components/ui/MailIcon';
import { atAGlance } from '@/content/academics';
import { APPLY_PATH, ENQUIRY_ANCHOR } from '@/content/site';
import styles from './AtAGlance.module.css';

export function AtAGlance() {
  return (
    <div className={styles.sticky}>
      <section className={styles.glance} aria-labelledby="glance-title">
        <h2 id="glance-title" className={styles.title}>
          At a Glance
        </h2>
        <dl className={styles.facts}>
          {atAGlance.map((fact) => (
            <div key={fact.label}>
              <dt>{fact.label}</dt>
              <dd>{fact.value}</dd>
            </div>
          ))}
        </dl>
        <Button href={APPLY_PATH} size="lg" className={styles.apply}>
          Apply Now
        </Button>
      </section>
      <ul className={styles.actions} role="list">
        <li>
          <a href={ENQUIRY_ANCHOR} className={`${styles.action} ${styles.brochure}`}>
            Download Brochure
            <Icon src={icons.download} />
          </a>
        </li>
        <li>
          <a href="/contact-us/" className={styles.action}>
            Contact Us
            <MailIcon variant="dark" className={styles.mail} />
          </a>
        </li>
      </ul>
    </div>
  );
}
