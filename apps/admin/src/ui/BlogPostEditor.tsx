import { useEffect, useRef, useState, type FormEvent, type ReactNode } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import type { BlogPostRecord, BlogPostStatus } from '@vsmedu/contracts/blogs';
import { api } from '../lib/api';
import { ArticleHtmlEditor } from './ArticleHtmlEditor';
import { preview } from './ContentFields';
import { BLOG_POSTS_PATH } from './sitePagesAdmin';
import './home-editor.css';

type Form = Omit<BlogPostRecord, 'id' | 'createdAt' | 'updatedAt'>;
type Upload = { src: string; alt: string; width: number; height: number };

const WEB_BASE = import.meta.env.VITE_WEB_BASE_URL ?? 'http://localhost:3000';
const EMPTY: Form = {
  slug: '',
  title: '',
  excerpt: '',
  body: '',
  coverImageUrl: '',
  coverImageAlt: '',
  categories: ['Blog'],
  tags: [],
  authorName: '',
  authorRole: '',
  authorImageUrl: '',
  authorBio: '',
  featured: false,
  status: 'DRAFT',
  publishedAt: null,
  seoTitle: '',
  seoDescription: '',
  canonicalUrl: '',
  ogImageUrl: '',
  noIndex: false,
};

const slugify = (text: string) =>
  text.toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g, '').replace(/&/g, ' and ').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 240);
const toLocalInput = (iso: string | null) => {
  if (!iso) return '';
  const d = new Date(iso);
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
};

function Card({ title, subtitle, children }: { title: string; subtitle: string; children: ReactNode }) {
  return (
    <section className="cms-section-card">
      <div className="cms-section-card-header">
        <div className="cms-section-card-title-group">
          <div>
            <h2 className="cms-section-card-heading">{title}</h2>
            <p className="cms-section-card-subheading">{subtitle}</p>
          </div>
        </div>
      </div>
      <div className="cms-section-card-body">{children}</div>
    </section>
  );
}

function ChipsInput({ label, values, suggestions, onChange, disabled }: { label: string; values: string[]; suggestions: string[]; onChange: (next: string[]) => void; disabled: boolean }) {
  const [draft, setDraft] = useState('');
  const id = `chips-${label.toLowerCase().replace(/\W+/g, '-')}`;
  const add = () => {
    const value = draft.trim().replace(/,$/, '');
    if (value && !values.some((v) => v.toLowerCase() === value.toLowerCase())) onChange([...values, value]);
    setDraft('');
  };
  return (
    <div className="cms-field">
      <span>{label}</span>
      <div className="cms-chips" role="list" style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 6 }}>
        {values.map((value) => (
          <span role="listitem" key={value} className="cms-status is-active" style={{ gap: 6 }}>
            {value}
            <button type="button" className="cms-icon-btn" disabled={disabled} aria-label={`Remove ${value}`} onClick={() => onChange(values.filter((v) => v !== value))}>×</button>
          </span>
        ))}
        {values.length === 0 && <span className="cms-muted-text">None</span>}
      </div>
      <input
        list={id}
        aria-label={`Add ${label.toLowerCase()}`}
        placeholder={`Type and press Enter to add`}
        value={draft}
        disabled={disabled}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ',') {
            e.preventDefault();
            add();
          }
        }}
        onBlur={add}
      />
      <datalist id={id}>{suggestions.filter((s) => !values.includes(s)).map((s) => <option key={s} value={s} />)}</datalist>
    </div>
  );
}

function ImageField({ label, value, alt, onChange, onAltChange, upload, disabled }: { label: string; value: string; alt?: string; onChange: (src: string) => void; onAltChange?: (alt: string) => void; upload: (file: File) => Promise<Upload>; disabled: boolean }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  return (
    <div className="cms-field">
      <span>{label}</span>
      {value ? <img src={preview(value)} alt="" style={{ maxWidth: 320, maxHeight: 180, objectFit: 'cover', borderRadius: 8, display: 'block', marginBottom: 8 }} /> : <span className="cms-no-image">No image</span>}
      <input aria-label={`${label} URL`} placeholder="Upload an image or paste https://… / site path" value={value} disabled={disabled} onChange={(e) => onChange(e.target.value)} />
      <div style={{ display: 'flex', gap: 8, marginTop: 6, alignItems: 'center' }}>
        <input
          type="file"
          accept="image/*"
          aria-label={`Upload ${label.toLowerCase()}`}
          disabled={disabled || busy}
          onChange={async (e) => {
            const file = e.target.files?.[0];
            if (!file) return;
            setBusy(true);
            setError('');
            try {
              const asset = await upload(file);
              onChange(asset.src);
            } catch (cause) {
              setError(cause instanceof Error ? cause.message : 'Upload failed');
            } finally {
              setBusy(false);
              e.target.value = '';
            }
          }}
        />
        {value && <button type="button" className="cms-secondary" disabled={disabled} onClick={() => onChange('')}>Remove image</button>}
        {busy && <span className="button-spinner" />}
      </div>
      {onAltChange && (
        <label className="cms-field" style={{ marginTop: 8 }}>
          <span>Image description (alt text)</span>
          <input value={alt ?? ''} disabled={disabled} onChange={(e) => onAltChange(e.target.value)} placeholder="Describe what the image shows" />
        </label>
      )}
      {error && <p className="cms-error" role="alert">{error}</p>}
    </div>
  );
}

export function BlogPostEditor({ canEdit }: { canEdit: boolean }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams<{ id?: string }>();
  const isNew = !id;
  const [form, setForm] = useState<Form>(EMPTY);
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);
  const [slugTouched, setSlugTouched] = useState(!isNew);
  const [loading, setLoading] = useState(!isNew);
  const [busy, setBusy] = useState(false);
  const [uploads, setUploads] = useState(0);
  const [dirty, setDirty] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [suggestions, setSuggestions] = useState<{ categories: string[]; tags: string[] }>({ categories: [], tags: [] });
  const [previewOpen, setPreviewOpen] = useState(false);
  const previewRef = useRef<HTMLDialogElement>(null);

  async function load() {
    setError('');
    try {
      const meta = (await api<{ data: { categories: { name: string }[]; tags: { name: string }[] } }>('/admin/blog-posts?pageSize=1')).data;
      setSuggestions({ categories: meta.categories.map((c) => c.name), tags: meta.tags.map((t) => t.name) });
      if (isNew) return;
      setLoading(true);
      const post = (await api<{ data: BlogPostRecord }>(`/admin/blog-posts/${id}`)).data;
      const { id: _id, createdAt: _c, updatedAt: stamp, ...rest } = post;
      setForm(rest);
      setUpdatedAt(stamp);
      setDirty(false);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Could not load the post');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, [id]);

  useEffect(() => {
    if (!loading && new URLSearchParams(location.search).has('preview')) {
      setPreviewOpen(true);
      navigate(location.pathname, { replace: true });
    }
  }, [loading, location.pathname, location.search, navigate]);

  useEffect(() => {
    if (previewOpen && !previewRef.current?.open) previewRef.current?.showModal();
    else if (!previewOpen) previewRef.current?.close();
  }, [previewOpen]);

  useEffect(() => {
    if (!dirty) return;
    const warn = (event: BeforeUnloadEvent) => event.preventDefault();
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [dirty]);

  function set<K extends keyof Form>(key: K, value: Form[K]) {
    setForm((prev) => {
      const next = { ...prev, [key]: value };
      if (key === 'title' && !slugTouched) next.slug = slugify(String(value));
      return next;
    });
    setDirty(true);
    setMessage('');
  }

  async function upload(file: File): Promise<Upload> {
    if (file.size > 2 * 1024 * 1024) throw new Error('Image must be less than 2 MB');
    setUploads((n) => n + 1);
    try {
      return (await api<{ data: Upload }>('/admin/home-media', { method: 'POST', body: file, headers: { 'Content-Type': file.type, 'X-File-Name': encodeURIComponent(file.name) } })).data;
    } finally {
      setUploads((n) => n - 1);
    }
  }

  async function save(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError('');
    setMessage('');
    try {
      const body = JSON.stringify({ ...form, ...(isNew ? {} : { updatedAt }) });
      const saved = (await api<{ data: BlogPostRecord }>(isNew ? '/admin/blog-posts' : `/admin/blog-posts/${id}`, { method: isNew ? 'POST' : 'PATCH', body })).data;
      setDirty(false);
      if (isNew) {
        navigate(`${BLOG_POSTS_PATH}/${saved.id}/edit`, { replace: true });
        return;
      }
      const { id: _id, createdAt: _c, updatedAt: stamp, ...rest } = saved;
      setForm(rest);
      setUpdatedAt(stamp);
      setMessage(`✓ Post saved${saved.status === 'PUBLISHED' ? ' and published' : ` as ${saved.status.toLowerCase()}`}.`);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Could not save the post');
    } finally {
      setBusy(false);
    }
  }

  const readOnly = !canEdit || busy || uploads > 0;
  const publicUrl = `${WEB_BASE}/blogs/${form.slug}/`;

  return (
    <div className="cms-editor cms-home-page-editor">
      <header className="page-heading">
        <div>
          <nav className="cms-breadcrumbs" aria-label="Breadcrumb">
            <span>Website Pages</span>
            <span className="cms-breadcrumb-sep">/</span>
            <span>Blog Management</span>
            <span className="cms-breadcrumb-sep">/</span>
            <span>Blog Posts</span>
            <span className="cms-breadcrumb-sep">/</span>
            <span className="cms-breadcrumb-current">{isNew ? 'Add Post' : 'Edit Post'}</span>
          </nav>
          <h1>{isNew ? 'Add Blog Post' : `Edit: ${form.title || 'Blog post'}`}</h1>
          <p className="page-description">Article content, featured image, categories, tags, author, publishing and SEO for one blog detail page.</p>
        </div>
        <div className="cms-heading-actions">
          <button type="button" className="cms-secondary" onClick={() => navigate(BLOG_POSTS_PATH)}>← Back to Blog Posts</button>
          {!isNew && <button type="button" className="cms-secondary" onClick={() => setPreviewOpen(true)}>Preview</button>}
          {!isNew && form.status === 'PUBLISHED' && (
            <a className="cms-primary" href={publicUrl} target="_blank" rel="noopener noreferrer">View Live Post ↗</a>
          )}
        </div>
      </header>

      {error && <div className="cms-error cms-top-error" role="alert">{error}{!isNew && <button type="button" className="cms-btn-reload" onClick={() => void load()}>Reload saved post</button>}</div>}

      {loading ? (
        <div className="cms-loading-card"><span className="button-spinner" /><p>Loading post…</p></div>
      ) : (
        <form className="cms-sections-stream" onSubmit={save}>
          <Card title="Article Content" subtitle="Title, URL slug, the excerpt shown on listing cards, and the full article body.">
            <label className="cms-field"><span>Title</span><input required minLength={3} maxLength={240} value={form.title} disabled={readOnly} onChange={(e) => set('title', e.target.value)} /></label>
            <label className="cms-field">
              <span>URL slug</span>
              <input required pattern="[a-z0-9]+(-[a-z0-9]+)*" title="Lowercase letters, numbers and hyphens" maxLength={240} value={form.slug} disabled={readOnly} onChange={(e) => { setSlugTouched(true); set('slug', e.target.value); }} />
              <small className="cms-field-hint">Public URL: /blogs/{form.slug || '…'}/</small>
            </label>
            <div className="cms-field"><span>Excerpt</span><ArticleHtmlEditor label="Excerpt" rows={5} value={form.excerpt} disabled={readOnly} onChange={(html) => set('excerpt', html)} /></div>
            <div className="cms-field"><span>Article body</span><ArticleHtmlEditor label="Article body" value={form.body} disabled={readOnly} upload={upload} onChange={(html) => set('body', html)} /></div>
          </Card>

          <Card title="Featured Image" subtitle="Shown on the listing card and at the top of the article.">
            <ImageField label="Featured image" value={form.coverImageUrl} alt={form.coverImageAlt} onChange={(src) => set('coverImageUrl', src)} onAltChange={(alt) => set('coverImageAlt', alt)} upload={upload} disabled={readOnly} />
          </Card>

          <Card title="Categories & Tags" subtitle="The first category is shown on the listing card. Pick existing values from suggestions or type new ones.">
            <ChipsInput label="Categories" values={form.categories} suggestions={suggestions.categories} disabled={readOnly} onChange={(v) => set('categories', v)} />
            <ChipsInput label="Tags" values={form.tags} suggestions={suggestions.tags} disabled={readOnly} onChange={(v) => set('tags', v)} />
          </Card>

          <Card title="Author" subtitle="Author details for this article (optional).">
            <label className="cms-field"><span>Author name</span><input maxLength={160} value={form.authorName} disabled={readOnly} onChange={(e) => set('authorName', e.target.value)} /></label>
            <label className="cms-field"><span>Author designation</span><input maxLength={160} value={form.authorRole} disabled={readOnly} onChange={(e) => set('authorRole', e.target.value)} /></label>
            <ImageField label="Author photo" value={form.authorImageUrl} onChange={(src) => set('authorImageUrl', src)} upload={upload} disabled={readOnly} />
            <label className="cms-field"><span>Author bio</span><textarea rows={3} maxLength={2000} value={form.authorBio} disabled={readOnly} onChange={(e) => set('authorBio', e.target.value)} /></label>
          </Card>

          <Card title="Publishing" subtitle="Draft and archived posts are hidden from the website. A future publish date schedules the post.">
            <label className="cms-field">
              <span>Status</span>
              <select value={form.status} disabled={readOnly} onChange={(e) => set('status', e.target.value as BlogPostStatus)}>
                <option value="DRAFT">Draft (hidden)</option>
                <option value="PUBLISHED">Published</option>
                <option value="ARCHIVED">Archived (hidden)</option>
              </select>
            </label>
            <label className="cms-field">
              <span>Publish date</span>
              <input type="datetime-local" value={toLocalInput(form.publishedAt)} disabled={readOnly} onChange={(e) => set('publishedAt', e.target.value ? new Date(e.target.value).toISOString() : null)} />
              <small className="cms-field-hint">Leave empty to use the moment it is first published.</small>
            </label>
            <label className="cms-field cms-checkbox"><span>Featured post</span><input type="checkbox" checked={form.featured} disabled={readOnly} onChange={(e) => set('featured', e.target.checked)} /></label>
          </Card>

          <Card title="SEO" subtitle="Search engine title and description. Empty fields fall back to the article title and excerpt.">
            <label className="cms-field"><span>SEO title</span><input maxLength={255} value={form.seoTitle} disabled={readOnly} placeholder={form.title} onChange={(e) => set('seoTitle', e.target.value)} /><small className="cms-field-hint">{form.seoTitle.length}/60 recommended</small></label>
            <label className="cms-field"><span>Meta description</span><textarea rows={3} maxLength={500} value={form.seoDescription} disabled={readOnly} onChange={(e) => set('seoDescription', e.target.value)} /><small className="cms-field-hint">{form.seoDescription.length}/160 recommended</small></label>
            <label className="cms-field"><span>Canonical URL</span><input value={form.canonicalUrl} disabled={readOnly} placeholder={`/blogs/${form.slug}/`} onChange={(e) => set('canonicalUrl', e.target.value)} /></label>
            <ImageField label="Social share (Open Graph) image" value={form.ogImageUrl} onChange={(src) => set('ogImageUrl', src)} upload={upload} disabled={readOnly} />
            <label className="cms-field cms-checkbox"><span>Hide from search engines (noindex)</span><input type="checkbox" checked={form.noIndex} disabled={readOnly} onChange={(e) => set('noIndex', e.target.checked)} /></label>
          </Card>

          <div className="cms-bulk-save-bar">
            <div className="cms-save-status">
              {dirty ? <span className="cms-status-dirty">● Unsaved changes</span> : <span className="cms-status-clean">✓ No unsaved changes</span>}
              {message && <span className="cms-status-success" role="status">{message}</span>}
              {!canEdit && <span className="cms-status-readonly">You have read-only access.</span>}
            </div>
            <div className="cms-save-actions">
              <button type="button" className="cms-secondary" disabled={busy} onClick={() => navigate(BLOG_POSTS_PATH)}>Cancel</button>
              <button type="submit" className="cms-primary cms-btn-update-home" disabled={!canEdit || busy || uploads > 0 || (!dirty && !isNew)}>
                {busy ? <><span className="button-spinner" /> Saving…</> : isNew ? 'Create Blog Post' : '✓ Update Blog Post'}
              </button>
            </div>
          </div>
        </form>
      )}
      <dialog className="cms-delete-dialog" ref={previewRef} onCancel={() => setPreviewOpen(false)} aria-label="Blog post preview" style={{ width: 'min(900px, calc(100vw - 32px))', maxWidth: '900px', maxHeight: '90vh', overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16 }}>
          <h2 style={{ margin: 0 }}>Post preview</h2>
          <button type="button" className="cms-secondary" onClick={() => setPreviewOpen(false)}>Close</button>
        </div>
        {form.coverImageUrl && <img src={preview(form.coverImageUrl)} alt={form.coverImageAlt || ''} style={{ display: 'block', width: '100%', maxHeight: 360, objectFit: 'cover', borderRadius: 8, marginTop: 16 }} />}
        <h1>{form.title || 'Untitled post'}</h1>
        <p className="cms-muted-text">{form.categories.join(' · ')}{form.authorName ? ` · ${form.authorName}` : ''}{form.publishedAt ? ` · ${new Intl.DateTimeFormat('en-IN', { dateStyle: 'long' }).format(new Date(form.publishedAt))}` : ''}</p>
        <div className="cms-article-preview" dangerouslySetInnerHTML={{ __html: form.excerpt }} />
        <div className="cms-article-preview" dangerouslySetInnerHTML={{ __html: form.body }} />
      </dialog>
    </div>
  );
}
