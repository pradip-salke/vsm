'use client';

import Image from 'next/image';
import { Link } from '@/components/navigation/Link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useId, useRef, useState, type MouseEvent } from 'react';
import { drawerNav, mainNav, type NavItem } from '@/content/site';
import type { FooterSocialLink } from '@vsmedu/contracts/footer';
import { Icon } from '@/components/ui/Icon';
import { icons } from '@/components/ui/icons';
import { TopBar } from './TopBar';
import styles from './SiteHeader.module.css';
import { useContactLocation } from './ContactLocationProvider';

function DesktopNavItem({ item, pathname }: { item: NavItem; pathname: string }) {
  const router = useRouter();
  const contactLocation = useContactLocation();
  const contactMenu = item.label === 'Contact';
  const matches = (href: string) => { const path = href.replace(/\/$/, ''); return path && (pathname === path || pathname.startsWith(`${path}/`)); };
  const active = item.label === 'About Us' ? pathname.startsWith('/about-us/') : item.label === 'Academics' ? pathname.startsWith('/our-academics/') || pathname === '/faculty' || ['/committee', '/anti-ragging-policy', '/eoa-report'].includes(pathname) : item.label === 'Events' ? pathname.startsWith('/events') || ['/list-of-speakers', '/videos-of-speakers'].includes(pathname) : matches(item.href) || item.children?.some(child => matches(child.href));
  const [open, setOpen] = useState(false);
  const [openSubmenu, setOpenSubmenu] = useState<string | null>(null);
  const [dismissed, setDismissed] = useState(false);
  const menuId = useId();
  const ref = useRef<HTMLLIElement>(null);
  const previousPathname = useRef(pathname);

  useEffect(() => {
    if (previousPathname.current === pathname) return;
    previousPathname.current = pathname;
    setOpen(false);
    setOpenSubmenu(null);
    setDismissed(true);
  }, [pathname]);

  if (!item.children && !contactMenu) {
    return (
      <li className={styles.navItem} data-active={active || undefined}>
        <Link className={styles.navLink} href={item.href} aria-current={active ? 'page' : undefined}>
          {item.label}
        </Link>
      </li>
    );
  }

  return (
    <li
      ref={ref}
      className={styles.navItem}
      data-active={active || undefined}
      data-open={open || undefined}
      data-dismissed={dismissed || undefined}
      onPointerEnter={() => {
        if (dismissed) setDismissed(false);
      }}
      onPointerLeave={() => {
        setOpen(false);
        setOpenSubmenu(null);
        setDismissed(false);
      }}
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
      <Link className={styles.navLink} href={item.href} aria-current={active ? 'page' : undefined} onClick={() => { setOpen(false); setDismissed(true); }}>
        {item.label}
      </Link>
      <button
        type="button"
        className={styles.chevron}
        aria-expanded={open}
        aria-controls={menuId}
        aria-label={`${item.label} menu`}
        onClick={() => {
          setDismissed(false);
          setOpen((value) => !value);
        }}
      >
        <Icon src={icons.chevronDown} />
      </button>
      <ul id={menuId} className={styles.dropdown} role="list">
        {contactMenu && !item.children && <>
          {contactLocation.locations.map((location) => <li key={location.id}>
            <button type="button" className={styles.dropdownLink} aria-current={contactLocation.selectedLocation.id === location.id ? 'true' : undefined} onClick={() => {
              contactLocation.setSelectedLocationId(location.id);
              setOpen(false);
              setDismissed(true);
              if (!contactLocation.isContactPage) router.push('/contact-us/');
            }}>{location.label}</button>
          </li>)}
        </>}
        {(item.children ?? []).map((child) => (
          <li key={child.href + child.label} className={child.children ? styles.nestedItem : undefined}>
            {child.children ? <>
              <button
                type="button"
                className={`${styles.dropdownLink} ${styles.submenuTrigger}`}
                aria-expanded={openSubmenu === child.label}
                onClick={() => setOpenSubmenu((current) => current === child.label ? null : child.label)}
              >
                {child.label}<Icon src={icons.chevronDown} className={styles.submenuChevron} />
              </button>
              <ul className={`${styles.dropdown} ${styles.submenu}`} role="list">
                {child.children.map((nested) => <li key={nested.href + nested.label}>
                  <Link className={styles.dropdownLink} href={nested.href} onClick={() => { setOpen(false); setOpenSubmenu(null); setDismissed(true); }}>
                    {nested.label}
                  </Link>
                </li>)}
              </ul>
            </> : <Link className={styles.dropdownLink} href={child.href} onClick={() => { setOpen(false); setDismissed(true); }}>
              {child.label}
            </Link>}
          </li>
        ))}
      </ul>
    </li>
  );
}

function closeOpenDrawerSiblings(event: MouseEvent<HTMLElement>) {
  const current = event.currentTarget.parentElement as HTMLDetailsElement | null;
  const siblingList = current?.parentElement?.parentElement;
  if (!current || current.open || !siblingList) return;

  siblingList.querySelectorAll<HTMLDetailsElement>(':scope > li > details').forEach((sibling) => {
    if (sibling === current) return;
    sibling.open = false;
    sibling.querySelectorAll<HTMLDetailsElement>('details[open]').forEach((nested) => {
      nested.open = false;
    });
  });
}

function MobileNav({ onNavigate }: { onNavigate: () => void }) {
  const router = useRouter();
  const contactLocation = useContactLocation();
  return (
    <ul className={styles.drawerList} role="list">
      {mainNav.map((item) =>
        item.children ? (
          <li key={item.label}>
            <details className={styles.drawerGroup}>
              <summary className={styles.drawerLink} onClick={closeOpenDrawerSiblings}>
                {item.label}
                <Icon src={icons.chevronDown} className={styles.drawerChevron} />
              </summary>
              <ul className={styles.drawerSub} role="list">
                {item.children.map((child) => (
                  <li key={child.href + child.label}>
                    {child.children ? <details className={styles.drawerNested}>
                      <summary className={styles.drawerNestedLink} onClick={closeOpenDrawerSiblings}>{child.label}<Icon src={icons.chevronDown} className={styles.drawerChevron} /></summary>
                      <ul className={styles.drawerNestedSub} role="list">
                        {child.children.map((nested) => <li key={nested.href + nested.label}>
                          <Link href={nested.href} onClick={onNavigate}>{nested.label}</Link>
                        </li>)}
                      </ul>
                    </details> : <Link href={child.href} onClick={(event) => {
                      event.currentTarget.closest('details')?.removeAttribute('open');
                      onNavigate();
                    }}>
                      {child.label}
                    </Link>}
                  </li>
                ))}
              </ul>
            </details>
          </li>
        ) : item.label === 'Contact' ? (
          <li key={item.label}>
            <details className={styles.drawerGroup}>
              <summary className={styles.drawerLink} onClick={closeOpenDrawerSiblings}>
                {item.label}<Icon src={icons.chevronDown} className={styles.drawerChevron} />
              </summary>
              <ul className={styles.drawerSub} role="list">
                {contactLocation.locations.map((location) => <li key={location.id}>
                  <button type="button" className={styles.drawerLocation} aria-current={contactLocation.selectedLocation.id === location.id ? 'true' : undefined} onClick={() => {
                    contactLocation.setSelectedLocationId(location.id);
                    if (!contactLocation.isContactPage) router.push('/contact-us/');
                    onNavigate();
                  }}>{location.label}</button>
                </li>)}
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

export function SiteHeader({ logoSrc, socials }: { logoSrc: string; socials?: FooterSocialLink[] }) {
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
      <TopBar socials={socials} />
      <div className={styles.mainBar}>
        <div className={`container ${styles.inner}`}>
          <div className={styles.brand}>
            <Link href="/" className={styles.logo} aria-label="Valia School of Management home">
              <img src={logoSrc} alt="Valia School of Management" width={266} height={78} fetchPriority="high" />
            </Link>
            <Image className={styles.society} src="/images/brand/cosmopolitan-education-society.png" alt="Cosmopolitan Education Society" width={72} height={72} priority />
            <Image className={styles.years} src="/images/brand/65-years.png" alt="65 years" width={145} height={73} priority />
          </div>

          <nav className={styles.nav} aria-label="Main">
            <ul className={styles.navList} role="list">
              {mainNav.map((item) => (
                <DesktopNavItem key={item.label} item={item} pathname={pathname} />
              ))}
            </ul>
          </nav>

          <div className={styles.actions}>
            <Image className={styles.harvard} src="/images/brand/harvard-publishing.webp" alt="Harvard Business Publishing Education" width={112} height={70} priority />
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
          <img src={logoSrc} alt="" width={266} height={78} className={styles.drawerLogo} />
          <button type="button" className={styles.drawerClose} aria-label="Close menu" onClick={() => setDrawerOpen(false)}>
            <Icon src={icons.close} />
          </button>
        </div>
        <MobileNav onNavigate={() => setDrawerOpen(false)} />
      </div>
    </header>
  );
}
