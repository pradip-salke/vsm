import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Icon } from './Icon';
import { findAdminPage, getAdminSearchIndex, type AdminSearchIndexEntry } from './navigation';
import type { AdminUser } from './LoginPage';
import { useVoiceSearch } from './useVoiceSearch';

type Props = { user: AdminUser; onToggleSidebar: () => void; onLogout: () => void; onStartTour?: () => void; tourAvailable?: boolean };

const WEB_BASE = import.meta.env.VITE_WEB_BASE_URL ?? 'http://localhost:3000';

type Panel = 'voice' | 'tour' | 'profile' | null;

function escapeRegExp(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function highlightMatch(text: string, query: string): ReactNode {
  const q = query.trim();
  if (!q) return text;
  const re = new RegExp(`(${escapeRegExp(q)})`, 'gi');
  const parts = text.split(re);
  return parts.map((part, i) => {
    if (part.toLowerCase() === q.toLowerCase()) {
      return <mark key={i} className="topbar-search-mark">{part}</mark>;
    }
    return <span key={i}>{part}</span>;
  });
}

export function Topbar({ user, onToggleSidebar, onLogout, onStartTour, tourAvailable = false }: Props) {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [panel, setPanel] = useState<Panel>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const searchWrapRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const details = findAdminPage(pathname);
  const screenTitle = pathname === '/' ? 'Dashboard' : (details?.page.label ?? 'Workspace');

  const searchIndex = useMemo(() => getAdminSearchIndex(), []);

  const { groupedHits, flatHits } = useMemo(() => {
    const q = searchQuery.trim().toLocaleLowerCase();
    if (!q) return { groupedHits: [] as { categoryLabel: string; categoryOrder: number; items: AdminSearchIndexEntry[] }[], flatHits: [] as AdminSearchIndexEntry[] };
    const filtered = searchIndex.filter((entry) => entry.searchBlob.includes(q));
    const byCategory = new Map<string, AdminSearchIndexEntry[]>();
    for (const entry of filtered) {
      const key = entry.categoryLabel;
      const list = byCategory.get(key) ?? [];
      list.push(entry);
      byCategory.set(key, list);
    }
    for (const list of byCategory.values()) {
      list.sort((a, b) => a.title.localeCompare(b.title));
    }
    const categoryMeta = new Map<string, number>();
    for (const entry of filtered) {
      const prev = categoryMeta.get(entry.categoryLabel);
      if (prev === undefined || entry.categoryOrder < prev) categoryMeta.set(entry.categoryLabel, entry.categoryOrder);
    }
    const sortedLabels = [...byCategory.keys()].sort((a, b) => {
      const oa = categoryMeta.get(a) ?? 99;
      const ob = categoryMeta.get(b) ?? 99;
      if (oa !== ob) return oa - ob;
      return a.localeCompare(b);
    });
    const groupedHits = sortedLabels.map((categoryLabel) => ({
      categoryLabel,
      categoryOrder: categoryMeta.get(categoryLabel) ?? 99,
      items: byCategory.get(categoryLabel)!,
    }));
    return { groupedHits, flatHits: filtered };
  }, [searchIndex, searchQuery]);

  const displayName = (user.name || user.email?.split('@')[0] || 'Admin').trim();
  const avatarLetter = (displayName[0] || 'A').toUpperCase();
  const roleSummary = useMemo(() => {
    const roles = user.roles?.filter(Boolean) ?? [];
    if (roles.length) return roles.map((r) => r.replace(/-/g, ' ').toUpperCase()).join(' · ');
    const fromPerms = user.permissions?.some((p) => p.endsWith('.write')) ? 'EDITOR' : user.permissions?.length ? 'ADMIN' : '';
    return fromPerms || 'ADMINISTRATOR';
  }, [user.roles, user.permissions]);
  const trimmedQuery = searchQuery.trim();

  const voice = useVoiceSearch((text, isFinal) => {
    setSearchQuery(text);
    if (!isFinal) return;
    voice.abort();
    setPanel(null);
    setSearchOpen(true);
    searchInputRef.current?.focus();
  });

  const togglePanel = useCallback((name: NonNullable<Panel>) => {
    voice.abort();
    setSearchOpen(false);
    setPanel((current) => (current === name ? null : name));
  }, [voice.abort]);

  function toggleVoice() {
    if (panel === 'voice') {
      closePanels();
      return;
    }
    setPanel('voice');
    setSearchOpen(false);
    void voice.start();
  }

  const closePanels = useCallback(() => {
    voice.abort();
    setPanel(null);
    setSearchOpen(false);
  }, [voice.abort]);

  useEffect(() => {
    closePanels();
  }, [pathname, closePanels]);

  useEffect(() => {
    function onDocMouseDown(event: MouseEvent) {
      const target = event.target as Node;
      if (searchWrapRef.current?.contains(target)) return;
      if (panel === 'voice') closePanels();
      setSearchOpen(false);
    }
    function onDocKey(event: KeyboardEvent) {
      if (event.key === 'Escape') closePanels();
    }
    document.addEventListener('pointerdown', onDocMouseDown);
    document.addEventListener('keydown', onDocKey);
    return () => {
      document.removeEventListener('pointerdown', onDocMouseDown);
      document.removeEventListener('keydown', onDocKey);
    };
  }, [closePanels, panel]);

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        closePanels();
        searchInputRef.current?.focus();
        setSearchOpen(true);
      }
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [closePanels]);

  function goTo(path: string) {
    navigate(path);
    setSearchQuery('');
    setSearchOpen(false);
    setPanel(null);
  }

  return (
    <header className="admin-topbar">
      <div className="topbar-left">
        <button data-tour="sidebar-toggle" className="icon-button topbar-menu-button" type="button" onClick={onToggleSidebar} aria-label="Toggle sidebar" title="Toggle sidebar">
          <Icon name="menu" />
        </button>
        <nav className="breadcrumbs" aria-label="Breadcrumb">
          <span className="breadcrumb-root">Admin</span>
          <span className="breadcrumb-sep" aria-hidden>/</span>
          <span className="breadcrumb-current">{screenTitle}</span>
        </nav>
      </div>

      <div className="topbar-center" data-tour="global-search" ref={searchWrapRef}>
        <div className={`topbar-search ${searchOpen || searchQuery ? 'is-active' : ''}`}>
          <span className="topbar-search-icon" aria-hidden>
            <Icon name="search" size={18} />
          </span>
          <input
            ref={searchInputRef}
            id="admin-topbar-search"
            type="text"
            className="topbar-search-input"
            placeholder="Search pages, blogs, enquiries… (Ctrl+K)"
            autoComplete="off"
            autoCorrect="off"
            spellCheck={false}
            aria-label="Search CMS pages and modules"
            aria-expanded={searchOpen}
            aria-controls="admin-topbar-search-results"
            aria-autocomplete="list"
            value={searchQuery}
            onChange={(event) => {
              setSearchQuery(event.target.value);
              setSearchOpen(true);
            }}
            onFocus={() => {
              voice.abort();
              setPanel(null);
              setSearchOpen(true);
            }}
          />
          {trimmedQuery && (
            <button
              className="topbar-search-clear"
              type="button"
              onClick={() => {
                setSearchQuery('');
                searchInputRef.current?.focus();
                setSearchOpen(true);
              }}
              aria-label="Clear search"
            >
              <Icon name="x" size={16} />
            </button>
          )}
          <button
            className={`topbar-search-mic ${panel === 'voice' || voice.listening ? 'is-selected' : ''}`}
            type="button"
            onClick={toggleVoice}
            aria-label={panel === 'voice' ? 'Close voice search' : 'Voice search'}
            aria-pressed={voice.listening}
            aria-expanded={panel === 'voice'}
            aria-controls="admin-voice-search"
            title={panel === 'voice' ? 'Close voice search' : 'Voice search'}
          >
            <Icon name="mic" size={18} />
          </button>
        </div>
        {searchOpen && trimmedQuery && (
          <div id="admin-topbar-search-results" className="topbar-search-results" role="listbox" aria-label="Matching pages">
            {flatHits.length === 0 ? (
              <p className="topbar-search-empty">No matching pages or modules</p>
            ) : (
              groupedHits.map((group) => (
                <div key={group.categoryLabel} className="topbar-search-group">
                  <div className="topbar-search-group-label" aria-hidden>
                    {group.categoryLabel}
                  </div>
                  {group.items.map((item) => (
                    <button
                      key={`${item.path}-${item.title}`}
                      type="button"
                      className="topbar-search-hit"
                      role="option"
                      onClick={() => goTo(item.path)}
                    >
                      <span className="topbar-search-hit-label">{highlightMatch(item.title, trimmedQuery)}</span>
                      <span className="topbar-search-hit-desc">{highlightMatch(item.subtitle, trimmedQuery)}</span>
                    </button>
                  ))}
                </div>
              ))
            )}
          </div>
        )}
        {panel === 'voice' && (
          <div id="admin-voice-search" className="topbar-popover popover-voice" role="dialog" aria-label="Voice search">
            <button
              type="button"
              className="icon-button"
              style={{ float: 'right' }}
              aria-label="Close voice search"
              title="Close voice search"
              onClick={() => {
                closePanels();
                searchInputRef.current?.focus();
              }}
            >
              <Icon name="x" size={16} />
            </button>
            <strong>{voice.listening ? 'Listening…' : 'Voice search'}</strong>
            <p role="status" aria-live="polite">
              {voice.message || 'Tap the mic and say a page or module name, for example “blog posts”.'}
            </p>
            {voice.listening ? (
              <button type="button" className="popover-link" onClick={closePanels}>
                Stop listening <Icon name="x" size={15} />
              </button>
            ) : voice.status !== 'unsupported' && (
              <button type="button" className="popover-link" onClick={() => void voice.start()}>
                {voice.status === 'error' ? 'Try again' : 'Start listening'} <Icon name="mic" size={15} />
              </button>
            )}
          </div>
        )}
      </div>

      <div className="topbar-actions" data-tour="topbar-actions">
        <button
          data-tour="topbar-tour"
          className={`topbar-outline-btn ${panel === 'tour' ? 'is-selected' : ''}`}
          type="button"
          onClick={() => {
            if (tourAvailable && onStartTour) { closePanels(); onStartTour(); }
            else togglePanel('tour');
          }}
          aria-expanded={panel === 'tour'}
          aria-haspopup="dialog"
        >
          <Icon name="help" size={17} />
          <span>Tour</span>
        </button>
        <a className="topbar-outline-btn topbar-website-link" href={WEB_BASE} target="_blank" rel="noopener noreferrer">
          <Icon name="external" size={17} />
          <span>Website</span>
        </a>
        <button
          className={`profile-trigger profile-trigger--pill ${panel === 'profile' ? 'is-selected' : ''}`}
          type="button"
          onClick={() => togglePanel('profile')}
          aria-label={`${displayName} profile menu`}
          aria-haspopup="dialog"
          aria-expanded={panel === 'profile'}
        >
          <span className="avatar avatar--brand" aria-hidden>
            {avatarLetter}
          </span>
          <span className="profile-name">{displayName}</span>
          <Icon name="chevrons" size={15} className="profile-chevron" />
        </button>
        {panel === 'tour' && (
          <div className="topbar-popover popover-tour" role="dialog" aria-label="Workspace tour">
            <strong>Workspace tour</strong>
            <p>Use the sidebar to browse Website Pages, Enquiries, and Settings. Press Ctrl+K anytime to jump to a CMS screen.</p>
            <button type="button" className="popover-link" onClick={() => { setPanel(null); navigate('/'); }}>
              Go to dashboard <Icon name="arrow" size={15} />
            </button>
          </div>
        )}
        {panel === 'profile' && (
          <div className="topbar-popover popover-profile profile-menu-popover" role="dialog" aria-label="Profile menu">
            <div className="profile-menu-header">
              <div className="avatar avatar--brand avatar--profile-menu" aria-hidden>
                {avatarLetter}
              </div>
              <div className="profile-menu-meta">
                <strong className="profile-menu-name">{displayName}</strong>
                <span className="profile-menu-email">{user.email}</span>
                <span className="profile-menu-role-badge">
                  <span className="profile-menu-role-label">Role</span>
                  <span className="profile-menu-role-value">{roleSummary}</span>
                </span>
              </div>
            </div>
            <div className="profile-menu-divider" role="presentation" />
            <div className="profile-menu-actions">
              <button type="button" className="popover-link profile-menu-link" onClick={() => { setPanel(null); navigate('/settings/profile'); }}>
                <Icon name="user" size={16} />
                <span>My profile</span>
              </button>
              <button type="button" className="popover-link profile-menu-link" onClick={() => { setPanel(null); navigate('/seo'); }}>
                <Icon name="star" size={16} />
                <span>SEO Studio</span>
                <span className="profile-menu-item-badge" title="Premium workspace tooling">PRO</span>
              </button>
              <button type="button" className="popover-link popover-logout profile-menu-link" onClick={onLogout}>
                <Icon name="logout" size={16} />
                <span>Logout</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
