import { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { homeDefaults, homeMasterDefaults, homeLabels, type HomeMasterKey } from '@vsmedu/contracts/home';
import { api } from '../lib/api';
import './home-editor.css';
import { Field, preview, type Value } from './ContentFields';
import { SliderMaster, type SupportedMasterKey } from './SliderMaster';
import { Icon } from './Icon';
import { FaqSectionEditor, type FaqContent } from './FaqSectionEditor';

type Document = { content: Value; updatedAt: string | null };

// Frontend sequence of sections matching the live website
const HOME_SECTIONS_SEQUENCE = [
  'stats',
  'about',
  'marquee',
  'program',
  'faculty',
  'why',
  'specialisations',
  'faq',
  'cta',
] as const;

type HomeSectionKey = (typeof HOME_SECTIONS_SEQUENCE)[number];

// Reliable titles matching the main website section names
const sectionTitles: Record<HomeSectionKey, string> = {
  stats: 'Programme at a Glance',
  about: 'About Us',
  marquee: 'Discover / Learn Marquee',
  program: 'Our PGDM Program',
  faculty: 'Meet Our Industry-Oriented PGDM Faculty',
  why: 'Why Choose VSM Among PGDM Colleges in Mumbai?',
  specialisations: 'Explore Industry-Relevant PGDM Specialisations',
  faq: 'FAQ About PGDM Admissions',
  cta: 'Apply Now Banner',
};

const sectionSubtitles: Record<HomeSectionKey, string> = {
  stats: 'Key metrics, course fees, corporate network, and placement support statistics.',
  about: 'Introductory overview paragraph, mission statement, and explore button.',
  marquee: 'Animated ticker text displayed twice across the homepage.',
  program: 'Video poster image, AICTE accreditation details, and program highlights.',
  faculty: 'Faculty section title, subtitle, and intro narrative. Slide items managed in Faculty Slider Master.',
  why: 'Why Choose VSM features, icons, immersion overview, and campus highlights.',
  specialisations: 'Specialisation cards with icons, descriptions, and curriculum links.',
  faq: 'Frequently asked questions regarding PGDM admissions, fees, and eligibility.',
  cta: 'Bottom full-width call-to-action banner with background image and apply button.',
};

const sectionPills: Record<HomeSectionKey, string> = {
  stats: 'Home Page Section: #glance',
  about: 'Home Page Section: #about-us',
  marquee: 'Home Page Section: #marquee',
  program: 'Home Page Section: #pgdm-program',
  faculty: 'Home Page Section: #faculty',
  why: 'Home Page Section: #why-vsm',
  specialisations: 'Home Page Section: #specialisations',
  faq: 'Home Page Section: #faq',
  cta: 'Home Page Section: #apply-now',
};

type MarqueeItem = { text: string; highlight: boolean };

function MarqueeEditor({
  value,
  onChange,
  canEdit,
  busy,
}: {
  value: { items?: MarqueeItem[] };
  onChange: (value: { items: MarqueeItem[] }) => void;
  canEdit: boolean;
  busy: boolean;
}) {
  const items = value?.items ?? [];

  function updateItem(index: number, field: 'text' | 'highlight', val: string | boolean) {
    const next = items.map((item, i) => (i === index ? { ...item, [field]: val } : item));
    onChange({ items: next });
  }

  function removeItem(index: number) {
    onChange({ items: items.filter((_, i) => i !== index) });
  }

  function addItem() {
    onChange({ items: [...items, { text: '', highlight: false }] });
  }

  return (
    <div className="cms-marquee-editor">
      <div className="cms-marquee-rows">
        {items.map((item, index) => (
          <div className="cms-marquee-row" key={index}>
            <input
              type="text"
              className="cms-marquee-input"
              placeholder="e.g. Discover, Learn, Innovate, Lead…"
              value={item.text ?? ''}
              disabled={!canEdit || busy}
              onChange={(e) => updateItem(index, 'text', e.target.value)}
            />
            <label className="cms-marquee-highlight">
              <input
                type="checkbox"
                checked={Boolean(item.highlight)}
                disabled={!canEdit || busy}
                onChange={(e) => updateItem(index, 'highlight', e.target.checked)}
              />
              <span>Highlight in Cyan</span>
            </label>
            <button
              type="button"
              className="cms-btn-delete"
              disabled={!canEdit || busy || items.length <= 1}
              onClick={() => removeItem(index)}
              title="Delete item"
              aria-label="Delete item"
            >
              <Icon name="trash" size={15} />
            </button>
          </div>
        ))}
      </div>
      <div className="cms-marquee-actions">
        <button
          type="button"
          className="cms-secondary cms-btn-add-item"
          disabled={!canEdit || busy || items.length >= 50}
          onClick={addItem}
        >
          ＋ Add Item
        </button>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Compact repeatable-item editors (Marquee pattern)                 */
/* ------------------------------------------------------------------ */

/* Compact image upload widget: preview + replace file input, no URL text */
type ImageUploadFieldProps = {
  value?: string;
  onChange: (src: string) => void;
  readOnly: boolean;
  upload: (file: File) => Promise<{ src: string; alt: string; width: number; height: number }>;
  placeholder?: string;
};

function ImageUploadField({ value, onChange, readOnly, upload, placeholder }: ImageUploadFieldProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState('');

  async function replace(file: File) {
    setError('');
    try {
      const img = await upload(file);
      onChange(img.src);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Upload failed');
    }
  }

  return (
    <div className="cms-compact-image">
      {value ? (
        <div className="cms-compact-image-wrap">
          <img className="cms-compact-image-thumb" src={preview(String(value))} alt="Preview" />
          <button
            type="button"
            className="cms-compact-image-replace"
            disabled={readOnly}
            onClick={() => fileInputRef.current?.click()}
            title="Replace image"
          >
            Replace
          </button>
          <input
            ref={fileInputRef}
            type="file"
            className="cms-visually-hidden"
            accept="image/png,image/jpeg,image/webp,image/avif,image/svg+xml"
            disabled={readOnly}
            onChange={(e) => { if (e.target.files?.[0]) void replace(e.target.files[0]); }}
          />
        </div>
      ) : (
        <div className="cms-compact-image-empty">
          <button
            type="button"
            className="cms-compact-image-choose"
            disabled={readOnly}
            onClick={() => fileInputRef.current?.click()}
            title="Choose image"
          >
            {placeholder || 'Upload image'}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            className="cms-visually-hidden"
            accept="image/png,image/jpeg,image/webp,image/avif,image/svg+xml"
            disabled={readOnly}
            onChange={(e) => { if (e.target.files?.[0]) void replace(e.target.files[0]); }}
          />
        </div>
      )}
      {error && <small className="cms-compact-image-error" role="alert">{error}</small>}
    </div>
  );
}

/* Stats: value, label, description */
type StatItem = { value?: string; label?: string; description?: string };

function StatsItemsEditor({
  items,
  readOnly,
  onItemsChange,
}: {
  items: StatItem[];
  readOnly: boolean;
  onItemsChange: (next: StatItem[]) => void;
}) {
  const setItem = (index: number, field: keyof StatItem, val: string) => {
    const next = [...items];
    next[index] = { ...next[index], [field]: val };
    onItemsChange(next);
  };
  const removeItem = (index: number) => onItemsChange(items.filter((_, i) => i !== index));
  const addItem = () => onItemsChange([...items, { value: '', label: '', description: '' }]);

  return (
    <div className="cms-compact-editor cms-compact-stats">
      <div className="cms-compact-headings">
        <span className="cms-compact-heading">Value</span>
        <span className="cms-compact-heading">Label</span>
        <span className="cms-compact-heading">Description</span>
        <span className="cms-compact-heading">Action</span>
      </div>
      <div className="cms-compact-items">
        {items.map((item, index) => (
          <div key={index} className="cms-compact-item-row">
            <input
              className="cms-compact-input"
              value={String(item.value ?? '')}
              onChange={(e) => setItem(index, 'value', e.target.value)}
              disabled={readOnly}
              placeholder="e.g. 6.5 L"
            />
            <input
              className="cms-compact-input"
              value={String(item.label ?? '')}
              onChange={(e) => setItem(index, 'label', e.target.value)}
              disabled={readOnly}
              placeholder="e.g. Full Course Fees"
            />
            <input
              className="cms-compact-input"
              value={String(item.description ?? '')}
              onChange={(e) => setItem(index, 'description', e.target.value)}
              disabled={readOnly}
              placeholder="e.g. Invest Smart..."
            />
            <button
              type="button"
              className="cms-compact-delete"
              disabled={readOnly}
              aria-label={`Delete item ${index + 1}`}
              title="Delete item"
              onClick={() => removeItem(index)}
            >
              <Icon name="trash" size={16} />
            </button>
          </div>
        ))}
      </div>
      <button
        type="button"
        className="cms-compact-add"
        disabled={readOnly || items.length >= 100}
        onClick={addItem}
      >
        ＋ Add Item
      </button>
    </div>
  );
}

/* Specialisations: title, description, icon, href - update only, no add/remove */
type SpecialisationItem = { title?: string; description?: string; icon?: string; href?: string };

function SpecialisationsItemsEditor({
  items,
  readOnly,
  onItemsChange,
  upload,
}: {
  items: SpecialisationItem[];
  readOnly: boolean;
  onItemsChange: (next: SpecialisationItem[]) => void;
  upload: (file: File) => Promise<{ src: string; alt: string; width: number; height: number }>;
}) {
  const setItem = (index: number, field: keyof SpecialisationItem, val: string) => {
    const next = [...items];
    next[index] = { ...next[index], [field]: val };
    onItemsChange(next);
  };

  return (
    <div className="cms-compact-editor cms-compact-specialisations cms-compact-update-only">
      <div className="cms-compact-items">
        {items.map((item, index) => (
          <div key={index} className="cms-compact-item-row cms-compact-item-row-specialisation">
            <div className="cms-compact-field-fullwidth">
              <label className="cms-compact-field-label">Specialisation Title</label>
              <input
                className="cms-compact-input cms-compact-input-fullwidth"
                value={String(item.title ?? '')}
                onChange={(e) => setItem(index, 'title', e.target.value)}
                disabled={readOnly}
                placeholder="e.g. Financial Management"
              />
            </div>
            <div className="cms-compact-field-fullwidth">
              <label className="cms-compact-field-label">Description</label>
              <input
                className="cms-compact-input cms-compact-input-fullwidth"
                value={String(item.description ?? '')}
                onChange={(e) => setItem(index, 'description', e.target.value)}
                disabled={readOnly}
                placeholder="e.g. Explore corporate finance strategies…"
              />
            </div>
            <div className="cms-compact-fields-pair">
              <div className="cms-compact-field-fullwidth">
                <label className="cms-compact-field-label">Icon Image</label>
                <ImageUploadField
                  value={item.icon}
                  onChange={(src) => setItem(index, 'icon', src)}
                  readOnly={readOnly}
                  upload={upload}
                  placeholder="Upload icon"
                />
              </div>
              <div className="cms-compact-field-fullwidth">
                <label className="cms-compact-field-label">Link URL</label>
                <input
                  className="cms-compact-input cms-compact-input-fullwidth"
                  value={String(item.href ?? '')}
                  onChange={(e) => setItem(index, 'href', e.target.value)}
                  disabled={readOnly}
                  placeholder="/page-path or URL"
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function HomeEditor({
  master,
  canEdit,
}: {
  master?: SupportedMasterKey;
  canEdit: boolean;
}) {
  if (master) return <SliderMaster master={master} canEdit={canEdit} />;

  const [documents, setDocuments] = useState<Record<string, Document>>({});
  const [dirtyKeys, setDirtyKeys] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [uploads, setUploads] = useState(0);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // Load all home sections on mount
  async function loadAll() {
    setLoading(true);
    setError('');
    try {
      const res = await api<{ data: Record<string, Document> }>('/admin/home');
      if (res?.data && typeof res.data === 'object') {
        setDocuments(res.data);
      } else {
        throw new Error('Invalid response');
      }
      setDirtyKeys(new Set());
    } catch {
      try {
        const loaded: Record<string, Document> = {};
        await Promise.all(
          HOME_SECTIONS_SEQUENCE.map(async (key) => {
            const res = await api<{ data: Document }>(`/admin/home/${key}`);
            loaded[key] = res.data;
          })
        );
        setDocuments(loaded);
        setDirtyKeys(new Set());
      } catch (cause) {
        setError(cause instanceof Error ? cause.message : 'Could not load home page sections');
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadAll();
  }, []);

  // Warn if navigating away with unsaved changes
  useEffect(() => {
    if (dirtyKeys.size === 0) return;
    const warn = (event: BeforeUnloadEvent) => {
      event.preventDefault();
    };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [dirtyKeys]);

  async function upload(file: File) {
    if (file.size > 2 * 1024 * 1024) throw new Error('Image must be less than 2 MB');
    setUploads((v) => v + 1);
    try {
      const res = await api<{ data: { src: string; alt: string; width: number; height: number } }>(
        '/admin/home-media',
        {
          method: 'POST',
          body: file,
          headers: {
            'Content-Type': file.type,
            'X-File-Name': encodeURIComponent(file.name),
          },
        }
      );
      return res.data;
    } finally {
      setUploads((v) => v - 1);
    }
  }

  function handleSectionChange(key: string, content: Value) {
    setDocuments((prev) => ({
      ...prev,
      [key]: {
        ...prev[key],
        content,
      },
    }));
    setDirtyKeys((prev) => new Set(prev).add(key));
    setMessage('');
  }

  // Save all modified sections together
  async function handleSaveAll() {
    if (dirtyKeys.size === 0) return;
    setBusy(true);
    setMessage('');
    setError('');

    const payload: Record<string, { content: Value; updatedAt: string | null }> = {};
    for (const key of dirtyKeys) {
      if (documents[key]) {
        payload[key] = {
          content: documents[key].content,
          updatedAt: documents[key].updatedAt,
        };
      }
    }

    try {
      const res = await api<{ data: Record<string, Document> }>('/admin/home', {
        method: 'PATCH',
        body: JSON.stringify({ sections: payload }),
      });

      setDocuments((prev) => {
        const next = { ...prev };
        for (const [k, v] of Object.entries(res.data)) {
          next[k] = v;
        }
        return next;
      });

      const count = dirtyKeys.size;
      setDirtyKeys(new Set());
      setMessage(`✓ Home Page updated successfully! (${count} section${count > 1 ? 's' : ''} saved)`);
    } catch (cause) {
      try {
        const entries = Array.from(dirtyKeys);
        for (const key of entries) {
          const res = await api<{ data: Document }>(`/admin/home/${key}`, {
            method: 'PATCH',
            body: JSON.stringify(documents[key]),
          });
          setDocuments((prev) => ({ ...prev, [key]: res.data }));
        }
        const count = dirtyKeys.size;
        setDirtyKeys(new Set());
        setMessage(`✓ Home Page updated successfully! (${count} section${count > 1 ? 's' : ''} saved)`);
      } catch (fallbackCause) {
        setError(
          fallbackCause instanceof Error ? fallbackCause.message : 'Could not save home page sections'
        );
      }
    } finally {
      setBusy(false);
    }
  }

  function handleDiscard() {
    if (dirtyKeys.size === 0) return;
    if (window.confirm('Discard all unsaved changes and reload original content?')) {
      void loadAll();
    }
  }

  const dirtyCount = dirtyKeys.size;

  return (
    <div className="cms-editor cms-home-page-editor">
      <header className="page-heading" data-tour="home-editor-heading">
        <div>
          <nav className="cms-breadcrumbs" aria-label="Breadcrumb">
            <span>Website Pages</span>
            <span className="cms-breadcrumb-sep">/</span>
            <span className="cms-breadcrumb-current">Home Page CMS</span>
          </nav>
          <h1>Home Page CMS</h1>
          <p className="page-description">
            Edit all homepage sections directly in frontend sequence. Click <strong>Update Home Page</strong> at
            the bottom to save all sections together.
          </p>
        </div>
        <div className="cms-heading-actions">
          <a
            href={`${import.meta.env.VITE_WEB_BASE_URL ?? 'http://localhost:3000'}/`}
            target="_blank"
            rel="noopener noreferrer"
            className="cms-primary"
          >
            View Live Homepage ↗
          </a>
        </div>
      </header>

      {error && (
        <div className="cms-error cms-top-error" role="alert">
          {error}
          <button type="button" onClick={() => void loadAll()} className="cms-btn-reload">
            Reload saved content
          </button>
        </div>
      )}

      {loading ? (
        <div className="cms-loading-card">
          <span className="button-spinner" />
          <p>Loading homepage section forms…</p>
        </div>
      ) : (
        <div className="cms-sections-stream" data-tour="home-sections">
          {HOME_SECTIONS_SEQUENCE.map((key) => {
            const doc = documents[key];
            const template = homeDefaults[key] as unknown as Value;
            const isDirty = dirtyKeys.has(key);
            const masterKey = key in homeMasterDefaults ? (key as HomeMasterKey) : null;

            return (
              <section
                key={key}
                id={`section-${key}`}
                className={`cms-section-card ${isDirty ? 'cms-section-card--dirty' : ''}`}
                aria-labelledby={`heading-${key}`}
              >
                <div className="cms-section-card-header">
                  <div className="cms-section-card-title-group">
                    <div>
                      <h2 id={`heading-${key}`} className="cms-section-card-heading">
                        {sectionTitles[key]}
                      </h2>
                      <p className="cms-section-card-subheading">{sectionSubtitles[key]}</p>
                    </div>
                  </div>
                  <div className="cms-section-card-header-actions">
                    {isDirty && <span className="cms-dirty-pill">Unsaved edits</span>}
                    <span className="cms-section-pill">{sectionPills[key]}</span>
                    {masterKey && (
                      <Link
                        to={masterKey === 'life' ? '/masters/gallery/life' : `/masters/${masterKey}`}
                        className="cms-master-link-btn"
                        title={masterKey === 'life' ? 'Manage Gallery images and page visibility' : `Manage ${homeLabels[masterKey]} slider items`}
                      >
                        Manage {homeLabels[masterKey]} Slider →
                      </Link>
                    )}
                  </div>
                </div>

                <div className="cms-section-card-body">
                  {!doc ? (
                    <p className="cms-muted-text">Loading section data…</p>
                  ) : key === 'marquee' ? (
                    <MarqueeEditor
                      value={doc.content as { items?: MarqueeItem[] }}
                      onChange={(next) => handleSectionChange(key, next as unknown as Value)}
                      canEdit={canEdit}
                      busy={busy}
                    />
                  ) : key === 'stats' ? (
                    <StatsItemsEditor
                      items={(doc.content as { items?: StatItem[] })?.items ?? []}
                      readOnly={!canEdit || busy || uploads > 0}
                      onItemsChange={(items) => handleSectionChange(key, { items })}
                    />
                  ) : key === 'specialisations' ? (
                    <SpecialisationsItemsEditor
                      items={(doc.content as { items?: SpecialisationItem[] })?.items ?? []}
                      readOnly={!canEdit || busy || uploads > 0}
                      onItemsChange={(items) => handleSectionChange(key, { ...(doc.content as object), items })}
                      upload={upload}
                    />
                  ) : key === 'faq' ? (
                    <FaqSectionEditor
                      content={(doc.content as FaqContent) ?? {}}
                      readOnly={!canEdit || busy || uploads > 0}
                      onChange={(next) => handleSectionChange(key, next as unknown as Value)}
                    />
                  ) : (
                    <Field
                      name=""
                      hideLegend={true}
                      value={key === 'program' && doc.content && typeof doc.content === 'object' && !Array.isArray(doc.content)
                        ? { ...homeDefaults.program, ...doc.content }
                        : doc.content}
                      template={template}
                      readOnly={!canEdit || busy || uploads > 0}
                      onUpload={upload}
                      onChange={(content) => handleSectionChange(key, content)}
                    />
                  )}
                </div>
              </section>
            );
          })}

          {/* Single Unified Save Bar for the entire Home Page */}
          <div className="cms-bulk-save-bar" data-tour="home-save">
            <div className="cms-save-status">
              {dirtyCount > 0 ? (
                <span className="cms-status-dirty">
                  ● <strong>{dirtyCount}</strong> section{dirtyCount > 1 ? 's' : ''} modified
                </span>
              ) : (
                <span className="cms-status-clean">✓ All sections up to date</span>
              )}
              {message && (
                <span className="cms-status-success" role="status">
                  {message}
                </span>
              )}
              {error && (
                <span className="cms-status-error" role="alert">
                  {error}
                </span>
              )}
              {!canEdit && (
                <span className="cms-status-readonly">You have read-only access.</span>
              )}
            </div>

            <div className="cms-save-actions">
              {dirtyCount > 0 && (
                <button
                  type="button"
                  className="cms-secondary"
                  disabled={busy || uploads > 0}
                  onClick={handleDiscard}
                >
                  Discard changes
                </button>
              )}
              <button
                type="button"
                className="cms-primary cms-btn-update-home"
                disabled={!canEdit || dirtyCount === 0 || busy || uploads > 0}
                onClick={() => void handleSaveAll()}
              >
                {busy ? (
                  <>
                    <span className="button-spinner" /> Saving Home Page…
                  </>
                ) : (
                  '✓ Update Home Page'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
