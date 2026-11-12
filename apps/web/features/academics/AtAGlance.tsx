import { Button } from '@/components/ui/Button';
import { Link } from '@/components/navigation/Link';
import { Icon } from '@/components/ui/Icon';
import { icons } from '@/components/ui/icons';
import { MailIcon } from '@/components/ui/MailIcon';
import { atAGlance } from '@/content/academics';
import { APPLY_PATH, ENQUIRY_ANCHOR } from '@/content/site';
import styles from './AtAGlance.module.css';

type AtAGlanceProps = {
  title?: string;
  facts?: { label: string; value: string }[];
  applyText?: string;
  applyHref?: string;
  brochureText?: string;
  brochureHref?: string;
  contactText?: string;
  contactHref?: string;
  showActions?: boolean;
};

export function AtAGlance({ title = 'At a Glance', facts = atAGlance, applyText = 'Apply Now', applyHref = APPLY_PATH, brochureText = 'Download Brochure', brochureHref = ENQUIRY_ANCHOR, contactText = 'Contact Us', contactHref = '/contact-us/', showActions = true }: AtAGlanceProps) {
  return (
    <div className={styles.sticky}>
      <section className={styles.glance} aria-labelledby="glance-title">
        <h2 id="glance-title" className={styles.title}>
          {title}
        </h2>
        <dl className={styles.facts}>
          {facts.map((fact) => (
            <div key={fact.label}>
              <dt>{fact.label}</dt>
              <dd>{fact.value}</dd>
            </div>
          ))}
        </dl>
        <Button href={applyHref} className={styles.apply}>
          {applyText}
        </Button>
      </section>
      {showActions && (
        <ul className={styles.actions} role="list">
          <li>
            <a href={brochureHref} className={`${styles.action} ${styles.brochure}`}>
              {brochureText}
              <Icon src={icons.download} />
            </a>
          </li>
          <li>
            <Link href={contactHref} className={styles.action}>
              {contactText}
              <MailIcon variant="dark" className={styles.mail} />
            </Link>
          </li>
        </ul>
      )}
    </div>
  );
}
