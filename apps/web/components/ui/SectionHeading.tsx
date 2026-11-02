import type { ReactNode } from 'react';
import styles from './SectionHeading.module.css';

type SectionHeadingProps = {
  id?: string;
  eyebrow?: string;
  title: ReactNode;
  /** `display` = 110px "ABOUT US"; `h1` = 60px section title; `h2` = 40px sidebar-size title. */
  size?: 'display' | 'h1' | 'h2';
  as?: 'h1' | 'h2' | 'h3';
  tone?: 'dark' | 'light';
  /** Eyebrow colour: teal on light backgrounds, white/black on some dark blocks. */
  eyebrowTone?: 'primary' | 'plain';
  align?: 'start' | 'center';
  uppercase?: boolean;
  rule?: boolean;
  children?: ReactNode;
  className?: string;
};

export function SectionHeading({
  id,
  eyebrow,
  title,
  size = 'h1',
  as: Tag = 'h2',
  tone = 'dark',
  eyebrowTone = 'primary',
  align = 'start',
  uppercase = false,
  rule = false,
  children,
  className,
}: SectionHeadingProps) {
  const classes = [styles.heading, styles[tone], styles[align], rule && styles.withRule, className].filter(Boolean).join(' ');
  return (
    <div className={classes}>
      {eyebrow && <p className={`${styles.eyebrow} ${styles[`eyebrow-${eyebrowTone}`]}`}>{eyebrow}</p>}
      <Tag id={id} className={`${styles.title} ${styles[size]} ${uppercase ? styles.uppercase : ''}`}>
        {title}
      </Tag>
      {children && <div className={styles.description}>{children}</div>}
    </div>
  );
}
