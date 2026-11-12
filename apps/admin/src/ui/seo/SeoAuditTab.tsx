import { Fragment, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { SEO_DESCRIPTION_RANGE, SEO_TITLE_RANGE, seoPageGroups, type SeoCheck, type SeoPageGroup } from '@vsmedu/contracts/seo';
import { api } from '../../lib/api';
import { Icon } from '../Icon';
import { SeoIcon, WEB_BASE, errorText } from './seoShared';

type Row = {
  path: string;
  label: string;
  group: SeoPageGroup;
  status: number;
  title: string;
  description: string;
  canonical: string;
  robots: string;
  ogImage: string;
  h1Count: number;
  imagesTotal: number;
  imagesMissingAlt: number;
  jsonLdCount: number;
  score: number;
  checks: SeoCheck[];
  hasOverride: boolean;
  error: string;
};
type Audit = { checkedAt: string; durationMs: number; total: number; rows: Row[] };
type Filter = 'all' | 'issues' | SeoPageGroup;
type PageItem = { path: string; label: string; group: SeoPageGroup };

const CACHE_KEY = 'vsm-seo-audit-v1';
/** Small batches keep each request short and let results appear while the rest are still being checked. */
const BATCH_SIZE = 3;
const PARALLEL_BATCHES = 2;

function readCache(): Audit | null {
  try {
    const cached = JSON.parse(localStorage.getItem(CACHE_KEY) ?? 'null') as Audit | null;
    return cached && Array.isArray(cached.rows) ? cached : null;
  } catch {
    return null;
  }
}

function failedRow(page: PageItem, message: string): Row {
  return { ...page, status: 0, title: '', description: '', canonical: '', robots: '', ogImage: '', h1Count: 0, imagesTotal: 0, imagesMissingAlt: 0, jsonLdCount: 0, score: 0, checks: [{ id: 'status', status: 'fail', text: 'The page could not be checked.' }], hasOverride: false, error: message };
}

const lengthTone = (length: number, [min, max]: readonly [number, number]) => (!length ? 'red' : length >= min && length <= max ? 'green' : length > max + 5 ? 'red' : 'amber');
const scoreTone = (score: number) => (score >= 80 ? 'good' : score >= 60 ? 'warn' : 'poor');
const csvCell = (value: string | number) => `"${String(value).replace(/"/g, '""')}"`;

export function SeoAuditTab() {
  const [audit, setAudit] = useState<Audit | null>(() => readCache());
  const [running, setRunning] = useState(false);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState<Filter>('all');
  const [sort, setSort] = useState<'score' | 'page'>('score');
  const [expanded, setExpanded] = useState<string | null>(null);
  const runId = useRef(0);

  const run = useCallback(async () => {
    const id = ++runId.current;
    const live = () => runId.current === id;
    setRunning(true);
    setError('');
    setExpanded(null);
    const startedAt = Date.now();
    try {
      const { data: pages } = await api<{ data: PageItem[] }>('/admin/seo/pages');
      if (!live()) return;
      const rows: Row[] = [];
      setAudit({ checkedAt: new Date().toISOString(), durationMs: 0, total: pages.length, rows: [] });
      const batches: PageItem[][] = [];
      for (let i = 0; i < pages.length; i += BATCH_SIZE) batches.push(pages.slice(i, i + BATCH_SIZE));
      let next = 0;
      const worker = async () => {
        while (live() && next < batches.length) {
          const batch = batches[next++]!;
          try {
            const { data } = await api<{ data: { rows: Row[] } }>(`/admin/seo/audit?paths=${encodeURIComponent(batch.map((p) => p.path).join(','))}`);
            rows.push(...data.rows);
          } catch (cause) {
            rows.push(...batch.map((page) => failedRow(page, errorText(cause, 'Request failed'))));
          }
          if (live()) setAudit({ checkedAt: new Date().toISOString(), durationMs: Date.now() - startedAt, total: pages.length, rows: [...rows] });
        }
      };
      await Promise.all(Array.from({ length: PARALLEL_BATCHES }, worker));
      if (!live()) return;
      const finished: Audit = { checkedAt: new Date().toISOString(), durationMs: Date.now() - startedAt, total: pages.length, rows };
      setAudit(finished);
      try { localStorage.setItem(CACHE_KEY, JSON.stringify(finished)); } catch { /* storage full or disabled */ }
    } catch (cause) {
      if (live()) setError(errorText(cause, 'The audit could not run'));
    } finally {
      if (live()) setRunning(false);
    }
  }, []);

  useEffect(() => {
    if (!readCache()) void run();
    return () => { runId.current++; };
  }, [run]);

  const summary = useMemo(() => {
    const reachable = (audit?.rows ?? []).filter((row) => row.status === 200);
    return {
      checked: audit?.rows.length ?? 0,
      reachable: reachable.length,
      averageScore: reachable.length ? Math.round(reachable.reduce((sum, row) => sum + row.score, 0) / reachable.length) : 0,
    };
  }, [audit]);
  const progress = audit && audit.total ? Math.round((summary.checked / audit.total) * 100) : 0;

  const rows = useMemo(() => {
    const list = (audit?.rows ?? []).filter((row) => filter === 'all' || (filter === 'issues' ? row.checks.some((c) => c.status === 'fail') : row.group === filter));
    return [...list].sort((a, b) => (sort === 'score' ? a.score - b.score : a.label.localeCompare(b.label)));
  }, [audit, filter, sort]);

  function exportCsv() {
    if (!audit) return;
    const header = ['Page', 'URL', 'Group', 'Score', 'HTTP status', 'Title', 'Title length', 'Description', 'Description length', 'H1 count', 'Canonical', 'Share image', 'Images', 'Images without alt', 'Issues'];
    const lines = audit.rows.map((r) => [r.label, r.path, r.group, r.score, r.status, r.title, r.title.length, r.description, r.description.length, r.h1Count, r.canonical, r.ogImage, r.imagesTotal, r.imagesMissingAlt, r.checks.filter((c) => c.status !== 'pass').map((c) => c.text).join(' | ')].map(csvCell).join(','));
    const blob = new Blob([[header.map(csvCell).join(','), ...lines].join('\r\n')], { type: 'text/csv;charset=utf-8' });
    const link = Object.assign(document.createElement('a'), { href: URL.createObjectURL(blob), download: `seo-audit-${audit.checkedAt.slice(0, 10)}.csv` });
    link.click();
    URL.revokeObjectURL(link.href);
  }

  const counts = (id: Filter) => (audit?.rows ?? []).filter((row) => id === 'all' || (id === 'issues' ? row.checks.some((c) => c.status === 'fail') : row.group === id)).length;

  return (
    <div className="seo-pane">
      <section className="seo-card seo-audit-card">
        <div className="seo-audit-head">
          <div>
            <h2 className="seo-card-title">SEO audit</h2>
            <p className="seo-card-desc">
              {running && audit ? (
                <>Checking pages… <strong>{summary.checked} / {audit.total}</strong> done · results appear below as each page is checked.</>
              ) : audit ? (
                <>{summary.reachable} / {audit.total} public URLs reachable · average score <strong>{summary.averageScore}</strong> · last run {new Date(audit.checkedAt).toLocaleString()} ({Math.round(audit.durationMs / 1000)} s)</>
              ) : running ? 'Loading the list of public pages…' : 'Run the audit to check every public URL.'}
            </p>
          </div>
          <div className="seo-audit-tools">
            <select className="seo-input seo-sort" value={sort} onChange={(e) => setSort(e.target.value as 'score' | 'page')} aria-label="Sort audit results">
              <option value="score">Lowest score first</option>
              <option value="page">Page name A–Z</option>
            </select>
            <button type="button" className="seo-btn-icon" onClick={exportCsv} disabled={!audit?.rows.length || running} title="Download results as CSV" aria-label="Download results as CSV"><Icon name="download" size={16} /></button>
            <button type="button" className="seo-btn-primary seo-audit-run" onClick={() => void run()} disabled={running}>
              {running ? <span className="button-spinner" /> : SeoIcon.refresh(16)}
              <span>{running ? 'Auditing…' : audit ? 'Run again' : 'Run audit'}</span>
            </button>
          </div>
        </div>

        {running && audit ? (
          <div className="seo-audit-progress" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={progress} aria-label="Audit progress">
            <span style={{ width: `${progress}%` }} />
          </div>
        ) : null}

        <div className="seo-audit-filters">
          <div className="seo-filter-pills" role="group" aria-label="Filter audit results">
            {(['all', 'issues', ...seoPageGroups.map((g) => g.id)] as Filter[]).map((id) => (
              <button key={id} type="button" className={`seo-pill-button${filter === id ? ' is-active' : ''}`} onClick={() => setFilter(id)} aria-pressed={filter === id}>
                {id === 'all' ? 'All' : id === 'issues' ? 'With errors' : seoPageGroups.find((g) => g.id === id)!.label} ({counts(id)})
              </button>
            ))}
          </div>
        </div>

        {error ? <div className="seo-alert is-error" role="alert"><span>{error}</span></div> : null}
        {running && !audit?.rows.length ? <div className="seo-audit-running"><span className="button-spinner" /> Checking the first pages… results will appear here in a few seconds.</div> : null}

        {audit?.rows.length ? (
          <div className="seo-table-wrap">
            <table className="seo-audit-table">
              <thead>
                <tr>
                  <th>Page</th>
                  <th className="is-center">Score</th>
                  <th className="is-center">Status</th>
                  <th>Title</th>
                  <th>Description</th>
                  <th>Headings</th>
                  <th>Canonical / share</th>
                  <th>Images</th>
                  <th aria-label="Actions" />
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => {
                  const issues = row.checks.filter((c) => c.status !== 'pass');
                  const isOpen = expanded === row.path;
                  return (
                    <Fragment key={row.path}>
                      <tr className={isOpen ? 'is-open' : undefined}>
                        <td>
                          <div className="seo-audit-page">
                            <span className="seo-audit-label">{row.label}</span>
                            {row.hasOverride ? <span className="seo-type-pill is-override">SEO override</span> : null}
                          </div>
                          <a className="seo-audit-slug" href={`${WEB_BASE}${row.path}`} target="_blank" rel="noopener noreferrer">{row.path}</a>
                        </td>
                        <td className="is-center"><span className={`seo-score-ring is-${scoreTone(row.score)}`}>{row.score}</span></td>
                        <td className="is-center"><span className={`seo-pill ${row.status === 200 ? 'green' : 'red'}`}>{row.status || 'Error'}</span></td>
                        <td>
                          <span className={`seo-pill ${lengthTone(row.title.length, SEO_TITLE_RANGE)}`}>{row.title ? `${row.title.length} chars` : 'Missing'}</span>
                          <div className="seo-snippet" title={row.title}>{row.title}</div>
                        </td>
                        <td>
                          <span className={`seo-pill ${lengthTone(row.description.length, SEO_DESCRIPTION_RANGE)}`}>{row.description ? `${row.description.length} chars` : 'Missing'}</span>
                          <div className="seo-snippet" title={row.description}>{row.description}</div>
                        </td>
                        <td><span className={`seo-pill ${row.h1Count === 1 ? 'green' : row.h1Count === 0 ? 'red' : 'amber'}`}>{row.h1Count} × H1</span></td>
                        <td>
                          <div className="seo-pill-stack">
                            <span className={`seo-pill ${row.canonical ? 'green' : 'amber'}`}>{row.canonical ? 'Canonical' : 'No canonical'}</span>
                            <span className={`seo-pill ${row.ogImage ? 'green' : 'amber'}`}>{row.ogImage ? 'OG image' : 'No OG image'}</span>
                            {/noindex/i.test(row.robots) ? <span className="seo-pill red">noindex</span> : null}
                          </div>
                        </td>
                        <td><span className={`seo-pill ${row.imagesMissingAlt ? 'amber' : 'green'}`}>{row.imagesMissingAlt ? `${row.imagesMissingAlt} / ${row.imagesTotal} no alt` : row.imagesTotal ? 'All with alt' : 'No images'}</span></td>
                        <td className="seo-audit-actions">
                          <button type="button" className="seo-btn-icon is-small" onClick={() => setExpanded(isOpen ? null : row.path)} aria-expanded={isOpen} title={`${issues.length} issue(s) — show checks`} aria-label={`Show checks for ${row.label}`}>
                            <span className="seo-issue-count">{issues.length}</span>
                          </button>
                          <Link className="seo-btn-icon is-small" to={`/seo/page-seo?path=${encodeURIComponent(row.path)}`} title={`Edit ${row.label} in Page SEO`} aria-label={`Edit ${row.label} in Page SEO`}><Icon name="edit" size={15} /></Link>
                        </td>
                      </tr>
                      {isOpen ? (
                        <tr className="seo-audit-detail">
                          <td colSpan={9}>
                            <ul className="seo-checklist is-inline">
                              {row.checks.map((check) => (
                                <li key={check.id} className={`is-${check.status}`}>
                                  <span className="seo-check-icon" aria-hidden="true">{check.status === 'pass' ? '✓' : check.status === 'warn' ? '!' : '×'}</span>
                                  <span>{check.text}</span>
                                </li>
                              ))}
                            </ul>
                            {row.error ? <p className="seo-field-error">{row.error}</p> : null}
                          </td>
                        </tr>
                      ) : null}
                    </Fragment>
                  );
                })}
              </tbody>
            </table>
            {!rows.length ? <p className="seo-muted-note seo-empty">No pages match this filter.</p> : null}
          </div>
        ) : null}
      </section>
    </div>
  );
}
