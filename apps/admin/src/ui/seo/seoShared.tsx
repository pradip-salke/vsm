import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { api } from '../../lib/api';
import { Icon } from '../Icon';

export const WEB_BASE = (import.meta.env.VITE_WEB_BASE_URL ?? 'http://localhost:3000').replace(/\/+$/, '');

export type Doc<T> = { content: T; updatedAt: string | null };

const svg = (children: ReactNode, size = 18) => (
  <svg aria-hidden="true" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" focusable="false">{children}</svg>
);

/** Icons used only by SEO Studio (the shared Icon set has no globe, code or sitemap glyphs). */
export const SeoIcon = {
  overview: (size?: number) => svg(<><circle cx="12" cy="12" r="10" /><path d="M16 12l-4-4-4 4" /><path d="M12 16V8" /></>, size),
  page: (size?: number) => svg(<><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /></>, size),
  globe: (size?: number) => svg(<><circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" /><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" /></>, size),
  code: (size?: number) => svg(<><polyline points="16 18 22 12 16 6" /><line x1="14" y1="4" x2="10" y2="20" /><polyline points="8 6 2 12 8 18" /></>, size),
  sitemap: (size?: number) => svg(<><rect x="9" y="3" width="6" height="4" rx="1" /><rect x="3" y="17" width="6" height="4" rx="1" /><rect x="15" y="17" width="6" height="4" rx="1" /><path d="M12 7v5" /><path d="M6 17v-2a3 3 0 0 1 3-3h6a3 3 0 0 1 3 3v2" /></>, size),
  audit: (size?: number) => svg(<><path d="M22 12h-4l-3 9L9 3l-3 9H2" /></>, size),
  shield: (size?: number) => svg(<><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /><polyline points="9 12 11 14 15 10" /></>, size),
  bars: (size?: number) => svg(<><line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" /></>, size),
  upload: (size?: number) => svg(<><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" /></>, size),
  refresh: (size?: number) => svg(<path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2" />, size),
};

export function errorText(cause: unknown, fallback: string) {
  return cause instanceof Error ? cause.message : fallback;
}

/** Loads one `{ content, updatedAt }` settings document and saves it back with optimistic concurrency. */
export function useSeoDoc<T>(url: string) {
  const [doc, setDoc] = useState<Doc<T> | null>(null);
  const [form, setForm] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await api<{ data: Doc<T> }>(url);
      setDoc(data);
      setForm(data.content);
    } catch (cause) {
      setError(errorText(cause, 'Could not load the saved settings'));
    } finally {
      setLoading(false);
    }
  }, [url]);

  useEffect(() => { void load(); }, [load]);

  async function save(successMessage: string) {
    if (!doc || form === null) return;
    setSaving(true);
    setError('');
    setNotice('');
    try {
      const { data } = await api<{ data: Doc<T> }>(url, { method: 'PATCH', body: JSON.stringify({ content: form, updatedAt: doc.updatedAt }) });
      setDoc(data);
      setForm(data.content);
      setNotice(successMessage);
    } catch (cause) {
      setError(errorText(cause, 'Could not save the settings'));
    } finally {
      setSaving(false);
    }
  }

  const dirty = doc !== null && form !== null && JSON.stringify(doc.content) !== JSON.stringify(form);
  return { doc, form, setForm, loading, saving, error, notice, setNotice, setError, load, save, dirty };
}

export async function uploadSeoImage(file: File) {
  if (!/^image\/(png|jpeg|webp|avif|gif)$/.test(file.type)) throw new Error('Upload a JPG, PNG, WebP, AVIF or GIF image');
  if (file.size > 2 * 1024 * 1024) throw new Error('Image must be less than 2 MB');
  const body = file.type === 'image/gif' ? new File([file], file.name.replace(/\.gif$/i, '.png'), { type: 'image/png' }) : file;
  return (await api<{ data: { src: string; width: number; height: number } }>('/admin/home-media', { method: 'POST', body, headers: { 'Content-Type': body.type, 'X-File-Name': encodeURIComponent(file.name) } })).data;
}

export const previewSrc = (src: string) => (/^https?:\/\//.test(src) ? src : `${WEB_BASE}${src.startsWith('/') ? src : `/${src}`}`);

export function ImageDrop({ value, onChange, label, hint, disabled, compact }: { value: string; onChange: (src: string) => void; label: string; hint?: string; disabled?: boolean; compact?: boolean }) {
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [over, setOver] = useState(false);

  async function take(file: File | undefined) {
    if (!file || disabled) return;
    setBusy(true);
    setError('');
    try {
      onChange((await uploadSeoImage(file)).src);
    } catch (cause) {
      setError(errorText(cause, 'Upload failed'));
    } finally {
      setBusy(false);
      if (input.current) input.current.value = '';
    }
  }

  return (
    <div className="seo-field">
      <span className="seo-label">{label}</span>
      <div
        className={`seo-dropzone${over ? ' is-over' : ''}${disabled ? ' is-disabled' : ''}`}
        role="button"
        tabIndex={disabled ? -1 : 0}
        aria-label={`${label}: drag and drop or browse to upload`}
        onClick={() => !disabled && input.current?.click()}
        onKeyDown={(event) => { if ((event.key === 'Enter' || event.key === ' ') && !disabled) { event.preventDefault(); input.current?.click(); } }}
        onDragOver={(event) => { event.preventDefault(); setOver(true); }}
        onDragLeave={() => setOver(false)}
        onDrop={(event) => { event.preventDefault(); setOver(false); void take(event.dataTransfer.files[0]); }}
      >
        <input ref={input} type="file" accept="image/png,image/jpeg,image/webp,image/avif,image/gif" hidden onChange={(event) => void take(event.target.files?.[0])} />
        {value ? (
          <div className={`seo-drop-preview${compact ? ' is-compact' : ''}`}>
            <img src={previewSrc(value)} alt="" />
          </div>
        ) : null}
        <div className="seo-drop-copy">
          <span className="seo-drop-icon">{busy ? <span className="button-spinner" /> : SeoIcon.upload(20)}</span>
          <span className="seo-drop-text">{busy ? 'Uploading…' : <>Drag &amp; drop your image here or <span className="seo-link-text">browse</span></>}</span>
          <span className="seo-drop-sub">JPG, PNG, GIF or WebP up to 2 MB – converted to WebP on upload</span>
          {hint ? <span className="seo-drop-badges"><span className="seo-badge">Auto WebP</span><span className="seo-badge is-dim">{hint}</span></span> : null}
        </div>
      </div>
      {value && !disabled ? (
        <div className="seo-drop-actions">
          <code className="seo-code-pill">{value}</code>
          <button type="button" className="seo-text-button" onClick={() => onChange('')}>Remove</button>
        </div>
      ) : null}
      {error ? <span className="seo-field-error" role="alert">{error}</span> : null}
    </div>
  );
}

export function Toggle({ checked, onChange, label, id, disabled }: { checked: boolean; onChange: (value: boolean) => void; label: string; id: string; disabled?: boolean }) {
  return (
    <div className="seo-toggle-row">
      <label className="seo-switch">
        <input id={id} type="checkbox" checked={checked} disabled={disabled} onChange={(event) => onChange(event.target.checked)} />
        <span className="seo-switch-slider" />
      </label>
      <label htmlFor={id} className="seo-toggle-label">{label}</label>
    </div>
  );
}

export function Field({ label, htmlFor, hint, counter, children }: { label: string; htmlFor: string; hint?: ReactNode; counter?: ReactNode; children: ReactNode }) {
  return (
    <div className="seo-field">
      <div className="seo-label-row">
        <label className="seo-label" htmlFor={htmlFor}>{label}</label>
        {counter}
      </div>
      {children}
      {hint ? <div className="seo-hint">{hint}</div> : null}
    </div>
  );
}

export function Notices({ error, notice, onDismiss, onReload }: { error: string; notice: string; onDismiss: () => void; onReload?: () => void }) {
  if (!error && !notice) return null;
  return error ? (
    <div className="seo-alert is-error" role="alert">
      <span>{error}</span>
      <span className="seo-alert-actions">
        {onReload && /updated elsewhere|reload/i.test(error) ? <button type="button" onClick={onReload}>Reload</button> : null}
        <button type="button" aria-label="Dismiss" onClick={onDismiss}><Icon name="x" size={14} /></button>
      </span>
    </div>
  ) : (
    <div className="seo-alert is-success" role="status">
      <span><Icon name="check" size={15} /> {notice}</span>
      <button type="button" aria-label="Dismiss" onClick={onDismiss}><Icon name="x" size={14} /></button>
    </div>
  );
}

export function SaveBar({ children, dirty }: { children: ReactNode; dirty?: boolean }) {
  return (
    <div className="seo-sticky-bar">
      <div className="seo-sticky-inner">
        {dirty !== undefined ? <span className={`seo-dirty-state${dirty ? ' is-dirty' : ''}`}>{dirty ? 'Unsaved changes' : 'All changes saved'}</span> : <span />}
        <div className="seo-sticky-actions">{children}</div>
      </div>
    </div>
  );
}

export function SaveButton({ saving, disabled, label }: { saving: boolean; disabled?: boolean; label: string }) {
  return (
    <button type="submit" className="seo-btn-primary" disabled={saving || disabled}>
      {saving ? <span className="button-spinner" /> : <Icon name="check" size={16} />}
      <span>{saving ? 'Saving…' : label}</span>
    </button>
  );
}

export function LoadingCard({ text }: { text: string }) {
  return <div className="cms-loading-card"><span className="button-spinner" /><p>{text}</p></div>;
}

/** Warn before closing the tab with unsaved edits. */
export function useLeaveGuard(dirty: boolean) {
  useEffect(() => {
    if (!dirty) return;
    const handler = (event: BeforeUnloadEvent) => { event.preventDefault(); };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [dirty]);
}
