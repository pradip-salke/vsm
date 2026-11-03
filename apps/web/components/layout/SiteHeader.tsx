'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useId, useRef, useState } from 'react';
import { drawerNav, mainNav, type NavItem } from '@/content/site';
import { Icon } from '@/components/ui/Icon';
import { icons } from '@/components/ui/icons';
import { TopBar } from './TopBar';
import styles from './SiteHeader.module.css';

function DesktopNavItem({ item }: { item: NavItem }) {
  const [open, setOpen] = useState(false);
  const menuId = useId();
  const ref = useRef<HTMLLIElement>(null);

  useEffect(() => {
    if (!open) return;
    const onPointer = (event: PointerEvent) => {
      if (!ref.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener('pointerdown', onPointer);
    return () => document.removeEventListener('pointerdown', onPointer);
  }, [open]);

  if (!item.children) {
    return (
      <li className={styles.navItem}>
        <Link className={styles.navLink} href={item.href}>
          {item.label}
        </Link>
      </li>
    );
  }

  return (
    <li
      ref={ref}
      className={styles.navItem}
      data-open={open || undefined}
      onKeyDown={(event) => {
        if (event.key === 'Escape') {
          setOpen(false);
          ref.current?.querySelector<HTMLButtonElement>('button')?.focus();
        }
      }}
      onBlur={(event) => {
        if (!ref.current?.contains(event.relatedTarget as Node)) setOpen(false);
      }}
    >
      <Link className={styles.navLink} href={item.href}>
        {item.label}
      </Link>
      <button
        type="button"
        className={styles.chevron}
        aria-expanded={open}
        aria-controls={menuId}
        aria-label={`${item.label} menu`}
        onClick={() => setOpen((value) => !value)}
      >
        <Icon src={icons.chevronDown} />
      </button>
      <ul id={menuId} className={styles.dropdown} role="list">
        {item.children.map((child) => (
          <li key={child.href + child.label}>
            <Link className={styles.dropdownLink} href={child.href} onClick={() => setOpen(false)}>
              {child.label}
            </Link>
          </li>
        ))}
      </ul>
    </li>
  );
}

function MobileNav({ onNavigate }: { onNavigate: () => void }) {
  return (
    <ul className={styles.drawerList} role="list">
      {mainNav.map((item) =>
        item.children ? (
          <li key={item.label}>
            <details className={styles.drawerGroup}>
              <summary className={styles.drawerLink}>
                {item.label}
                <Icon src={icons.chevronDown} className={styles.drawerChevron} />
              </summary>
              <ul className={styles.drawerSub} role="list">
                {item.children.map((child) => (
                  <li key={child.href + child.label}>
                    <Link href={child.href} onClick={onNavigate}>
                      {child.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </details>
          </li>
        ) : (
          <li key={item.label}>
            <Link className={styles.drawerLink} href={item.href} onClick={onNavigate}>
              {item.label}
            </Link>
          </li>
        ),
      )}
      {drawerNav.map((link) => (
        <li key={link.href}>
          <Link className={`${styles.drawerLink} ${styles.drawerSecondary}`} href={link.href} onClick={onNavigate}>
            {link.label}
          </Link>
        </li>
      ))}
    </ul>
  );
}

export function SiteHeader() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const drawerRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const pathname = usePathname();

  useEffect(() => setDrawerOpen(false), [pathname]);

  useEffect(() => {
    if (!drawerOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    drawerRef.current?.querySelector<HTMLElement>('a, button, summary')?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setDrawerOpen(false);
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', onKey);
      toggleRef.current?.focus();
    };
  }, [drawerOpen]);

  return (
    <header className={styles.header}>
      <TopBar />
      <div className={styles.mainBar}>
        <div className={`container ${styles.inner}`}>
          <div className={styles.brand}>
            <Link href="/" className={styles.logo} aria-label="Valia School of Management home">
              <Image src="/images/brand/vsm-logo.svg" alt="Valia School of Management" width={266} height={78} priority />
            </Link>
            <Image className={styles.years} src="/images/brand/63-years.webp" alt="63 years" width={145} height={73} priority />
            <span className={styles.brandDivider} aria-hidden />
            <Image
              className={styles.harvard}
              src="/images/brand/harvard-publishing.webp"
              alt="Harvard Business Publishing Education"
              width={112}
              height={70}
              priority
            />
          </div>

          <nav className={styles.nav} aria-label="Main">
            <ul className={styles.navList} role="list">
              {mainNav.map((item) => (
                <DesktopNavItem key={item.label} item={item} />
              ))}
            </ul>
          </nav>

          <div className={styles.actions}>
            <Image className={styles.aicte} src="/images/brand/aicte.webp" alt="AICTE approved" width={92} height={92} priority />
            <button
              ref={toggleRef}
              type="button"
              className={styles.menuToggle}
              aria-expanded={drawerOpen}
              aria-controls="site-drawer"
              aria-label="Open menu"
              onClick={() => setDrawerOpen(true)}
            >
              <Icon src={icons.menu} />
            </button>
          </div>
        </div>
      </div>

      <div className={styles.backdrop} data-open={drawerOpen || undefined} onClick={() => setDrawerOpen(false)} aria-hidden />
      <div
        id="site-drawer"
        ref={drawerRef}
        className={styles.drawer}
        data-open={drawerOpen || undefined}
        role="dialog"
        aria-modal="true"
        aria-label="Site menu"
        inert={!drawerOpen}
      >
        <div className={styles.drawerHead}>
          <Image src="/images/brand/vsm-logo.svg" alt="" width={266} height={78} className={styles.drawerLogo} />
          <button type="button" className={styles.drawerClose} aria-label="Close menu" onClick={() => setDrawerOpen(false)}>
            <Icon src={icons.close} />
          </button>
        </div>
        <MobileNav onNavigate={() => setDrawerOpen(false)} />
      </div>
    </header>
  );
}
