import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import type { BlogPostRecord, BlogPostStatus } from '@vsmedu/contracts/blogs';
import { api } from '../lib/api';
import { Icon } from './Icon';
import { preview } from './ContentFields';
import { BLOG_POSTS_PATH } from './sitePagesAdmin';
import './home-editor.css';

type ListItem = Pick<BlogPostRecord, 'id' | 'slug' | 'title' | 'status' | 'featured' | 'publishedAt' | 'updatedAt' | 'categories' | 'tags' | 'coverImageUrl' | 'authorName'>;
type ListResult = {
  items: ListItem[];
  total: number;
  page: number;
  pageSize: number;
  categories: { name: string; total: number }[];
  tags: { name: string; total: number }[];
  statusCounts: Record<BlogPostStatus, number>;
};

const WEB_BASE = import.meta.env.VITE_WEB_BASE_URL ?? 'http://localhost:3000';
const STATUS_LABEL: Record<BlogPostStatus, string> = { PUBLISHED: 'Published', DRAFT: 'Draft', ARCHIVED: 'Archived' };
const formatDate = (iso: string | null) => (iso ? new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(iso)) : '—');

export function BlogPostsPage({ canEdit }: { canEdit: boolean }) {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState<'' | BlogPostStatus>('');
  const [category, setCategory] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [result, setResult] = useState<ListResult | null>(null);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [busyId, setBusyId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState<ListItem | null>(null);
  const deleteRef = useRef<HTMLDialogElement>(null);

  async function load() {
    setError('');
    const params = new URLSearchParams({ page: String(page), pageSize: String(pageSize) });
    if (query.trim()) params.set('q', query.trim());
    if (status) params.set('status', status);
    if (category) params.set('category', category);
    try {
      setResult((await api<{ data: ListResult }>(`/admin/blog-posts?${params}`)).data);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Could not load blog posts');
    }
  }

  useEffect(() => {
    const timer = window.setTimeout(() => void load(), 250);
    return () => window.clearTimeout(timer);
  }, [query, status, category, page, pageSize]);

  useEffect(() => {
    if (deleting && !deleteRef.current?.open) deleteRef.current?.showModal();
    else if (!deleting) deleteRef.current?.close();
  }, [deleting]);

  async function toggleStatus(item: ListItem) {
    const next: BlogPostStatus = item.status === 'PUBLISHED' ? 'DRAFT' : 'PUBLISHED';
    setBusyId(item.id);
    setMessage('');
    setError('');
    try {
      await api(`/admin/blog-posts/${item.id}/status`, { method: 'PATCH', body: JSON.stringify({ status: next, updatedAt: item.updatedAt }) });
      setMessage(`“${item.title}” ${next === 'PUBLISHED' ? 'published' : 'unpublished (saved as draft)'}.`);
      await load();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Could not change status');
    } finally {
      setBusyId(null);
    }
  }

  async function remove() {
    if (!deleting) return;
    setBusyId(deleting.id);
    try {
      await api(`/admin/blog-posts/${deleting.id}`, { method: 'DELETE' });
      setMessage(`“${deleting.title}” deleted.`);
      setDeleting(null);
      await load();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Could not delete the post');
    } finally {
      setBusyId(null);
    }
  }

  const pages = result ? Math.max(1, Math.ceil(result.total / result.pageSize)) : 1;
  const counts = result?.statusCounts;

  return (
    <div className="cms-editor cms-master">
      <header className="cms-master-heading">
        <div>
          <nav className="cms-breadcrumbs" aria-label="Breadcrumb">
            <span>Website Pages</span>
            <span className="cms-breadcrumb-sep">/</span>
            <span>Blogs</span>
            <span className="cms-breadcrumb-sep">/</span>
            <span className="cms-breadcrumb-current">Blog Posts</span>
          </nav>
          <h1>Blog Posts</h1>
          <p className="page-description">
            Articles shown on <a href={`${WEB_BASE}/blogs/`} target="_blank" rel="noopener noreferrer">/blogs/ ↗</a> and their detail pages. Only published posts with a publish date in the past are public.
            {counts && ` ${counts.PUBLISHED} published · ${counts.DRAFT} draft · ${counts.ARCHIVED} archived.`}
          </p>
        </div>
        <button type="button" className="cms-primary" disabled={!canEdit} onClick={() => navigate(`${BLOG_POSTS_PATH}/new`)}>
          <span aria-hidden="true">＋</span> Add Blog Post
        </button>
      </header>
      {error && <div className="cms-error" role="alert">{error} <button type="button" onClick={() => void load()}>Reload</button></div>}
      <p className="cms-master-message" role="status">{message}</p>
      <div className="cms-table-toolbar">
        <label>
          Show{' '}
          <select aria-label="Posts per page" value={pageSize} onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1); }}>
            {[10, 20, 50, 100].map((n) => <option key={n}>{n}</option>)}
          </select>{' '}
          posts
        </label>
        <label>
          Status:{' '}
          <select aria-label="Filter by status" value={status} onChange={(e) => { setStatus(e.target.value as '' | BlogPostStatus); setPage(1); }}>
            <option value="">All</option>
            {(Object.keys(STATUS_LABEL) as BlogPostStatus[]).map((s) => <option key={s} value={s}>{STATUS_LABEL[s]}</option>)}
          </select>
        </label>
        <label>
          Category:{' '}
          <select aria-label="Filter by category" value={category} onChange={(e) => { setCategory(e.target.value); setPage(1); }}>
            <option value="">All</option>
            {result?.categories.map((c) => <option key={c.name} value={c.name}>{c.name} ({c.total})</option>)}
          </select>
        </label>
        <label>
          Search:{' '}
          <input type="search" aria-label="Search posts" placeholder="Title, slug or author" value={query} onChange={(e) => { setQuery(e.target.value); setPage(1); }} />
        </label>
      </div>
      <div className="cms-table-card">
        <div className="cms-table-overflow">
          <table className="cms-slides-table cms-blog-posts-table">
            <thead>
              <tr>
                <th scope="col">Featured image</th>
                <th scope="col">Title</th>
                <th scope="col">Categories</th>
                <th scope="col">Published</th>
                <th scope="col">Status</th>
                <th scope="col">Action</th>
              </tr>
            </thead>
            <tbody>
              {!result ? (
                <tr><td colSpan={6}>{error ? 'Posts could not be loaded.' : 'Loading posts…'}</td></tr>
              ) : result.items.length === 0 ? (
                <tr><td colSpan={6}>No posts found.</td></tr>
              ) : (
                result.items.map((item) => (
                  <tr key={item.id}>
                    <td>{item.coverImageUrl ? <img className="cms-slide-thumbnail" src={preview(item.coverImageUrl)} alt="" /> : <span className="cms-no-image">No image</span>}</td>
                    <td>
                      <strong><Link to={`${BLOG_POSTS_PATH}/${item.id}/edit`}>{item.title}</Link></strong>
                      <p>/blogs/{item.slug}/{item.featured ? ' · ★ Featured' : ''}{item.authorName ? ` · ${item.authorName}` : ''}</p>
                    </td>
                    <td>{item.categories.join(', ') || '—'}</td>
                    <td>{formatDate(item.publishedAt)}</td>
                    <td>
                      <span className={`cms-status ${item.status === 'PUBLISHED' ? 'is-active' : 'is-inactive'}`}><span aria-hidden="true" />{STATUS_LABEL[item.status]}</span>
                    </td>
                    <td>
                      <div className="cms-row-actions">
                        <button type="button" className="cms-secondary" disabled={!canEdit || busyId !== null} onClick={() => void toggleStatus(item)}>
                          {item.status === 'PUBLISHED' ? 'Unpublish' : 'Publish'}
                        </button>
                        <button type="button" className="cms-edit-action" disabled={!canEdit} aria-label={`Edit ${item.title}`} title="Edit post" onClick={() => navigate(`${BLOG_POSTS_PATH}/${item.id}/edit`)}>
                          <Icon name="edit" size={18} />
                        </button>
                        <button type="button" className="cms-delete-action" disabled={!canEdit || busyId !== null} aria-label={`Delete ${item.title}`} title="Delete post" onClick={() => setDeleting(item)}>
                          <Icon name="trash" size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {result && (
          <footer className="cms-table-footer">
            <span>
              Showing {result.total ? (result.page - 1) * result.pageSize + 1 : 0} to {Math.min(result.page * result.pageSize, result.total)} of {result.total} posts
            </span>
            <nav aria-label="Post pagination">
              <button type="button" disabled={page <= 1} onClick={() => setPage(page - 1)}>Previous</button>
              {Array.from({ length: pages }, (_, i) => i + 1).map((n) => (
                <button key={n} type="button" aria-label={`Page ${n}`} aria-current={page === n ? 'page' : undefined} onClick={() => setPage(n)}>{n}</button>
              ))}
              <button type="button" disabled={page >= pages} onClick={() => setPage(page + 1)}>Next</button>
            </nav>
          </footer>
        )}
      </div>
      <dialog className="cms-delete-dialog" ref={deleteRef} onCancel={() => setDeleting(null)} aria-labelledby="delete-post-title">
        <h2 id="delete-post-title">Delete this blog post?</h2>
        <p>{deleting?.title}</p>
        <p>This permanently removes the post and its SEO settings. Its page /blogs/{deleting?.slug}/ will no longer be available.</p>
        <div className="cms-save-bar">
          <button type="button" className="cms-danger" disabled={busyId !== null} onClick={() => void remove()}>{busyId !== null ? 'Deleting…' : 'Delete post'}</button>
          <button type="button" className="cms-secondary" disabled={busyId !== null} onClick={() => setDeleting(null)}>Cancel</button>
        </div>
      </dialog>
    </div>
  );
}
