import { useCallback, useEffect, useMemo, useState, type FormEvent } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  SEO_DESCRIPTION_RANGE,
  SEO_ROBOTS_OPTIONS,
  SEO_TITLE_RANGE,
  scoreSeo,
  seoOverrideIsActive,
  seoPageGroups,
  seoScoreLabel,
  type SeoPageGroup,
  type SeoPageOverride,
  type SeoRobots,
} from '@vsmedu/contracts/seo';
import { api } from '../../lib/api';
import { Icon } from '../Icon';
import { Field, ImageDrop, LoadingCard, Notices, SaveBar, SaveButton, WEB_BASE, errorText, useLeaveGuard, type Doc } from './seoShared';

type ListItem = { path: string; label: string; group: SeoPageGroup; hasOverride: boolean; robots: string; updatedAt: string | null };
type Inspection = { status: number; title: string; description: string; canonical: string; robots: string; ogImage: string; h1Count: number; imagesTotal: number; imagesMissingAlt: number; jsonLdCount: number };
type Detail = { page: { path: string; label: string; group: SeoPageGroup }; override: Doc<SeoPageOverride>; original: Inspection | null; liveError: string; siteUrl: string; defaultShareImage: string; siteName: string };

const groupLabel = (id: SeoPageGroup) => seoPageGroups.find((g) => g.id === id)?.label ?? id;
const host = (url: string) => { try { return new URL(url).host.replace(/^www\./, ''); } catch { return url; } };

function counterClass(length: number, [min, max]: readonly [number, number]) {
  if (!length) return 'seo-counter';
  if (length > max + 5) return 'seo-counter is-over';
  if (length < min || length > max) return 'seo-counter is-warn';
  return 'seo-counter is-good';
}

export function SeoPageTab({ canEdit }: { canEdit: boolean }) {
  const [params, setParams] = useSearchParams();
  const path = params.get('path') || '/';
  const [pages, setPages] = useState<ListItem[] | null>(null);
  const [filter, setFilter] = useState('');
  const [open, setOpen] = useState<Record<SeoPageGroup, boolean>>({ main: true, specialisations: true, gallery: false, blogs: false });
  const [detail, setDetail] = useState<Detail | null>(null);
  const [form, setForm] = useState<SeoPageOverride | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const dirty = Boolean(detail && form && JSON.stringify(form) !== JSON.stringify(detail.override.content));
  useLeaveGuard(dirty);

  useEffect(() => {
    api<{ data: ListItem[] }>('/admin/seo/pages').then(({ data }) => setPages(data)).catch((cause) => setError(errorText(cause, 'Could not load the page list')));
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await api<{ data: Detail }>(`/admin/seo/page?path=${encodeURIComponent(path)}`);
      setDetail(data);
      setForm(data.override.content);
      setOpen((current) => ({ ...current, [data.page.group]: true }));
    } catch (cause) {
      setDetail(null);
      setForm(null);
      setError(errorText(cause, 'Could not load this page'));
    } finally {
      setLoading(false);
    }
  }, [path]);

  useEffect(() => { void load(); }, [load]);

  function select(nextPath: string) {
    if (nextPath === path) return;
    if (dirty && !window.confirm('You have unsaved SEO changes on this page. Discard them and open another page?')) return;
    setNotice('');
    setParams({ path: nextPath });
  }

  const set = <K extends keyof SeoPageOverride>(key: K, value: SeoPageOverride[K]) => setForm((current) => (current ? { ...current, [key]: value } : current));

  async function save(event: FormEvent) {
    event.preventDefault();
    if (!detail || !form) return;
    setSaving(true);
    setError('');
    setNotice('');
    try {
      const { data } = await api<{ data: Doc<SeoPageOverride> & { score: number } }>(`/admin/seo/page?path=${encodeURIComponent(detail.page.path)}`, { method: 'PATCH', body: JSON.stringify({ content: form, updatedAt: detail.override.updatedAt }) });
      setDetail({ ...detail, override: { content: data.content, updatedAt: data.updatedAt } });
      setForm(data.content);
      setPages((list) => list?.map((item) => (item.path === detail.page.path ? { ...item, hasOverride: seoOverrideIsActive(data.content), robots: data.content.robots, updatedAt: data.updatedAt } : item)) ?? list);
      setNotice(`SEO for ${detail.page.label} saved. It is live on the website now.`);
    } catch (cause) {
      setError(errorText(cause, 'Could not save page SEO'));
    } finally {
      setSaving(false);
    }
  }

  async function reset() {
    if (!detail) return;
    if (!window.confirm(`Remove every SEO override for ${detail.page.label}? The page goes back to its built-in title, description and tags.`)) return;
    setSaving(true);
    setError('');
    setNotice('');
    try {
      const query = `path=${encodeURIComponent(detail.page.path)}&updatedAt=${encodeURIComponent(detail.override.updatedAt ?? '')}`;
      const { data } = await api<{ data: Doc<SeoPageOverride> }>(`/admin/seo/page?${query}`, { method: 'DELETE' });
      setDetail({ ...detail, override: data });
      setForm(data.content);
      setPages((list) => list?.map((item) => (item.path === detail.page.path ? { ...item, hasOverride: false, robots: 'index, follow', updatedAt: null } : item)) ?? list);
      setNotice(`${detail.page.label} now uses its page defaults.`);
    } catch (cause) {
      setError(errorText(cause, 'Could not reset page SEO'));
    } finally {
      setSaving(false);
    }
  }

  const filtered = useMemo(() => {
    const q = filter.trim().toLowerCase();
    return (pages ?? []).filter((p) => !q || p.label.toLowerCase().includes(q) || p.path.toLowerCase().includes(q));
  }, [pages, filter]);

  return (
    <form className="seo-pane" onSubmit={save}>
      <Notices error={error} notice={notice} onDismiss={() => { setError(''); setNotice(''); }} onReload={() => void load()} />
      <div className="seo-page-layout">
        <aside className="seo-url-sidebar" aria-label="Public URLs">
          <label className="seo-side-label" htmlFor="seo-url-filter">Edit any URL</label>
          <div className="seo-url-search">
            <Icon name="search" size={15} />
            <input id="seo-url-filter" type="search" placeholder="Filter pages, albums & blogs…" value={filter} onChange={(event) => setFilter(event.target.value)} autoComplete="off" />
          </div>
          {!pages ? <p className="seo-muted-note">Loading pages…</p> : null}
          {seoPageGroups.map((group) => {
            const items = filtered.filter((p) => p.group === group.id);
            if (pages && !items.length) return null;
            const expanded = open[group.id] || Boolean(filter.trim());
            return (
              <div className="seo-url-group" key={group.id}>
                <button type="button" className="seo-url-group-head" aria-expanded={expanded} onClick={() => setOpen((o) => ({ ...o, [group.id]: !o[group.id] }))}>
                  <span className="seo-side-label">{group.label}</span>
                  <span className="seo-count-badge">{items.length}</span>
                  <Icon name="chevrons" size={14} className={`seo-group-chevron${expanded ? ' is-open' : ''}`} />
                </button>
                {expanded ? (
                  <ul className="seo-url-list">
                    {items.map((item) => (
                      <li key={item.path}>
                        <button type="button" className={`seo-url-item${item.path === path ? ' is-active' : ''}`} onClick={() => select(item.path)} aria-current={item.path === path ? 'page' : undefined}>
                          <span className="seo-url-text">
                            <span className="seo-url-title">{item.label}</span>
                            <span className="seo-url-slug">{item.path}</span>
                          </span>
                          <span className={`seo-status-dot${item.hasOverride ? ' has-override' : ''}${item.robots.startsWith('noindex') ? ' is-noindex' : ''}`} title={item.robots.startsWith('noindex') ? 'Hidden from search (noindex)' : item.hasOverride ? 'Overrides active' : 'Page defaults'} />
                        </button>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </div>
            );
          })}
        </aside>

        {loading || !detail || !form ? (
          <div className="seo-page-loading">{loading ? <LoadingCard text="Loading page SEO…" /> : null}</div>
        ) : (
          <PageEditor detail={detail} form={form} set={set} canEdit={canEdit} />
        )}
      </div>

      {detail && form ? (
        <SaveBar dirty={dirty}>
          <button type="button" className="seo-btn-ghost" onClick={() => void reset()} disabled={!canEdit || saving || !detail.override.updatedAt}>
            <Icon name="rotateCcw" size={15} /><span>Reset to page defaults</span>
          </button>
          <a className="seo-btn-icon" href={`${WEB_BASE}${detail.page.path}`} target="_blank" rel="noopener noreferrer" title="Open the live page in a new tab" aria-label="Open the live page in a new tab"><Icon name="eye" size={18} /></a>
          <SaveButton saving={saving} disabled={!canEdit || !dirty} label="Save page SEO" />
        </SaveBar>
      ) : null}
    </form>
  );
}

function PageEditor({ detail, form, set, canEdit }: { detail: Detail; form: SeoPageOverride; set: <K extends keyof SeoPageOverride>(key: K, value: SeoPageOverride[K]) => void; canEdit: boolean }) {
  const { page, original, siteUrl } = detail;
  const saved = detail.override.content;
  const hasOverrides = seoOverrideIsActive(saved);
  const originalTitle = original?.title ?? '';
  const originalDescription = original?.description ?? '';
  const title = form.metaTitle || originalTitle;
  const description = form.metaDescription || originalDescription;
  const canonical = form.canonicalUrl || original?.canonical || page.path;
  const shareImage = form.ogImage || original?.ogImage || detail.defaultShareImage;
  const { score, checks } = scoreSeo({ title, description, focusKeyword: form.focusKeyword, canonical, ogImage: shareImage, h1Count: original?.h1Count, imagesTotal: original?.imagesTotal, imagesMissingAlt: original?.imagesMissingAlt });
  const label = seoScoreLabel(score);
  const tone = score >= 80 ? 'good' : score >= 60 ? 'warn' : 'poor';

  let schemaError = '';
  if (form.schemaJson.trim()) {
    try {
      const parsed: unknown = JSON.parse(form.schemaJson);
      if (!parsed || typeof parsed !== 'object') schemaError = 'Structured data must be a JSON object or array.';
    } catch (cause) {
      schemaError = `Not valid JSON yet: ${cause instanceof Error ? cause.message : 'parse error'}`;
    }
  }

  const live = {
    title: saved.metaTitle || originalTitle,
    description: saved.metaDescription || originalDescription,
    canonical: saved.canonicalUrl || original?.canonical || page.path,
    robots: saved.robots !== 'index, follow' ? saved.robots : original?.robots || 'index, follow (default)',
  };
  const disabled = !canEdit;

  return (
    <>
      <section className="seo-card seo-editor-card">
        <div className="seo-editor-head">
          <div>
            <div className="seo-editor-title-row">
              <h2 className="seo-editor-title">{page.label}</h2>
              <span className={`seo-type-pill is-${page.group}`}>{groupLabel(page.group)}</span>
            </div>
            <a className="seo-slug-link" href={`${WEB_BASE}${page.path}`} target="_blank" rel="noopener noreferrer">{page.path} <Icon name="external" size={13} /></a>
          </div>
          <span className={`seo-override-badge${hasOverrides ? ' is-active' : ''}`}>{hasOverrides ? 'Overrides active' : 'Default inherited'}</span>
        </div>

        {detail.liveError ? <div className="seo-alert is-warn"><span>{detail.liveError} Placeholders show empty values until the website is reachable.</span></div> : null}

        <Field label="Focus keyphrase" htmlFor="seo-focus" hint="Used only for the score; it is not shown on the website.">
          <input id="seo-focus" className="seo-input" value={form.focusKeyword} disabled={disabled} maxLength={120} onChange={(e) => set('focusKeyword', e.target.value)} placeholder="e.g. PGDM college in Mumbai" />
        </Field>
        <Field label="SEO title" htmlFor="seo-title" counter={<span className={counterClass(form.metaTitle.length, SEO_TITLE_RANGE)}>{form.metaTitle.length} / {SEO_TITLE_RANGE[1]}</span>} hint="Leave empty to keep the page's current title (shown greyed out).">
          <input id="seo-title" className="seo-input" value={form.metaTitle} disabled={disabled} maxLength={200} onChange={(e) => set('metaTitle', e.target.value)} placeholder={originalTitle} />
        </Field>
        <Field label="Meta description" htmlFor="seo-description" counter={<span className={counterClass(form.metaDescription.length, SEO_DESCRIPTION_RANGE)}>{form.metaDescription.length} / {SEO_DESCRIPTION_RANGE[1]}</span>}>
          <textarea id="seo-description" className="seo-textarea" rows={3} value={form.metaDescription} disabled={disabled} maxLength={500} onChange={(e) => set('metaDescription', e.target.value)} placeholder={originalDescription} />
        </Field>
        <Field label="Canonical URL" htmlFor="seo-canonical" hint="Defaults to the page's own URL if left empty. Use when the same content lives at another address.">
          <input id="seo-canonical" className="seo-input" value={form.canonicalUrl} disabled={disabled} maxLength={2048} onChange={(e) => set('canonicalUrl', e.target.value)} placeholder={original?.canonical || `${siteUrl}${page.path}`} />
        </Field>
        <Field label="Robots" htmlFor="seo-robots" hint="Tells search engines whether to index this page and follow its links. noindex pages are also left out of the sitemaps.">
          <select id="seo-robots" className="seo-input" value={form.robots} disabled={disabled} onChange={(e) => set('robots', e.target.value as SeoRobots)}>
            {SEO_ROBOTS_OPTIONS.map((option) => <option key={option} value={option}>{option}{option === 'index, follow' ? ' (default)' : ''}</option>)}
          </select>
        </Field>
        <Field label="Meta keywords (optional)" htmlFor="seo-keywords" hint="Comma-separated. Most search engines ignore this tag.">
          <input id="seo-keywords" className="seo-input" value={form.metaKeywords} disabled={disabled} maxLength={500} onChange={(e) => set('metaKeywords', e.target.value)} placeholder="PGDM Mumbai, AICTE approved PGDM, management college" />
        </Field>

        <div className="seo-divider" />
        <div className="seo-section-head">
          <h3>Social sharing</h3>
          <p>How the page looks when shared on WhatsApp, Facebook, LinkedIn and X. Empty fields fall back to the SEO title and description.</p>
        </div>
        <Field label="Share title" htmlFor="seo-og-title">
          <input id="seo-og-title" className="seo-input" value={form.ogTitle} disabled={disabled} maxLength={200} onChange={(e) => set('ogTitle', e.target.value)} placeholder={title || 'Uses the SEO title'} />
        </Field>
        <Field label="Share description" htmlFor="seo-og-description">
          <textarea id="seo-og-description" className="seo-textarea" rows={2} value={form.ogDescription} disabled={disabled} maxLength={500} onChange={(e) => set('ogDescription', e.target.value)} placeholder={description || 'Uses the meta description'} />
        </Field>
        <ImageDrop label="Share image (1200 × 630)" hint="1200 × 630 px" value={form.ogImage} disabled={disabled} onChange={(src) => set('ogImage', src)} />
        {!form.ogImage && shareImage ? <p className="seo-hint">Without an upload this page shares <code className="seo-code-pill">{shareImage}</code>{shareImage === detail.defaultShareImage ? ' (global default share image)' : ''}.</p> : null}

        <div className="seo-divider" />
        <div className="seo-section-head">
          <h3>Extra structured data <span className="seo-badge">advanced</span></h3>
          <p>Optional JSON-LD added to this page in addition to any schema it already has.</p>
        </div>
        <div className="seo-field">
          <textarea id="seo-schema" aria-label="Extra structured data (JSON-LD)" className="seo-code-editor" rows={7} spellCheck={false} value={form.schemaJson} disabled={disabled} onChange={(e) => set('schemaJson', e.target.value)} placeholder={'{\n  "@context": "https://schema.org",\n  "@type": "WebPage",\n  "name": "Valia School of Management"\n}'} />
          <div className="seo-code-actions">
            {schemaError ? <span className="seo-field-error">{schemaError}</span> : form.schemaJson.trim() ? <span className="seo-field-ok"><Icon name="check" size={13} /> Valid JSON</span> : <span />}
            <button type="button" className="seo-text-button" disabled={disabled || !form.schemaJson.trim() || Boolean(schemaError)} onClick={() => set('schemaJson', JSON.stringify(JSON.parse(form.schemaJson), null, 2))}>Format JSON</button>
          </div>
        </div>
      </section>

      <aside className="seo-preview-col" aria-label="Search preview and score">
        <section className="seo-card seo-preview-card">
          <h3 className="seo-preview-title">Google preview</h3>
          <div className="seo-serp">
            <div className="seo-serp-site">
              <span className="seo-serp-favicon"><img src={`${WEB_BASE}/icon.png`} alt="" /></span>
              <span>
                <span className="seo-serp-name">{detail.siteName || 'Valia School of Management'}</span>
                <span className="seo-serp-url">{host(siteUrl)}{page.path === '/' ? '' : ` › ${page.path.split('/').filter(Boolean).join(' › ')}`}</span>
              </span>
            </div>
            <div className="seo-serp-title">{title || 'No title'}</div>
            <div className="seo-serp-desc">{description || 'No meta description — search engines will pick text from the page.'}</div>
          </div>
          <div className="seo-gauge">
            <div className={`seo-gauge-ring is-${tone}`} style={{ ['--score' as string]: score }}>
              <span>{score}</span>
            </div>
            <div>
              <div className={`seo-gauge-label is-${tone}`}>{label}</div>
              <div className="seo-hint">Live score, updates as you type</div>
            </div>
          </div>
          <ul className="seo-checklist">
            {checks.map((check) => (
              <li key={check.id} className={`is-${check.status}`}>
                <span className="seo-check-icon" aria-hidden="true">{check.status === 'pass' ? '✓' : check.status === 'warn' ? '!' : '×'}</span>
                <span>{check.text}</span>
              </li>
            ))}
          </ul>
        </section>
        <section className="seo-card seo-preview-card">
          <h3 className="seo-preview-title">Currently live on this page</h3>
          <dl className="seo-live-list">
            <div><dt>Title</dt><dd>{live.title || '—'}</dd></div>
            <div><dt>Description</dt><dd>{live.description || '—'}</dd></div>
            <div><dt>Canonical</dt><dd>{/^https?:\/\//.test(live.canonical) ? live.canonical : `${siteUrl}${live.canonical}`}</dd></div>
            <div><dt>Robots</dt><dd>{live.robots}</dd></div>
            {original ? <div><dt>Page facts</dt><dd>{original.h1Count} × H1 · {original.imagesTotal} images ({original.imagesMissingAlt} without alt) · {original.jsonLdCount} JSON-LD block(s) · HTTP {original.status}</dd></div> : null}
          </dl>
          {JSON.stringify(form) !== JSON.stringify(saved) ? <p className="seo-hint">Unsaved edits are not live until you save.</p> : null}
        </section>
      </aside>
    </>
  );
}