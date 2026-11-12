import { useEffect, useState, type FormEvent } from 'react';
import type { FooterContent } from '@vsmedu/contracts/footer';
import { api } from '../lib/api';
import { ImageDrop, Notices, SaveBar, SaveButton } from './seo/seoShared';
import './seo/seo-studio.css';

type FooterDocument = { content: FooterContent; updatedAt: string | null };

export function GlobalSettingsEditor({ canEdit }: { canEdit: boolean }) {
  const [document, setDocument] = useState<FooterDocument | null>(null);
  const [form, setForm] = useState<FooterContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  async function load() {
    setLoading(true);
    setError('');
    try {
      const response = await api<{ data: FooterDocument }>('/admin/settings/footer');
      setDocument(response.data);
      setForm(response.data.content);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Could not load website logo settings.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { void load(); }, []);

  const dirty = Boolean(document && form && document.content.about.logoUrl !== form.about.logoUrl);

  function setLogo(logoUrl: string) {
    setForm((current) => current ? { ...current, about: { ...current.about, logoUrl } } : current);
  }

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!document || !form || !dirty) return;
    setSaving(true);
    setError('');
    setNotice('');
    try {
      const response = await api<{ data: FooterDocument }>('/admin/settings/footer', {
        method: 'PATCH',
        body: JSON.stringify({ content: form, updatedAt: document.updatedAt }),
      });
      setDocument(response.data);
      setForm(response.data.content);
      setNotice('Website logo saved and published.');
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Could not save the website logo.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="cms-editor cms-global-settings-editor">
      <header className="page-heading">
        <div>
          <nav className="cms-breadcrumbs" aria-label="Breadcrumb">
            <span>Settings</span>
            <span className="cms-breadcrumb-sep">/</span>
            <span className="cms-breadcrumb-current">Global Settings</span>
          </nav>
          <h1>Global Settings</h1>
          <p className="page-description">Manage website-wide branding. The site logo is used in the desktop header, mobile menu, and footer.</p>
        </div>
      </header>

      {loading ? (
        <div className="cms-loading-card"><span className="button-spinner" /><p>Loading website logo settings…</p></div>
      ) : (
        <form className="seo-pane" onSubmit={(event) => void save(event)}>
          <Notices error={error} notice={notice} onDismiss={() => { setError(''); setNotice(''); }} onReload={() => void load()} />
          {form && (
            <section className="seo-card">
              <h2 className="seo-card-title">Website logos</h2>
              <p className="seo-card-desc">Choose the logo used across the public website. Saving updates the desktop header, mobile menu, and footer together.</p>
              <ImageDrop label="Website logo" hint="Transparent PNG or WebP recommended" value={form.about.logoUrl} disabled={!canEdit || saving} onChange={setLogo} />
            </section>
          )}
          <SaveBar dirty={dirty}>
            <SaveButton saving={saving} disabled={!canEdit || !dirty} label="Save website logo" />
          </SaveBar>
        </form>
      )}
    </div>
  );
}
