import { useEffect, useMemo, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  adminMenu,
  branchSectionKey,
  isMenuLeaf,
  type AdminMenuGroup,
  type AdminMenuLink,
  type AdminMenuNode,
  findAdminPage,
  getActiveAdminMenuPath,
  normalizeMenuPath,
  permittedNodes,
} from './navigation';
import { Icon, type IconName } from './Icon';

type Props = { collapsed: boolean; mobileOpen: boolean; onToggleCollapse: () => void; onCloseMobile: () => void; onLogout: () => void; menuVisibility?: string[] | null };

function includesQuery(value: string, query: string) {
  return value.toLocaleLowerCase().includes(query);
}

function filterMenuNodes(nodes: AdminMenuNode[], query: string): AdminMenuNode[] {
  if (!query) return nodes;
  const out: AdminMenuNode[] = [];
  for (const n of nodes) {
    if (isMenuLeaf(n)) {
      if (includesQuery(n.label, query) || includesQuery(n.description ?? '', query)) out.push(n);
    } else {
      if (includesQuery(n.label, query)) {
        out.push(n);
        continue;
      }
      const children = filterMenuNodes(n.children, query);
      if (children.length) out.push({ ...n, children });
    }
  }
  return out;
}

function visibleGroup(group: AdminMenuGroup, query: string): AdminMenuGroup | null {
  if (!query || includesQuery(group.label, query)) return group;
  const children = filterMenuNodes(group.children ?? [], query);
  return children.length ? { ...group, children } : null;
}

function branchHasActiveLink(nodes: AdminMenuNode[], activeMenuPath: string | undefined): boolean {
  if (activeMenuPath === undefined) return false;
  const ap = normalizeMenuPath(activeMenuPath);
  for (const n of nodes) {
    if (isMenuLeaf(n)) {
      if (normalizeMenuPath(n.path) === ap) return true;
    } else if (branchHasActiveLink(n.children, activeMenuPath)) {
      return true;
    }
  }
  return false;
}

function RouteLink({
  item,
  pathname,
  activeMenuPath,
  onNavigate,
  nested = false,
  nestDepth = 0,
}: {
  item: AdminMenuLink;
  pathname: string;
  activeMenuPath: string | undefined;
  onNavigate: () => void;
  nested?: boolean;
  nestDepth?: number;
}) {
  const active =
    normalizeMenuPath(item.path) === '/'
      ? normalizeMenuPath(pathname) === '/'
      : activeMenuPath !== undefined && normalizeMenuPath(activeMenuPath) === normalizeMenuPath(item.path);
  return (
    <NavLink
      to={item.path}
      end
      onClick={onNavigate}
      className={`sidebar-link ${nested ? 'sidebar-link-nested' : ''} ${nestDepth > 1 ? 'sidebar-link-deep-nested' : ''} ${active ? 'is-active' : ''}`}
      aria-current={active ? 'page' : undefined}
      title={item.label}
    >
      {nested && <span className="sidebar-nested-dot" aria-hidden="true" />}
      <span className="sidebar-link-label">{item.label}</span>
    </NavLink>
  );
}

export function Sidebar({ collapsed, mobileOpen, onToggleCollapse, onCloseMobile, onLogout, menuVisibility }: Props) {
  const { pathname } = useLocation();
  const [mobileViewport, setMobileViewport] = useState(() => window.matchMedia('(max-width: 900px)').matches);
  const isCollapsed = collapsed && !mobileViewport;
  const [search, setSearch] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>(() => {
    const active = findAdminPage(pathname);
    return active ? { [active.group.id]: true } : { pages: true };
  });
  const [openSections, setOpenSections] = useState<Record<string, boolean>>(() => {
    const active = findAdminPage(pathname);
    return active?.openSectionKeys?.length ? Object.fromEntries(active.openSectionKeys.map((k) => [k, true])) : {};
  });
  const [flyoutGroup, setFlyoutGroup] = useState<string | null>(null);
  const normalized = search.trim().toLocaleLowerCase();
  const groups = useMemo(() => {
    const allowed = menuVisibility == null ? null : new Set(menuVisibility);
    return adminMenu.flatMap(group => {
      const children = allowed ? permittedNodes(group.children ?? [], allowed) : group.children;
      if (allowed && !children?.length && !(group.path && allowed.has(group.path))) return [];
      const visible = visibleGroup({ ...group, children }, normalized);
      return visible ? [visible] : [];
    });
  }, [normalized, menuVisibility]);
  const activeMenuPath = useMemo(() => getActiveAdminMenuPath(pathname), [pathname]);

  useEffect(() => {
    const media = window.matchMedia('(max-width: 900px)');
    const updateViewport = () => setMobileViewport(media.matches);
    media.addEventListener('change', updateViewport);
    return () => media.removeEventListener('change', updateViewport);
  }, []);

  useEffect(() => {
    const active = findAdminPage(pathname);
    if (!active) return;
    setOpenGroups({ [active.group.id]: true });
    setOpenSections(Object.fromEntries((active.openSectionKeys ?? []).map((key) => [key, true])));
  }, [pathname]);

  function toggleGroup(groupId: string) {
    if (isCollapsed) {
      // Parent menus opened from icon-only mode should use the regular expanded
      // sidebar layout, so submenu labels and nesting remain fully readable.
      setOpenGroups((current) => current[groupId] ? {} : { [groupId]: true });
      setOpenSections({});
      setFlyoutGroup(null);
      onToggleCollapse();
      return;
    }
    const isOpen = Boolean(openGroups[groupId]);
    setOpenGroups(isOpen ? {} : { [groupId]: true });
    setOpenSections({});
  }

  function toggleSection(id: string) {
    setOpenSections((current) => {
      const isOpen = Boolean(current[id]);
      if (isOpen) {
        return Object.fromEntries(Object.entries(current).filter(([key]) => key !== id && !key.startsWith(`${id}:`)));
      }

      const separator = id.lastIndexOf(':');
      const parentKey = separator < 0 ? '' : id.slice(0, separator);
      const siblingPrefix = `${parentKey}:`;
      return Object.fromEntries([
        ...Object.entries(current).filter(([key]) => {
          if (key === id || key.startsWith(`${id}:`)) return false;
          if (!key.startsWith(siblingPrefix)) return true;
          return key.slice(siblingPrefix.length).includes(':');
        }),
        [id, true],
      ]);
    });
  }

  function handleNavigate() {
    setFlyoutGroup(null);
    onCloseMobile();
  }

  function renderLogoutAction() {
    return <button type="button" className="sidebar-link sidebar-logout-link" onClick={() => { handleNavigate(); onLogout(); }} title="Logout">
      <Icon name="logout" size={16} />
      <span className="sidebar-link-label">Logout</span>
    </button>;
  }

  function renderBranch(
    groupId: string,
    nodes: AdminMenuNode[],
    trail: string[],
    options: { isFlyout?: boolean } = {}
  ) {
    const { isFlyout = false } = options;
    return nodes.map((child) => {
      if (isMenuLeaf(child)) {
        return <RouteLink key={child.path} item={child} pathname={pathname} activeMenuPath={activeMenuPath} nested={trail.length > 0} nestDepth={trail.length} onNavigate={handleNavigate} />;
      }
      const sectionId = branchSectionKey(groupId, trail, child.label);
      const sectionOpen = Boolean(openSections[sectionId]);
      const childIsActive = branchHasActiveLink(child.children, activeMenuPath);
      return (
        <div className={isFlyout ? 'sidebar-flyout-subgroup' : 'sidebar-subgroup'} key={sectionId}>
          <button type="button" className={`sidebar-subgroup-trigger ${childIsActive ? 'is-current' : ''}`} onClick={() => toggleSection(sectionId)} aria-expanded={sectionOpen}>
            <Icon name={child.icon as IconName} size={16} />
            <span>{child.label}</span>
            <Icon className={`sidebar-chevron ${sectionOpen ? 'is-open' : ''}`} name="chevrons" size={14} />
          </button>
          {sectionOpen && (isFlyout ? renderBranch(groupId, child.children, [...trail, child.label], { isFlyout: true }) : <div className="sidebar-subgroup-links">{renderBranch(groupId, child.children, [...trail, child.label])}</div>)}
        </div>
      );
    });
  }

  return (
    <>
      {mobileOpen && <button className="sidebar-scrim" type="button" aria-label="Close navigation menu" onClick={onCloseMobile} />}
      <aside className={`admin-sidebar ${isCollapsed ? 'is-collapsed' : ''} ${mobileOpen ? 'is-mobile-open' : ''}`} aria-label="CMS sidebar">
        <div className="sidebar-brand-row">
          <NavLink to="/" data-tour="brand" className="sidebar-brand" onClick={handleNavigate} aria-label="Valia School of Management dashboard">
            <img src="/images/brand/vsm-logo.svg" alt="Valia School of Management" />
          </NavLink>
          <button className="icon-button sidebar-collapse-button" type="button" onClick={onToggleCollapse} aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'} title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}>
            <Icon name="panel" size={18} />
          </button>
          <button className="icon-button sidebar-mobile-close" type="button" onClick={onCloseMobile} aria-label="Close sidebar"><Icon name="x" /></button>
        </div>

        <div className="sidebar-section-label">Workspace</div>
        <div data-tour="menu-search" className={`sidebar-search ${isCollapsed && searchOpen ? 'is-search-open' : ''}`}>
          {!isCollapsed && <><Icon name="search" size={17} /><input id="admin-menu-search" type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search menu" aria-label="Search admin menu" /></>}
          {isCollapsed && !searchOpen && <button className="sidebar-search-toggle" type="button" onClick={() => setSearchOpen(true)} aria-label="Search admin menu" title="Search menu"><Icon name="search" size={17} /></button>}
          {isCollapsed && searchOpen && <><Icon name="search" size={17} /><input id="admin-menu-search" type="search" autoFocus value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search menu" aria-label="Search admin menu" onKeyDown={(event) => { if (event.key === 'Escape') setSearchOpen(false); }} /><button className="sidebar-search-toggle" type="button" onClick={() => setSearchOpen(false)} aria-label="Close menu search" title="Close search"><Icon name="x" size={15} /></button></>}
        </div>

        <nav className="sidebar-navigation" aria-label="Admin navigation">
          {groups.map((group) => {
            const expandable = Boolean(group.children?.length && !group.path && !(group.id === 'dashboard' && group.children.length === 1));
            const open = Boolean(openGroups[group.id]);
            const active = findAdminPage(pathname)?.group.id === group.id;
            const iconName = group.icon as IconName;
            return (
              <div className={`sidebar-group ${active ? 'has-active-route' : ''}`} key={group.id}>
                {group.id === 'dashboard' ? (
                  <NavLink to="/" end className={({ isActive }) => `sidebar-group-trigger sidebar-dashboard-link ${isActive ? 'is-current' : ''}`} onClick={handleNavigate} title={isCollapsed ? group.label : undefined}>
                    <Icon name={iconName} size={19} />{!isCollapsed && <span>{group.label}</span>}
                  </NavLink>
                ) : group.path ? (
                  <NavLink to={group.path} className={`sidebar-group-trigger sidebar-dashboard-link ${active ? 'is-current' : ''}`} onClick={handleNavigate} aria-current={active ? 'page' : undefined} title={isCollapsed ? group.label : undefined}>
                    <Icon name={iconName} size={19} />{!isCollapsed && <span>{group.label}</span>}
                  </NavLink>
                ) : expandable ? (
                  <button type="button" className={`sidebar-group-trigger ${active ? 'is-current' : ''}`} onClick={() => toggleGroup(group.id)} aria-expanded={isCollapsed ? flyoutGroup === group.id : open} title={isCollapsed ? group.label : undefined}>
                    <Icon name={iconName} size={19} />
                    {!isCollapsed && <><span>{group.label}</span><Icon className={`sidebar-chevron ${open ? 'is-open' : ''}`} name="chevrons" size={16} /></>}
                  </button>
                ) : (
                  <RouteLink item={group.children?.[0] as AdminMenuLink} pathname={pathname} activeMenuPath={activeMenuPath} onNavigate={handleNavigate} />
                )}

                {expandable && open && !isCollapsed && (
                  <div className="sidebar-group-content">
                    {renderBranch(group.id, group.children ?? [], [])}
                    {group.id === 'settings' && renderLogoutAction()}
                  </div>
                )}

                {expandable && isCollapsed && flyoutGroup === group.id && (
                  <div className="sidebar-flyout">
                    <p>{group.label}</p>
                    {renderBranch(group.id, group.children ?? [], [], { isFlyout: true })}
                    {group.id === 'settings' && renderLogoutAction()}
                  </div>
                )}
              </div>
            );
          })}
          {groups.length === 0 && <p className="sidebar-no-results">No matching menu items</p>}
        </nav>

        <div className="sidebar-footer">
          {!isCollapsed && <><span className="sidebar-footer-dot" /><span>VSM Admin Workspace</span></>}
          {isCollapsed && <span className="sidebar-footer-dot" title="VSM Admin Workspace" />}
        </div>
      </aside>
    </>
  );
}
