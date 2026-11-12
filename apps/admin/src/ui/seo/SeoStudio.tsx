import { useEffect, useState } from 'react';
import { Link, NavLink, Navigate, useParams, useSearchParams } from 'react-router-dom';
import { api } from '../../lib/api';
import { Icon } from '../Icon';
import { SeoAuditTab } from './SeoAuditTab';
import { SeoPageTab } from './SeoPageTab';
import { SeoGlobalTab, SeoRobotsTab, SeoTrackingTab } from './SeoSettingsTabs';
import { LoadingCard, SeoIcon, WEB_BASE, errorText } from './seoShared';
import '../home-editor.css';
import './seo-studio.css';

export const SEO_STUDIO_PATH = '/seo';

export const SEO_TABS = [
  { id: 'overview', label: 'Overview', icon: SeoIcon.overview },
  { id: 'page-seo', label: 'Page SEO', icon: SeoIcon.page },
  { id: 'global-settings', label: 'Global Settings', icon: SeoIcon.globe },
  { id: 'tracking', label: 'Tracking & Custom Code', icon: SeoIcon.code },
  { id: 'robots', label: 'Robots & Sitemaps', icon: SeoIcon.sitemap },
  { id: 'audit', label: 'SEO Audit', icon: SeoIcon.audit },
] as const;

export type SeoTabId = (typeof SEO_TABS)[number]['id'];
export const seoTabPath = (tab: SeoTabId) => `${SEO_STUDIO_PATH}/${tab}`;

/** Links from the interim layout, where robots and audit were sections of other tabs. */
const LEGACY_SECTIONS: Record<string, SeoTabId> = { robots: 'robots', audit: 'audit' };

type Overview = { pagesWithOverrides: number; verifiedCount: number; totalEngines: number; analyticsConnected: boolean; trackingConnected: number; publicUrls: number; siteUrl: string };

export function SeoStudio({ canEdit }: { canEdit: boolean }) {
  const { tab } = useParams();
  const [searchParams] = useSearchParams();
  const active = SEO_TABS.find((t) => t.id === tab);
  if (!active) return <Navigate to={seoTabPath('overview')} replace />;
  const legacy = LEGACY_SECTIONS[searchParams.get('section') ?? ''];
  if (legacy && legacy !== active.id) return <Navigate to={seoTabPath(legacy)} replace />;

  return (
    <div className="cms-editor seo-studio">
      <header className="seo-header">
        <div>
          <nav className="cms-breadcrumbs" aria-label="Breadcrumb">
            <span>SEO Studio</span>
            <span className="cms-breadcrumb-sep">/</span>
            <span className="cms-breadcrumb-current">{active.label}</span>
          </nav>
          <h1 className="seo-title">SEO Studio</h1>
          <p className="seo-subtitle">
            Manage search appearance for the whole website. The SEO already built into each page stays exactly as it is; anything you set here is added on top or overrides only the fields you fill in.
          </p>
        </div>
        <a className="seo-icon-link" href={`${WEB_BASE}/`} target="_blank" rel="noopener noreferrer" title="Visit the live website" aria-label="Visit the live website">
          <Icon name="external" size={17} />
        </a>
      </header>

      <nav className="seo-tabs" aria-label="SEO Studio sections">
        {SEO_TABS.map((t) => (
          <NavLink key={t.id} to={seoTabPath(t.id)} className={({ isActive }) => `seo-tab${isActive ? ' is-active' : ''}`}>
            {t.icon(16)}
            <span>{t.label}</span>
          </NavLink>
        ))}
      </nav>

      {!canEdit && active.id !== 'overview' && active.id !== 'audit' ? (
        <div className="seo-alert is-info" role="note"><span>You have read-only access. Ask an administrator for page editing permission to change SEO settings.</span></div>
      ) : null}

      {active.id === 'overview' && <SeoOverviewTab />}
      {active.id === 'page-seo' && <SeoPageTab canEdit={canEdit} />}
      {active.id === 'global-settings' && <SeoGlobalTab canEdit={canEdit} />}
      {active.id === 'tracking' && <SeoTrackingTab canEdit={canEdit} />}
      {active.id === 'robots' && <SeoRobotsTab canEdit={canEdit} />}
      {active.id === 'audit' && <SeoAuditTab />}
    </div>
  );
}

function SeoOverviewTab() {
  const [data, setData] = useState<Overview | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api<{ data: Overview }>('/admin/seo/overview')
      .then(({ data }) => setData(data))
      .catch((cause) => setError(errorText(cause, 'Could not load the SEO overview')));
  }, []);

  if (error) return <div className="seo-alert is-error" role="alert"><span>{error}</span></div>;
  if (!data) return <LoadingCard text="Loading SEO overview…" />;

  const stats = [
    { icon: SeoIcon.page(20), tone: 'navy', value: data.pagesWithOverrides, label: 'Pages with SEO overrides' },
    { icon: SeoIcon.shield(20), tone: 'cyan', value: `${data.verifiedCount} / ${data.totalEngines}`, label: 'Search engines verified' },
    { icon: SeoIcon.bars(20), tone: data.analyticsConnected ? 'green' : 'amber', value: data.trackingConnected, label: data.analyticsConnected ? 'Analytics connected' : 'Analytics not connected' },
    { icon: SeoIcon.audit(20), tone: 'slate', value: data.publicUrls, label: 'Public URLs to audit' },
  ];

  const rules = [
    ['Existing SEO is preserved.', 'Titles, descriptions and canonical links already coded into each page are never removed.'],
    ['Page SEO', 'lets you override any of those tags for a single URL. Leave a field empty to keep the original.'],
    ['Global settings', 'add verification codes, a default share image and Organization schema only where they are missing.'],
    ['Tracking & custom code', 'adds Google Analytics, Tag Manager, Meta Pixel, Clarity or your own snippets to every public page.'],
    ['Robots & sitemaps', 'keeps the XML sitemaps generated from live pages and blog posts, and manages robots.txt crawler rules.'],
    ['SEO audit', 'fetches every public URL and checks titles, descriptions, headings, canonicals, share images and image alt text.'],
  ];

  const links = [
    { to: `${seoTabPath('page-seo')}?path=${encodeURIComponent('/')}`, icon: <Icon name="home" size={18} />, tone: 'navy', title: 'Home page SEO', sub: 'Title, description, share image' },
    { to: seoTabPath('audit'), icon: SeoIcon.audit(18), tone: 'cyan', title: 'Run SEO audit', sub: 'Check all pages at once' },
    { to: seoTabPath('global-settings'), icon: SeoIcon.globe(18), tone: 'slate', title: 'Global settings & schema', sub: 'Verification tags & Organization schema' },
    { to: seoTabPath('tracking'), icon: SeoIcon.code(18), tone: 'amber', title: 'Tracking & custom code', sub: 'Google Analytics, GTM & Pixel' },
    { to: seoTabPath('robots'), icon: SeoIcon.sitemap(18), tone: 'green', title: 'Robots & sitemaps', sub: 'robots.txt and XML sitemaps' },
  ];

  return (
    <div className="seo-pane">
      <div className="seo-stats">
        {stats.map((stat) => (
          <div className="seo-stat-card" key={stat.label}>
            <span className={`seo-stat-icon tone-${stat.tone}`}>{stat.icon}</span>
            <span>
              <strong className="seo-stat-value">{stat.value}</strong>
              <span className="seo-stat-label">{stat.label}</span>
            </span>
          </div>
        ))}
      </div>
      <div className="seo-two-col">
        <section className="seo-card">
          <h2 className="seo-card-title">How the SEO module works</h2>
          <ul className="seo-rules">
            {rules.map(([strong, rest]) => (
              <li key={strong}>
                <span className="seo-check-badge"><Icon name="check" size={13} /></span>
                <span><strong>{strong}</strong> {rest}</span>
              </li>
            ))}
          </ul>
        </section>
        <section className="seo-card">
          <h2 className="seo-card-title">Quick links</h2>
          <div className="seo-quick-links">
            {links.map((link) => (
              <Link key={link.title} to={link.to} className="seo-quick-link">
                <span className={`seo-stat-icon tone-${link.tone}`}>{link.icon}</span>
                <span>
                  <span className="seo-quick-title">{link.title}</span>
                  <span className="seo-quick-sub">{link.sub}</span>
                </span>
                <Icon name="chevronRight" size={16} className="seo-quick-chevron" />
              </Link>
            ))}
          </div>
          <p className="seo-muted-note">Public website: <a href={data.siteUrl} target="_blank" rel="noopener noreferrer">{data.siteUrl}</a></p>
        </section>
      </div>
    </div>
  );
}
