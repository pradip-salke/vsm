import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../lib/api';
import './home-editor.css';
import { Field, type Value } from './ContentFields';
import { FaqSectionEditor, type FaqContent } from './FaqSectionEditor';
import { type AcademicsPageEditorConfig, aictePageConfig, aimaPageConfig, facultyPageConfig } from './academicsPageConfigs';

type Document = { content: Value; updatedAt: string | null };
type Upload = { src: string; alt: string; width: number; height: number };

const WEB_BASE = import.meta.env.VITE_WEB_BASE_URL ?? 'http://localhost:3000';

/**
 * Admin list/bulk responses may omit newer section keys until the API is redeployed (e.g. `faq`).
 * Fill gaps from embedded defaults so every card gets a document (`updatedAt: null` = not yet in DB).
 */
function mergeDocumentsWithDefaults(
  loaded: Record<string, Document>,
  config: AcademicsPageEditorConfig
): Record<string, Document> {
  const out = { ...loaded };
  for (const key of config.sections) {
    if (!out[key]) {
      out[key] = {
        content: config.defaults[key] as Value,
        updatedAt: null,
      };
    }
  }
  return out;
}

export function AcademicsPageEditor({
  canEdit,
  config,
  mapDocumentsLoaded,
  mapBulkSavePayload,
}: {
  canEdit: boolean;
  config: AcademicsPageEditorConfig;
  /** Transform flat API keys into section keys shown in this editor (e.g. spec pages). */
  mapDocumentsLoaded?: (raw: Record<string, Document>) => Record<string, Document>;
  /** Wrap bulk PATCH body — default `{ sections }`. */
  mapBulkSavePayload?: (sections: Record<string, Document>) => Record<string, unknown>;
}) {
  const [documents, setDocuments] = useState<Record<string, Document>>({});
  const [dirtyKeys, setDirtyKeys] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [uploads, setUploads] = useState(0);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  async function loadAll() {
    setLoading(true);
    setError('');
    try {
      const raw = (await api<{ data: Record<string, Document> }>(config.apiList)).data;
      const mapped = mapDocumentsLoaded ? mapDocumentsLoaded(raw) : raw;
      setDocuments(mergeDocumentsWithDefaults(mapped, config));
      setDirtyKeys(new Set());
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : config.loadError);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadAll();
  }, [config.apiList]);

  useEffect(() => {
    if (dirtyKeys.size === 0) return;
    const warn = (event: BeforeUnloadEvent) => event.preventDefault();
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [dirtyKeys]);

  async function upload(file: File): Promise<Upload> {
    if (file.size > 2 * 1024 * 1024) throw new Error('Image must be less than 2 MB');
    setUploads((count) => count + 1);
    try {
      return (
        await api<{ data: Upload }>('/admin/home-media', {
          method: 'POST',
          body: file,
          headers: { 'Content-Type': file.type, 'X-File-Name': encodeURIComponent(file.name) },
        })
      ).data;
    } finally {
      setUploads((count) => count - 1);
    }
  }

  function change(key: string, content: Value) {
    setDocuments((prev) => ({ ...prev, [key]: { ...prev[key], content } }));
    setDirtyKeys((prev) => new Set(prev).add(key));
    setMessage('');
  }

  async function saveAll() {
    if (dirtyKeys.size === 0) return;
    setBusy(true);
    setMessage('');
    setError('');
    const sections = Object.fromEntries([...dirtyKeys].map((key) => [key, documents[key]]));
    try {
      const body = mapBulkSavePayload
        ? mapBulkSavePayload(sections)
        : { sections };
      const result = await api<{ data: Record<string, Document> }>(config.apiBulk, {
        method: 'PATCH',
        body: JSON.stringify(body),
      });
      const savedRaw = result.data;
      const mappedSaved = mapDocumentsLoaded ? mapDocumentsLoaded(savedRaw) : savedRaw;
      setDocuments((prev) =>
        mergeDocumentsWithDefaults(
          { ...prev, ...mappedSaved },
          config
        )
      );
      const count = dirtyKeys.size;
      setDirtyKeys(new Set());
      setMessage(config.successMessage(count));
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : config.saveError);
    } finally {
      setBusy(false);
    }
  }

  function discard() {
    if (dirtyKeys.size && window.confirm('Discard all unsaved changes and reload the saved content?')) void loadAll();
  }

  const dirtyCount = dirtyKeys.size;
  const readOnly = !canEdit || busy || uploads > 0;

  return (
    <div className="cms-editor cms-home-page-editor">
      <header className="page-heading">
        <div>
          <nav className="cms-breadcrumbs" aria-label="Breadcrumb">
            <span>Website Pages</span>
            <span className="cms-breadcrumb-sep">/</span>
            <span>{config.breadcrumbs.group}</span>
            {config.breadcrumbs.parent && (
              <>
                <span className="cms-breadcrumb-sep">/</span>
                <span>{config.breadcrumbs.parent}</span>
              </>
            )}
            <span className="cms-breadcrumb-sep">/</span>
            <span className="cms-breadcrumb-current">{config.breadcrumbs.current}</span>
          </nav>
          <h1>{config.title}</h1>
          <p className="page-description">{config.description}</p>
        </div>
        <div className="cms-heading-actions">
          <a href={`${WEB_BASE}${config.liveUrl}`} target="_blank" rel="noopener noreferrer" className="cms-primary">
            View Live Page ↗
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
          <p>{config.loadingLabel}</p>
        </div>
      ) : (
        <div className="cms-sections-stream">
          {config.sections.map((key) => {
            const doc = documents[key];
            const isDirty = dirtyKeys.has(key);
            const master = config.masterLinks[key];
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
                        {config.labels[key] ?? key}
                      </h2>
                      <p className="cms-section-card-subheading">{config.subtitles[key] ?? ''}</p>
                    </div>
                  </div>
                  <div className="cms-section-card-header-actions">
                    {isDirty && <span className="cms-dirty-pill">Unsaved edits</span>}
                    <span className="cms-section-pill">
                      {config.sectionPillPrefix} Section: #{config.anchors[key] ?? key}
                    </span>
                    {master && (
                      <Link to={master.to} className="cms-master-link-btn">
                        {master.label}
                      </Link>
                    )}
                  </div>
                </div>
                <div className="cms-section-card-body">
                  {doc ? (
                    key === 'faq' ? (
                      <FaqSectionEditor
                        content={(doc.content as FaqContent) ?? {}}
                        readOnly={readOnly}
                        metaFields={config.faq?.metaFields}
                        richAnswers={config.faq?.richAnswers}
                        onChange={(next) => change(key, next as Value)}
                      />
                    ) : (
                      <Field
                        name=""
                        hideLegend
                        value={doc.content}
                        template={config.defaults[key] as unknown as Value}
                        readOnly={readOnly}
                        onUpload={upload}
                        onChange={(content) => change(key, content)}
                      />
                    )
                  ) : (
                    <p className="cms-muted-text">Loading section data…</p>
                  )}
                </div>
              </section>
            );
          })}

          {config.sharedSections.length > 0 && (
            <section className="cms-section-card" aria-labelledby="heading-shared">
              <div className="cms-section-card-header">
                <div className="cms-section-card-title-group">
                  <div>
                    <h2 id="heading-shared" className="cms-section-card-heading">
                      {config.sharedCardTitle}
                    </h2>
                    <p className="cms-section-card-subheading">{config.sharedCardSubtitle}</p>
                  </div>
                </div>
              </div>
              <div className="cms-section-card-body cms-section-card-header-actions">
                {config.sharedSections.map((section) => (
                  <Link key={section.label} to={section.to} className="cms-master-link-btn">
                    {section.label} →
                  </Link>
                ))}
              </div>
            </section>
          )}

          <div className="cms-bulk-save-bar">
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
              {!canEdit && <span className="cms-status-readonly">You have read-only access.</span>}
            </div>
            <div className="cms-save-actions">
              {dirtyCount > 0 && (
                <button type="button" className="cms-secondary" disabled={busy || uploads > 0} onClick={discard}>
                  Discard changes
                </button>
              )}
              <button
                type="button"
                className="cms-primary cms-btn-update-home"
                disabled={!canEdit || dirtyCount === 0 || busy || uploads > 0}
                onClick={() => void saveAll()}
              >
                {busy ? (
                  <>
                    <span className="button-spinner" /> {config.saveBusyLabel}
                  </>
                ) : (
                  config.saveButtonLabel
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/** AICTE PGDM — Page Sections */
export function AictePgdmPageEditor({ canEdit }: { canEdit: boolean }) {
  return <AcademicsPageEditor canEdit={canEdit} config={aictePageConfig} />;
}

/** AIMA PGDM — Page Sections */
export function AimaPgdmPageEditor({ canEdit }: { canEdit: boolean }) {
  return <AcademicsPageEditor canEdit={canEdit} config={aimaPageConfig} />;
}

/** Teaching Faculty — Page Sections */
export function FacultyPageEditor({ canEdit }: { canEdit: boolean }) {
  return <AcademicsPageEditor canEdit={canEdit} config={facultyPageConfig} />;
}
