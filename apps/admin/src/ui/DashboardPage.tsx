import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../lib/api';
import { Icon } from './Icon';

type DashboardData = { pages: number; programmes: number; newEnquiries: number; activeUsers: number };
const metrics: Array<{ key: keyof DashboardData; label: string; icon: 'pages' | 'package' | 'inbox' | 'users'; tone: string }> = [
  { key: 'pages', label: 'Website pages', icon: 'pages', tone: 'blue' },
  { key: 'programmes', label: 'Programmes', icon: 'package', tone: 'violet' },
  { key: 'newEnquiries', label: 'New enquiries', icon: 'inbox', tone: 'amber' },
  { key: 'activeUsers', label: 'Active users', icon: 'users', tone: 'green' },
];

export function DashboardPage({ name }: { name?: string }) {
  const [data, setData] = useState<DashboardData | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [tipVisible, setTipVisible] = useState(() => sessionStorage.getItem('vsm-dashboard-tip-dismissed') !== 'true');
  const today = new Intl.DateTimeFormat('en-IN', { weekday: 'long', day: 'numeric', month: 'short', year: 'numeric' }).format(new Date());

  useEffect(() => {
    let current = true;
    api<{ data: DashboardData }>('/admin/dashboard')
      .then((result) => { if (current) setData(result.data); })
      .catch((cause: unknown) => { if (current) setError(cause instanceof Error ? cause.message : 'Dashboard data could not be loaded.'); })
      .finally(() => { if (current) setLoading(false); });
    return () => { current = false; };
  }, []);

  return <>
    {tipVisible && <aside className="dashboard-tip"><span className="dashboard-tip-label">TIP</span><p>Choose a section from the menu to manage VSM website content, SEO, and enquiries.</p><button type="button" onClick={() => { sessionStorage.setItem('vsm-dashboard-tip-dismissed', 'true'); setTipVisible(false); }}>Got it</button></aside>}
    <div className="page-heading dashboard-heading"><div><p className="eyebrow">Workspace overview</p><h1>Dashboard</h1><p className="page-description">Welcome back. Manage your VSM website from one place.</p></div><span className="dashboard-date"><Icon name="calendar" size={16} /> {today}</span></div>
    {error && <div className="inline-error" role="alert"><Icon name="shield" size={18} /><div><strong>Dashboard data unavailable</strong><p>{error}</p></div></div>}
    <section className="dashboard-greeting"><div><span className="dashboard-greeting-kicker">VSM ADMIN WORKSPACE</span><h2>Good day, {name?.trim() || 'Admin'} <span aria-hidden="true">👋</span></h2><p>Here is what is happening with the VSM website today, {today}.</p></div><div className="dashboard-greeting-actions"><img src="/images/brand/vsm-logo.svg" alt="Valia School of Management" /><Link to="/website/home-sections" aria-label="Edit home page content"><Icon name="pages" size={20} /></Link></div></section>
    <section className="metric-grid" data-tour="dashboard-metrics" aria-label="Website overview">{metrics.map((metric) => <article className="metric-card" key={metric.key}><div className={`metric-icon metric-${metric.tone}`}><Icon name={metric.icon} size={19} /></div><div className="metric-copy"><span>{metric.label}</span><strong>{loading ? <span className="metric-skeleton" aria-label="Loading" /> : data?.[metric.key] ?? '—'}</strong></div><span className="metric-card-mark"><Icon name="activity" size={17} /></span></article>)}</section>
    <section className="dashboard-lower-grid"><article className="welcome-card" data-tour="dashboard-enquiries"><div className="welcome-icon"><Icon name="inbox" size={21} /></div><div><span className="eyebrow">Enquiries</span><h2>Recent enquiries</h2><p>{loading ? 'Loading your enquiry overview…' : `${data?.newEnquiries ?? 0} new enquiries are ready to review.`}</p><Link to="/enquiries" className="dashboard-text-link">Open enquiries <Icon name="arrow" size={15} /></Link></div></article><article className="quick-guide-card" data-tour="dashboard-quick-actions"><div className="card-heading"><div><span className="eyebrow">Quick actions</span><h2>Go to a workspace</h2></div><Icon name="external" size={18} /></div><div className="dashboard-quick-actions"><Link to="/website/home-sections"><Icon name="pages" size={17} /> Edit home content <Icon name="arrow" size={14} /></Link><Link to="/seo"><Icon name="activity" size={17} /> Open SEO Studio <Icon name="arrow" size={14} /></Link></div></article></section>
  </>;
}
