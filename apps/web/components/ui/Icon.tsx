import type { CSSProperties } from 'react';
import styles from './Icon.module.css';

type IconProps = {
  /** Path to a single-colour SVG; it is used as a mask so the icon takes `currentColor`. */
  src: string;
  size?: string;
  className?: string;
  label?: string;
};

export function Icon({ src, size, className, label }: IconProps) {
  const style = { '--icon-src': `url("${src}")`, ...(size ? { '--icon-size': size } : {}) } as CSSProperties;
  return (
    <span
      className={className ? `${styles.icon} ${className}` : styles.icon}
      style={style}
      {...(label ? { role: 'img', 'aria-label': label } : { 'aria-hidden': true })}
    />
  );
}
