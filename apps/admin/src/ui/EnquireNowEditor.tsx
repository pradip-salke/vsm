import { useEffect, useState, type FormEvent } from 'react';
import { api } from '../lib/api';
import type { HomeContent } from '@vsmedu/contracts/home';
import './home-editor.css';

type EnquiryContent = HomeContent['enquiry'];

type PhoneItem = { label: string; href: string };

export function EnquireNowEditor({ canEdit }: { canEdit: boolean }) {
  const [document, setDocument] = useState<{ content: EnquiryContent; updatedAt: string | null } | null>(null);
  const [dirty, setDirty] = useState(false);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  async function load() {
    setLoading(true);
    setError('');
    try {
      const res = await api<{ data: { enquiry: { content: EnquiryContent; updatedAt: string | null } } }>('/admin/settings/global');
      if (res?.data?.enquiry) {
        setDocument(res.data.enquiry);
      } else {
        throw new Error('Invalid enquiry settings response');
      }
      setDirty(false);
    } catch {
      try {
        const fallbackRes = await api<{ data: { content: EnquiryContent; updatedAt: string | null } }>('/admin/home/enquiry');
        setDocument(fallbackRes.data);
        setDirty(false);
      } catch (cause) {
        setError(cause instanceof Error ? cause.message : 'Could not load enquire now settings');
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  useEffect(() => {
    if (!dirty) return;
    const warn = (event: BeforeUnloadEvent) => {
      event.preventDefault();
    };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [dirty]);

  // Individual field setters (no add/remove/push/delete)
  function setField<K extends keyof EnquiryContent>(key: K, value: EnquiryContent[K]) {
    if (!document) return;
    const next = { ...document.content, [key]: value };
    setDocument({ ...document, content: next });
    setDirty(true);
    setMessage('');
  }

  function setPhoneField(index: number, field: 'label' | 'href', value: string) {
    if (!document) return;
    const phones = [...(document.content.phones ?? [])] as PhoneItem[];
    if (!phones[index]) return;
    phones[index] = { ...phones[index], [field]: value };
    setField('phones', phones);
  }

  function setTimeField(index: number, value: string) {
    if (!document) return;
    const times = [...(document.content.openTime ?? [])] as string[];
    times[index] = value;
    setField('openTime', times);
  }

  async function handleSave(event: FormEvent) {
    event.preventDefault();
    if (!document) return;
    setBusy(true);
    setMessage('');
    setError('');

    try {
      const res = await api<{ data: { enquiry: { content: EnquiryContent; updatedAt: string | null } } }>('/admin/settings/global', {
        method: 'PATCH',
        body: JSON.stringify({
          enquiry: {
            content: document.content,
            updatedAt: document.updatedAt,
          },
        }),
      });

      setDocument(res.data.enquiry);
      setDirty(false);
      setMessage('✓ Enquire Now settings updated successfully! Changes reflect across all website pages.');
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Could not save enquire now settings');
    } finally {
      setBusy(false);
    }
  }

  function handleDiscard() {
    if (window.confirm('Discard unsaved enquire now changes?')) {
      void load();
    }
  }

  const readOnly = !canEdit || busy;
  const content = document?.content;

  if (!content) {
    return (
      <div className="cms-editor cms-enquire-now-editor">
        {loading ? (
          <div className="cms-loading-card"><span className="button-spinner" /><p>Loading enquire now settings…</p></div>
        ) : (
          <div className="cms-error" role="alert">
            Enquire now settings could not be retrieved.{' '}
            <button type="button" onClick={() => void load()}>Try again</button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="cms-editor cms-enquire-now-editor">
      <header className="page-heading">
        <div>
          <nav className="cms-breadcrumbs" aria-label="Breadcrumb">
            <span>Settings</span>
            <span className="cms-breadcrumb-sep">/</span>
            <span className="cms-breadcrumb-current">Enquire Now</span>
          </nav>
          <h1>Enquire Now</h1>
          <p className="page-description">
            Global Enquire Now section — heading, eyebrow, contact details, campus address, opening hours, phone numbers,
            and social links. Rendered consistently on every page layout.
          </p>
        </div>
        <div className="cms-heading-actions">
          <a
            href={`${import.meta.env.VITE_WEB_BASE_URL ?? 'http://localhost:3000'}/#enquire-now`}
            target="_blank"
            rel="noopener noreferrer"
            className="cms-secondary"
          >
            Preview on Website ↗
          </a>
        </div>
      </header>

      {error && (
        <div className="cms-error cms-top-error" role="alert">
          {error}
          <button type="button" onClick={() => void load()} className="cms-btn-reload">
            Reload saved settings
          </button>
        </div>
      )}

      <form onSubmit={handleSave} className="cms-global-form">
        <section className="cms-section-card" aria-labelledby="enquire-now-heading">
          <div className="cms-section-card-header">
            <div className="cms-section-card-title-group">
              <div>
                <h2 id="enquire-now-heading" className="cms-section-card-heading">
                  Enquire Now Section
                </h2>
                <p className="cms-section-card-subheading">
                  Edit all Enquire Now fields in one place. Changes apply across every page that shows this section.
                </p>
              </div>
            </div>
            <div className="cms-section-card-header-actions">
              {dirty && <span className="cms-dirty-pill">Unsaved edits</span>}
              <span className="cms-section-pill">Global Component: #enquire-now</span>
            </div>
          </div>

          <div className="cms-section-card-body">
            {/* Section heading & eyebrow */}
            <div className="cms-enquire-fields">
              <div className="cms-enquire-field-row">
                <div className="cms-enquire-field">
                  <label className="cms-enquire-field-label">Section Heading <span className="cms-required">*</span></label>
                  <input
                    className="cms-enquire-input"
                    value={content.title ?? ''}
                    disabled={readOnly}
                    onChange={(e) => setField('title', e.target.value)}
                    placeholder="e.g. Enquire Now"
                  />
                </div>
                <div className="cms-enquire-field">
                  <label className="cms-enquire-field-label">Eyebrow</label>
                  <input
                    className="cms-enquire-input"
                    value={content.eyebrow ?? ''}
                    disabled={readOnly}
                    onChange={(e) => setField('eyebrow', e.target.value)}
                    placeholder="e.g. Download Now"
                  />
                </div>
              </div>

              {/* Labels */}
              <div className="cms-enquire-field-row">
                <div className="cms-enquire-field">
                  <label className="cms-enquire-field-label">Address Label</label>
                  <input
                    className="cms-enquire-input"
                    value={content.addressLabel ?? ''}
                    disabled={readOnly}
                    onChange={(e) => setField('addressLabel', e.target.value)}
                    placeholder="e.g. Address"
                  />
                </div>
                <div className="cms-enquire-field">
                  <label className="cms-enquire-field-label">Contact Label</label>
                  <input
                    className="cms-enquire-input"
                    value={content.contactLabel ?? ''}
                    disabled={readOnly}
                    onChange={(e) => setField('contactLabel', e.target.value)}
                    placeholder="e.g. Contact"
                  />
                </div>
                <div className="cms-enquire-field">
                  <label className="cms-enquire-field-label">Open Time Label</label>
                  <input
                    className="cms-enquire-input"
                    value={content.openTimeLabel ?? ''}
                    disabled={readOnly}
                    onChange={(e) => setField('openTimeLabel', e.target.value)}
                    placeholder="e.g. Open Time"
                  />
                </div>
                <div className="cms-enquire-field">
                  <label className="cms-enquire-field-label">Social Label</label>
                  <input
                    className="cms-enquire-input"
                    value={content.socialLabel ?? ''}
                    disabled={readOnly}
                    onChange={(e) => setField('socialLabel', e.target.value)}
                    placeholder="e.g. Stay Connected"
                  />
                </div>
              </div>

              {/* Address */}
              <div className="cms-enquire-field-row">
                <div className="cms-enquire-field cms-enquire-field-full">
                  <label className="cms-enquire-field-label">Location Name</label>
                  <input
                    className="cms-enquire-input"
                    value={content.addressTitle ?? ''}
                    disabled={readOnly}
                    onChange={(e) => setField('addressTitle', e.target.value)}
                    placeholder="e.g. Valia School of Management"
                  />
                </div>
              </div>
              <div className="cms-enquire-field-row">
                <div className="cms-enquire-field cms-enquire-field-full">
                  <label className="cms-enquire-field-label">Full Postal Address</label>
                  <textarea
                    className="cms-enquire-textarea"
                    rows={3}
                    value={content.address ?? ''}
                    disabled={readOnly}
                    onChange={(e) => setField('address', e.target.value)}
                    placeholder="Enter full campus address…"
                  />
                </div>
              </div>

              {/* Phones */}
              <div className="cms-enquire-field-row">
                <div className="cms-enquire-field cms-enquire-field-full">
                  <label className="cms-enquire-field-label">Phone Numbers</label>
                  <div className="cms-enquire-phones">
                    {(content.phones ?? []).map((phone, index) => (
                      <div key={index} className="cms-enquire-phone-item">
                        <input
                          className="cms-enquire-input cms-enquire-phone-label"
                          value={phone.label ?? ''}
                          disabled={readOnly}
                          onChange={(e) => setPhoneField(index, 'label', e.target.value)}
                          placeholder="e.g. 73043 43478"
                        />
                        <input
                          className="cms-enquire-input cms-enquire-phone-href"
                          value={phone.href ?? ''}
                          disabled={readOnly}
                          onChange={(e) => setPhoneField(index, 'href', e.target.value)}
                          placeholder="tel:+91…"
                        />
                      </div>
                    ))}
                  </div>
                  <p className="cms-enquire-hint">Edit existing phone numbers only. Add/remove is not available here.</p>
                </div>
              </div>

              {/* Opening hours */}
              <div className="cms-enquire-field-row">
                <div className="cms-enquire-field cms-enquire-field-full">
                  <label className="cms-enquire-field-label">Opening Hours</label>
                  <div className="cms-enquire-times">
                    {(content.openTime ?? []).map((time, index) => (
                      <div key={index} className="cms-enquire-time-item">
                        <input
                          className="cms-enquire-input cms-enquire-time-input"
                          value={time ?? ''}
                          disabled={readOnly}
                          onChange={(e) => setTimeField(index, e.target.value)}
                          placeholder="e.g. 10:00 AM – 06:00 PM"
                        />
                      </div>
                    ))}
                  </div>
                  <p className="cms-enquire-hint">Edit existing opening hours only. Add/remove is not available here.</p>
                </div>
              </div>

              <div className="cms-enquire-field-row">
                <div className="cms-enquire-field cms-enquire-field-full">
                  <label className="cms-enquire-field-label">Note</label>
                  <p className="cms-enquire-note">
                    The enquiry form itself (name, email, phone, city, captcha, consent) is part of the frontend form component
                    and is not editable from the CMS. Only the section labels, contact card details, and opening hours shown
                    alongside it can be updated here.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Single Update button */}
        <div className="cms-bulk-save-bar">
          <div className="cms-save-status">
            {dirty ? (
              <span className="cms-status-dirty">● Unsaved changes in Enquire Now settings</span>
            ) : (
              <span className="cms-status-clean">✓ Enquire Now settings up to date</span>
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
            {dirty && (
              <button
                type="button"
                className="cms-secondary"
                disabled={busy}
                onClick={handleDiscard}
              >
                Discard changes
              </button>
            )}
            <button
              type="submit"
              className="cms-primary cms-btn-update-home"
              disabled={!canEdit || !dirty || busy}
            >
              {busy ? (
                <>
                  <span className="button-spinner" /> Saving Enquire Now…
                </>
              ) : (
                '✓ Update Enquire Now'
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
