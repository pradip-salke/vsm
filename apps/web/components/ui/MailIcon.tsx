import { Icon } from './Icon';
import styles from './MailIcon.module.css';

const PARTS = {
  light: ['/images/figma/icon-mail-a.svg', '/images/figma/icon-mail-b.svg'],
  dark: ['/images/figma/icon-mail-dark-a.svg', '/images/figma/icon-mail-dark-b.svg'],
} as const;

/** Figma exports the envelope as two layers (flap + body); they are stacked here and take `currentColor`. */
export function MailIcon({ variant = 'light', className }: { variant?: keyof typeof PARTS; className?: string }) {
  const [body, flap] = PARTS[variant];
  return (
    <span className={className ? `${styles.mail} ${className}` : styles.mail} aria-hidden>
      <Icon src={flap} className={styles.flap} />
      <Icon src={body} className={styles.body} />
    </span>
  );
}
