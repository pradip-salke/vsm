import Link from 'next/link';
import type { ComponentPropsWithoutRef, ReactNode } from 'react';
import { Icon } from './Icon';
import { icons } from './icons';
import styles from './Button.module.css';

/**
 * Buttons from the Figma "Buttons" style guide:
 * - primary: teal pill
 * - arrow:   uppercase tracked label + tilted arrow + underline (secondary)
 */
type Variant = 'primary' | 'arrow';
type Tone = 'dark' | 'light' | 'muted';

type CommonProps = {
  variant?: Variant;
  tone?: Tone;
  size?: 'md' | 'lg';
  className?: string;
  children: ReactNode;
};

type LinkProps = CommonProps & { href: string } & Omit<ComponentPropsWithoutRef<'a'>, 'href' | 'className' | 'children'>;
type NativeButtonProps = CommonProps & { href?: undefined } & Omit<ComponentPropsWithoutRef<'button'>, 'className' | 'children'>;

export function Button(props: LinkProps | NativeButtonProps) {
  const { variant = 'primary', tone = 'dark', size = 'md', className, children, ...rest } = props;
  const classes = [styles.button, styles[variant], styles[tone], styles[size], className].filter(Boolean).join(' ');
  const content = (
    <>
      <span>{children}</span>
      {variant === 'arrow' && <Icon src={icons.arrow} className={styles.arrowIcon} />}
    </>
  );

  if ('href' in rest && rest.href !== undefined) {
    const { href, ...anchorProps } = rest as LinkProps;
    const isExternal = /^https?:\/\//.test(href);
    if (isExternal) {
      return (
        <a className={classes} href={href} target="_blank" rel="noopener noreferrer" {...anchorProps}>
          {content}
        </a>
      );
    }
    return (
      <Link className={classes} href={href} {...anchorProps}>
        {content}
      </Link>
    );
  }

  const { type = 'button', ...buttonProps } = rest as NativeButtonProps;
  return (
    <button className={classes} type={type} {...buttonProps}>
      {content}
    </button>
  );
}
