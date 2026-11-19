import { useEffect, useState } from 'react';
import { api, publicAssetUrl } from '../lib/api';
import { Icon } from './Icon';
import './enquiries.css';

export type EnquiryType = 'career' | 'enquiry' | 'application';

type CareerItem = {
  id: number;
  name: string;
  email: string | null;
  phone: string;
  position: string;
  designation: string;
  resumeUrl: string | null;
  resumeName: string | null;
  status: string;
  submittedAt: string;
};

type GeneralItem = {
  id: number;
  name: string;
  email: string | null;
  phone: string;
  organization: string | null;
  designation: string | null;
  city: string | null;
  message: string | null;
  source: string | null;
  status: string;
  submittedAt: string;
};

type ApplicationItem = {
  id: number;
  fullName: string;
  firstName: string;
  middleName: string | null;
  lastName: string;
  email: string;
  phone: string;
  parentPhone: string | null;
  dateOfBirth: string | null;
  nationality: string | null;
  gender: string | null;
  familyAnnualIncome: string | null;
  referral: string | null;
  referralOther: string | null;
  consent: boolean;
  address: string | null;
  city: string | null;
  postalCode: string | null;
  country: string | null;
  qualification: string;
  examSummary: string;
  education: Array<{
    stage: string;
    institution: string | null;
    board: string | null;
    stream: string | null;
    passingYear: number | null;
    resultPercent: number | null;
  }>;
  examScores: Array<{
    examCode: string;
    score: number | null;
    rank: number | null;
    session: string | null;
  }>;
  status: string;
  submittedAt: string;
};

type AnySubmission = CareerItem | GeneralItem | ApplicationItem;

type ResponseData<T> = {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  stats: { total: number; newCount: number };
};

export function EnquiriesPage({
  type,
  canEdit,
}: {
  type: EnquiryType;
  canEdit: boolean;
}) {
  const [items, setItems] = useState<AnySubmission[]>([]);
  const [total, setTotal] = useState(0);
  const [stats, setStats] = useState({ total: 0, newCount: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filters & Controls matching reference screenshot
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [search, setSearch] = useState('');
  const [pageSize, setPageSize] = useState(25);
  const [page, setPage] = useState(1);
  const [sortField, setSortField] = useState<'id' | 'name' | 'date' | 'status'>('id');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  // Modal detail view & deletion
  const [selectedItem, setSelectedItem] = useState<AnySubmission | null>(null);
  const [deletingItem, setDeletingItem] = useState<AnySubmission | null>(null);
  const [actionBusy, setActionBusy] = useState(false);

  const endpoint =
    type === 'career'
      ? '/admin/enquiries/career'
      : type === 'application'
        ? '/admin/enquiries/applications'
        : '/admin/enquiries/general';

  const title =
    type === 'career'
      ? 'Career'
      : type === 'application'
        ? 'Application'
        : 'Enquiries';

  const subtitle =
    type === 'career'
      ? 'Every submission made through the website career form, stored in the enquiries master table.'
      : type === 'application'
        ? 'Every submission made through the online admission application form, stored in the applications master table.'
        : 'Website contact and recruitment enquiries, stored in the enquiries master table.';

  const badgeLabel =
    type === 'career'
      ? `${stats.total} CAREER`
      : type === 'application'
        ? `${stats.total} APPLICATIONS`
        : `${stats.total} ENQUIRIES`;

  async function loadData() {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams();
      if (search.trim()) params.set('search', search.trim());
      if (fromDate) params.set('from', fromDate);
      if (toDate) params.set('to', toDate);
      params.set('page', String(page));
      params.set('limit', String(pageSize));
      params.set('sort', sortField);
      params.set('dir', sortDir);

      const res = await api<{ data: ResponseData<AnySubmission> }>(
        `${endpoint}?${params.toString()}`
      );
      if (res?.data) {
        setItems(res.data.items);
        setTotal(res.data.total);
        setStats(res.data.stats);
      }
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Could not load submissions');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadData();
  }, [type, fromDate, toDate, search, page, pageSize, sortField, sortDir]);

  function handleResetFilter() {
    setFromDate('');
    setToDate('');
    setSearch('');
    setPage(1);
  }

  async function handleStatusChange(item: AnySubmission, newStatus: string) {
    setActionBusy(true);
    try {
      const statusEndpoint =
        type === 'application'
          ? `/admin/applications/${item.id}/status`
          : `/admin/enquiries/${item.id}/status`;

      await api(statusEndpoint, {
        method: 'PATCH',
        body: JSON.stringify({ status: newStatus }),
      });

      setItems((prev) =>
        prev.map((it) => (it.id === item.id ? { ...it, status: newStatus } : it))
      );

      if (selectedItem && selectedItem.id === item.id) {
        setSelectedItem({ ...selectedItem, status: newStatus });
      }
    } catch (cause) {
      alert(cause instanceof Error ? cause.message : 'Status update failed');
    } finally {
      setActionBusy(false);
    }
  }

  async function handleDelete(item: AnySubmission) {
    setActionBusy(true);
    try {
      const deleteEndpoint =
        type === 'application'
          ? `/admin/applications/${item.id}`
          : `/admin/enquiries/${item.id}`;

      await api(deleteEndpoint, { method: 'DELETE' });

      setItems((prev) => prev.filter((it) => it.id !== item.id));
      setTotal((t) => Math.max(0, t - 1));
      setStats((s) => ({ ...s, total: Math.max(0, s.total - 1) }));
      setDeletingItem(null);
      if (selectedItem && selectedItem.id === item.id) setSelectedItem(null);
    } catch (cause) {
      alert(cause instanceof Error ? cause.message : 'Could not delete submission');
    } finally {
      setActionBusy(false);
    }
  }

  // Rows arrive already sorted across all pages by the API.
  const sortedItems = items;

  function toggleSort(field: 'id' | 'name' | 'date' | 'status') {
    if (sortField === field) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDir('asc');
    }
    setPage(1);
  }

  const sortIcon = (field: 'id' | 'name' | 'date' | 'status') => (
    <span className={sortField === field ? 'is-sorted' : undefined}>{sortField === field ? (sortDir === 'asc' ? '↑' : '↓') : '↕'}</span>
  );
  const ariaSort = (field: 'id' | 'name' | 'date' | 'status') => (sortField === field ? (sortDir === 'asc' ? 'ascending' : 'descending') : 'none');

  // --- Export Functions ---
  function exportCSV() {
    if (!items.length) {
      alert('No data available to export.');
      return;
    }
    const headers =
      type === 'career'
        ? ['#', 'Name', 'Email', 'Phone', 'Position', 'Designation', 'Resume URL', 'Submitted At', 'Status']
        : type === 'application'
          ? ['#', 'Name', 'Email', 'Phone', 'City', 'Country', 'Qualification', 'Entrance Exam', 'Submitted At', 'Status']
          : ['#', 'Name', 'Email', 'Phone', 'Organization', 'Designation', 'City', 'Message', 'Source', 'Submitted At', 'Status'];

    const rows = sortedItems.map((item) => {
      if (type === 'career') {
        const c = item as CareerItem;
        return [
          `#${c.id}`,
          `"${(c.name || '').replace(/"/g, '""')}"`,
          `"${c.email || ''}"`,
          `"${c.phone || ''}"`,
          `"${(c.position || '').replace(/"/g, '""')}"`,
          `"${(c.designation || '').replace(/"/g, '""')}"`,
          `"${c.resumeUrl || ''}"`,
          `"${new Date(c.submittedAt).toLocaleString()}"`,
          `"${c.status || ''}"`,
        ];
      } else if (type === 'application') {
        const a = item as ApplicationItem;
        return [
          `#${a.id}`,
          `"${(a.fullName || '').replace(/"/g, '""')}"`,
          `"${a.email || ''}"`,
          `"${a.phone || ''}"`,
          `"${a.city || ''}"`,
          `"${a.country || ''}"`,
          `"${(a.qualification || '').replace(/"/g, '""')}"`,
          `"${(a.examSummary || '').replace(/"/g, '""')}"`,
          `"${new Date(a.submittedAt).toLocaleString()}"`,
          `"${a.status || ''}"`,
        ];
      } else {
        const g = item as GeneralItem;
        return [
          `#${g.id}`,
          `"${(g.name || '').replace(/"/g, '""')}"`,
          `"${g.email || ''}"`,
          `"${g.phone || ''}"`,
          `"${(g.organization || '').replace(/"/g, '""')}"`,
          `"${(g.designation || '').replace(/"/g, '""')}"`,
          `"${g.city || ''}"`,
          `"${(g.message || '').replace(/"/g, '""')}"`,
          `"${g.source || ''}"`,
          `"${new Date(g.submittedAt).toLocaleString()}"`,
          `"${g.status || ''}"`,
        ];
      }
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${type}-enquiries-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  function exportExcel() {
    exportCSV();
  }

  function handlePrint() {
    window.print();
  }

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <div className={`cms-editor cms-enquiries-view cms-enquiries-view--${type}`}>
      {/* 1. Header with Title, Description, and Reference Rust Count Pill */}
      <header className="page-heading cms-enquiries-heading">
        <div>
          <h1 className="cms-enquiries-title">{title}</h1>
          <p className="page-description cms-enquiries-subtitle">{subtitle}</p>
        </div>
        <div className="cms-enquiries-top-badge">
          <Icon name={type === 'career' ? 'briefcase' : type === 'application' ? 'file' : 'mail'} size={18} />
          <span>{badgeLabel}</span>
        </div>
      </header>

      {error && (
        <div className="cms-error cms-top-error" role="alert">
          {error}
          <button type="button" onClick={() => void loadData()} className="cms-btn-reload">
            Retry
          </button>
        </div>
      )}

      {/* 2. Filter Card: FROM DATE, TO DATE, Reset Button + Export Actions */}
      <div className="cms-filter-card">
        <div className="cms-date-filters">
          <label className="cms-date-filter-group">
            <span className="cms-date-label">FROM DATE</span>
            <div className="cms-date-input-wrap">
              <input
                type="date"
                value={fromDate}
                onChange={(e) => {
                  setFromDate(e.target.value);
                  setPage(1);
                }}
                className="cms-date-input"
              />
            </div>
          </label>

          <label className="cms-date-filter-group">
            <span className="cms-date-label">TO DATE</span>
            <div className="cms-date-input-wrap">
              <input
                type="date"
                value={toDate}
                onChange={(e) => {
                  setToDate(e.target.value);
                  setPage(1);
                }}
                className="cms-date-input"
              />
            </div>
          </label>

          {(fromDate || toDate) && (
            <button
              type="button"
              className="cms-filter-reset-btn"
              onClick={handleResetFilter}
              title="Reset date filter"
              aria-label="Reset date filter"
            >
              <Icon name="rotateCcw" size={15} />
            </button>
          )}
        </div>

        <div className="cms-export-actions">
          <button
            type="button"
            className="cms-export-btn cms-export-btn--excel"
            onClick={exportExcel}
            title="Export to Excel spreadsheet"
          >
            <Icon name="download" size={14} />
            <span>Excel</span>
          </button>
          <button
            type="button"
            className="cms-export-btn cms-export-btn--csv"
            onClick={exportCSV}
            title="Export to CSV text file"
          >
            <Icon name="fileText" size={14} />
            <span>CSV</span>
          </button>
          <button
            type="button"
            className="cms-export-btn cms-export-btn--print"
            onClick={handlePrint}
            title="Print or save as PDF"
          >
            <Icon name="print" size={14} />
            <span>Print / PDF</span>
          </button>
        </div>
      </div>

      {/* 3. Table Controls: Show Entries Dropdown & Search Input */}
      <div className="cms-table-controls-bar">
        <div className="cms-entries-select-wrap">
          <span>Show</span>
          <select
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setPage(1);
            }}
            className="cms-entries-select"
            aria-label="Entries per page"
          >
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
          <span>entries</span>
        </div>

        <div className="cms-search-input-wrap">
          <label htmlFor="enquiries-search" className="cms-search-label">
            Search:
          </label>
          <input
            id="enquiries-search"
            type="search"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Name, email, phone, details…"
            className="cms-search-input"
          />
        </div>
      </div>

      {/* 4. Submissions Data Table */}
      <div className="cms-table-card">
        <div className="cms-table-overflow">
          <table className="cms-slides-table cms-enquiries-table">
            <thead>
              <tr>
                <th scope="col" aria-sort={ariaSort('id')}>
                  <button type="button" onClick={() => toggleSort('id')}>
                    # {sortIcon('id')}
                  </button>
                </th>
                <th scope="col" aria-sort={ariaSort('name')}>
                  <button type="button" onClick={() => toggleSort('name')}>
                    NAME {sortIcon('name')}
                  </button>
                </th>

                {type === 'career' ? (
                  <>
                    <th scope="col">POSITION</th>
                    <th scope="col">DESIGNATION</th>
                  </>
                ) : type === 'application' ? (
                  <>
                    <th scope="col">QUALIFICATION</th>
                    <th scope="col">ENTRANCE EXAM</th>
                  </>
                ) : (
                  <>
                    <th scope="col">ORGANIZATION</th>
                    <th scope="col">DESIGNATION</th>
                    <th scope="col">CITY</th>
                    <th scope="col">MESSAGE</th>
                  </>
                )}

                <th scope="col">EMAIL</th>
                <th scope="col">PHONE</th>

                {type === 'career' && (
                  <th scope="col">RESUME</th>
                )}

                <th scope="col" aria-sort={ariaSort('date')}>
                  <button type="button" onClick={() => toggleSort('date')}>
                    DATE {sortIcon('date')}
                  </button>
                </th>
                <th scope="col" aria-sort={ariaSort('status')}>
                  <button type="button" onClick={() => toggleSort('status')}>
                    STATUS {sortIcon('status')}
                  </button>
                </th>
                <th scope="col">ACTION</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={type === 'career' ? 10 : type === 'enquiry' ? 11 : 9} className="cms-table-empty">
                    <span className="button-spinner" /> Loading submissions…
                  </td>
                </tr>
              ) : sortedItems.length === 0 ? (
                <tr>
                  <td colSpan={type === 'career' ? 10 : type === 'enquiry' ? 11 : 9} className="cms-table-empty">
                    No submissions found.
                  </td>
                </tr>
              ) : (
                sortedItems.map((item) => {
                  const career = type === 'career' ? (item as CareerItem) : null;
                  const app = type === 'application' ? (item as ApplicationItem) : null;
                  const gen = type === 'enquiry' ? (item as GeneralItem) : null;
                  const displayName = 'fullName' in item ? item.fullName : item.name;

                  return (
                    <tr key={item.id} className="cms-enquiry-row">
                      <td className="cms-enquiry-id">#{item.id}</td>
                      <td>
                        <strong className="cms-enquiry-name">{displayName}</strong>
                      </td>

                      {career && (
                        <>
                          <td>{career.position}</td>
                          <td>{career.designation}</td>
                        </>
                      )}

                      {app && (
                        <>
                          <td>{app.qualification}</td>
                          <td>{app.examSummary}</td>
                        </>
                      )}

                      {gen && (
                        <>
                          <td>{gen.organization || '—'}</td>
                          <td>{gen.designation || '—'}</td>
                          <td>{gen.city || '—'}</td>
                          <td className="cms-truncate-cell" title={gen.message ?? ''}>
                            {gen.message || '—'}
                          </td>
                        </>
                      )}

                      <td>
                        {item.email ? (
                          <a href={`mailto:${item.email}`} className="cms-email-link">
                            {item.email}
                          </a>
                        ) : (
                          '—'
                        )}
                      </td>
                      <td>
                        {item.phone ? (
                          <a href={`tel:${item.phone}`} className="cms-phone-link">
                            {item.phone}
                          </a>
                        ) : (
                          '—'
                        )}
                      </td>

                      {career && (
                        <td>
                          {career.resumeUrl ? (
                            <a
                              href={publicAssetUrl(career.resumeUrl)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="cms-resume-link"
                              title={`Download ${career.resumeName || 'Resume'}`}
                            >
                              <Icon name="file" size={14} /> Resume
                            </a>
                          ) : (
                            '—'
                          )}
                        </td>
                      )}

                      <td className="cms-date-cell">
                        {new Date(item.submittedAt).toLocaleDateString('en-IN', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </td>

                      <td>
                        <span className={`cms-status-pill cms-status-pill--${(item.status || 'NEW').toLowerCase()}`}>
                          {item.status || 'NEW'}
                        </span>
                      </td>

                      <td>
                        <div className="cms-row-actions">
                          <button
                            type="button"
                            className="cms-edit-action"
                            onClick={() => setSelectedItem(item)}
                            title="View full submission details"
                            aria-label={`View submission #${item.id}`}
                          >
                            <Icon name="eye" size={17} />
                          </button>
                          <button
                            type="button"
                            className="cms-delete-action"
                            disabled={!canEdit || actionBusy}
                            onClick={() => setDeletingItem(item)}
                            title="Delete submission"
                            aria-label={`Delete submission #${item.id}`}
                          >
                            <Icon name="trash" size={17} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* 5. Pagination Footer */}
        <footer className="cms-table-footer">
          <span>
            Showing {total > 0 ? (page - 1) * pageSize + 1 : 0} to {Math.min(page * pageSize, total)} of {total} entries
            {search && ` (filtered from ${stats.total} total)`}
          </span>
          <nav aria-label="Pagination" className="cms-pagination-nav">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              Previous
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).slice(0, 7).map((p) => (
              <button
                key={p}
                type="button"
                aria-current={p === page ? 'page' : undefined}
                onClick={() => setPage(p)}
              >
                {p}
              </button>
            ))}
            <button
              type="button"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            >
              Next
            </button>
          </nav>
        </footer>
      </div>

      {/* 6. Details Modal Dialog */}
      {selectedItem && (
        <div className="cms-modal-backdrop" onClick={() => setSelectedItem(null)}>
          <div
            className="cms-modal-card"
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="cms-modal-header">
              <div>
                <span className="cms-modal-tag">Submission #{selectedItem.id}</span>
                <h2 id="modal-title" className="cms-modal-heading">
                  {'fullName' in selectedItem ? selectedItem.fullName : selectedItem.name}
                </h2>
              </div>
              <button
                type="button"
                className="cms-modal-close-btn"
                onClick={() => setSelectedItem(null)}
                aria-label="Close dialog"
              >
                <Icon name="x" size={18} />
              </button>
            </div>

            <div className="cms-modal-body">
              {/* Quick Status Bar */}
              <div className="cms-modal-status-bar">
                <span className="cms-modal-status-label">Current Status:</span>
                <select
                  value={selectedItem.status || 'NEW'}
                  disabled={!canEdit || actionBusy}
                  onChange={(e) => void handleStatusChange(selectedItem, e.target.value)}
                  className="cms-modal-status-select"
                >
                  {type === 'application' ? (
                    <>
                      <option value="SUBMITTED">SUBMITTED</option>
                      <option value="REVIEWED">REVIEWED</option>
                      <option value="ACCEPTED">ACCEPTED</option>
                      <option value="REJECTED">REJECTED</option>
                    </>
                  ) : (
                    <>
                      <option value="NEW">NEW</option>
                      <option value="IN_PROGRESS">IN PROGRESS</option>
                      <option value="RESOLVED">RESOLVED</option>
                      <option value="SPAM">SPAM</option>
                    </>
                  )}
                </select>
                <span className="cms-modal-date">
                  Submitted: {new Date(selectedItem.submittedAt).toLocaleString()}
                </span>
              </div>

              {/* Career Specific Details */}
              {'position' in selectedItem && (
                <div className="cms-detail-grid">
                  <div className="cms-detail-item">
                    <label>Position Applied</label>
                    <p>{selectedItem.position}</p>
                  </div>
                  <div className="cms-detail-item">
                    <label>Current Designation</label>
                    <p>{selectedItem.designation}</p>
                  </div>
                  <div className="cms-detail-item">
                    <label>Email Address</label>
                    <p>
                      <a href={`mailto:${selectedItem.email}`}>{selectedItem.email}</a>
                    </p>
                  </div>
                  <div className="cms-detail-item">
                    <label>Phone Number</label>
                    <p>
                      <a href={`tel:${selectedItem.phone}`}>{selectedItem.phone}</a>
                    </p>
                  </div>
                  <div className="cms-detail-item cms-detail-item--full">
                    <label>Resume / CV</label>
                    {selectedItem.resumeUrl ? (
                      <div className="cms-resume-download-box">
                        <Icon name="file" size={24} />
                        <div>
                          <strong>{selectedItem.resumeName || 'Resume Document'}</strong>
                          <p>Uploaded candidate curriculum vitae</p>
                        </div>
                        <a
                          href={publicAssetUrl(selectedItem.resumeUrl)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="cms-primary cms-btn-download-resume"
                        >
                          <Icon name="download" size={16} /> View / Download Resume
                        </a>
                      </div>
                    ) : (
                      <p>No resume uploaded.</p>
                    )}
                  </div>
                </div>
              )}

              {/* General Enquiry Specific Details */}
              {'city' in selectedItem && !('education' in selectedItem) && !('position' in selectedItem) && (
                <div className="cms-detail-grid">
                  <div className="cms-detail-item">
                    <label>Name</label>
                    <p>{selectedItem.name}</p>
                  </div>
                  <div className="cms-detail-item">
                    <label>City</label>
                    <p>{selectedItem.city || '—'}</p>
                  </div>
                  <div className="cms-detail-item">
                    <label>Organization</label>
                    <p>{selectedItem.organization || '—'}</p>
                  </div>
                  <div className="cms-detail-item">
                    <label>Designation</label>
                    <p>{selectedItem.designation || '—'}</p>
                  </div>
                  <div className="cms-detail-item">
                    <label>Email Address</label>
                    <p>
                      <a href={`mailto:${selectedItem.email}`}>{selectedItem.email || '—'}</a>
                    </p>
                  </div>
                  <div className="cms-detail-item">
                    <label>Phone Number</label>
                    <p>
                      <a href={`tel:${selectedItem.phone}`}>{selectedItem.phone}</a>
                    </p>
                  </div>
                  <div className="cms-detail-item cms-detail-item--full">
                    <label>Source / Campaign</label>
                    <p>{selectedItem.source || 'website-enquire-now'}</p>
                  </div>
                  <div className="cms-detail-item cms-detail-item--full">
                    <label>Enquiry Message</label>
                    <p className="cms-message-box">{selectedItem.message || 'No additional message provided.'}</p>
                  </div>
                </div>
              )}

              {/* Application Specific Multi-Section Details */}
              {'education' in selectedItem && (
                <div className="cms-application-details">
                  <section className="cms-app-section">
                    <h3>Applicant Personal Details</h3>
                    <div className="cms-detail-grid">
                      <div className="cms-detail-item">
                        <label>Full Name</label>
                        <p>{selectedItem.fullName}</p>
                      </div>
                      <div className="cms-detail-item">
                        <label>Date of Birth</label>
                        <p>{selectedItem.dateOfBirth || '—'}</p>
                      </div>
                      <div className="cms-detail-item">
                        <label>Email</label>
                        <p><a href={`mailto:${selectedItem.email}`}>{selectedItem.email}</a></p>
                      </div>
                      <div className="cms-detail-item">
                        <label>Phone</label>
                        <p><a href={`tel:${selectedItem.phone}`}>{selectedItem.phone}</a></p>
                      </div>
                      <div className="cms-detail-item">
                        <label>Parent Phone</label>
                        <p>{selectedItem.parentPhone || '—'}</p>
                      </div>
                      <div className="cms-detail-item">
                        <label>Nationality</label>
                        <p>{selectedItem.nationality || '—'}</p>
                      </div>
                      <div className="cms-detail-item">
                        <label>Gender</label>
                        <p>{selectedItem.gender || '—'}</p>
                      </div>
                      <div className="cms-detail-item">
                        <label>Family Annual Income</label>
                        <p>{selectedItem.familyAnnualIncome || '—'}</p>
                      </div>
                    </div>
                  </section>

                  <section className="cms-app-section">
                    <h3>Applicant Address & Demographics</h3>
                    <div className="cms-detail-grid">
                      <div className="cms-detail-item cms-detail-item--full">
                        <label>Full Address / Notes</label>
                        <p style={{ whiteSpace: 'pre-wrap' }}>{selectedItem.address || '—'}</p>
                      </div>
                      <div className="cms-detail-item">
                        <label>City</label>
                        <p>{selectedItem.city || '—'}</p>
                      </div>
                      <div className="cms-detail-item">
                        <label>Pin Code</label>
                        <p>{selectedItem.postalCode || '—'}</p>
                      </div>
                      <div className="cms-detail-item">
                        <label>Country</label>
                        <p>{selectedItem.country || 'India'}</p>
                      </div>
                      <div className="cms-detail-item">
                        <label>How They Heard About VSM</label>
                        <p>{selectedItem.referral || '—'}{selectedItem.referralOther ? ` (${selectedItem.referralOther})` : ''}</p>
                      </div>
                      <div className="cms-detail-item">
                        <label>Terms &amp; Privacy Consent</label>
                        <p>{selectedItem.consent ? 'Accepted' : 'Not accepted'}</p>
                      </div>
                    </div>
                  </section>

                  {selectedItem.education?.length > 0 && (
                    <section className="cms-app-section">
                      <h3>Educational Qualifications</h3>
                      <table className="cms-mini-table">
                        <thead>
                          <tr>
                            <th>Stage</th>
                            <th>School / College / University</th>
                            <th>Board</th>
                            <th>Stream</th>
                            <th>Year</th>
                            <th>Result %</th>
                          </tr>
                        </thead>
                        <tbody>
                          {selectedItem.education.map((edu, idx) => (
                            <tr key={idx}>
                              <td><strong>{edu.stage}</strong></td>
                              <td>{edu.institution || '—'}</td>
                              <td>{edu.board || '—'}</td>
                              <td>{edu.stream || '—'}</td>
                              <td>{edu.passingYear || '—'}</td>
                              <td>{edu.resultPercent ? `${edu.resultPercent}%` : '—'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </section>
                  )}

                  {selectedItem.examScores?.length > 0 && (
                    <section className="cms-app-section">
                      <h3>Entrance Exam Scores</h3>
                      <table className="cms-mini-table">
                        <thead>
                          <tr>
                            <th>Exam Code</th>
                            <th>Score</th>
                            <th>Rank</th>
                            <th>Session</th>
                          </tr>
                        </thead>
                        <tbody>
                          {selectedItem.examScores.map((score, idx) => (
                            <tr key={idx}>
                              <td><strong>{score.examCode}</strong></td>
                              <td>{score.score ?? '—'}</td>
                              <td>{score.rank ?? '—'}</td>
                              <td>{score.session || '—'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </section>
                  )}
                </div>
              )}
            </div>

            <div className="cms-modal-footer">
              <button
                type="button"
                className="cms-secondary"
                onClick={() => setSelectedItem(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 7. Deletion Confirmation Dialog */}
      {deletingItem && (
        <div className="cms-modal-backdrop" onClick={() => setDeletingItem(null)}>
          <div
            className="cms-modal-card cms-delete-dialog-card"
            role="alertdialog"
            onClick={(e) => e.stopPropagation()}
          >
            <h2>Delete submission #{deletingItem.id}?</h2>
            <p>
              Are you sure you want to permanently delete the submission from{' '}
              <strong>{'fullName' in deletingItem ? deletingItem.fullName : deletingItem.name}</strong>?
            </p>
            <div className="cms-save-bar" style={{ marginTop: '20px' }}>
              <button
                type="button"
                className="cms-danger"
                disabled={actionBusy}
                onClick={() => void handleDelete(deletingItem)}
              >
                {actionBusy ? 'Deleting…' : 'Delete permanently'}
              </button>
              <button
                type="button"
                className="cms-secondary"
                disabled={actionBusy}
                onClick={() => setDeletingItem(null)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
