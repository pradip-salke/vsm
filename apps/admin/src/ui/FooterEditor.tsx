import { useEffect, useState, type FormEvent } from 'react';
import { api } from '../lib/api';
import { Icon } from './Icon';
import type { FooterContent, FooterLink, FooterPhone } from '@vsmedu/contracts/footer';
import './footer-editor.css';

export function FooterEditor({ canEdit }: { canEdit: boolean }) {
  const [document, setDocument] = useState<{ content: FooterContent; updatedAt: string | null } | null>(null);
  const [dirty, setDirty] = useState(false);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  async function load() {
    setLoading(true);
    setError('');
    try {
      const res = await api<{ data: { content: FooterContent; updatedAt: string | null } }>('/admin/settings/footer');
      if (res?.data?.content) {
        setDocument(res.data);
      } else {
        throw new Error('Invalid footer response format');
      }
      setDirty(false);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Could not load footer settings');
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

  function updateContent(updater: (prev: FooterContent) => FooterContent) {
    if (!document) return;
    setDocument((curr) => (curr ? { ...curr, content: updater(curr.content) } : null));
    setDirty(true);
    setMessage('');
  }

  // --- Sub-section Helpers ---
  function setAboutField(field: 'logoUrl' | 'description', value: string) {
    updateContent((prev) => ({
      ...prev,
      about: { ...prev.about, [field]: value },
    }));
  }

  // Specialisations
  function setSpecHeading(heading: string) {
    updateContent((prev) => ({
      ...prev,
      specialisations: { ...prev.specialisations, heading },
    }));
  }

  function setSpecLink(index: number, field: keyof FooterLink, value: string | boolean) {
    updateContent((prev) => {
      const links = [...prev.specialisations.links];
      if (links[index]) {
        links[index] = { ...links[index], [field]: value };
      }
      return { ...prev, specialisations: { ...prev.specialisations, links } };
    });
  }

  function addSpecLink() {
    updateContent((prev) => ({
      ...prev,
      specialisations: {
        ...prev.specialisations,
        links: [...prev.specialisations.links, { label: 'New Specialisation', href: '/our-academics/', openInNewTab: false }],
      },
    }));
  }

  function removeSpecLink(index: number) {
    updateContent((prev) => ({
      ...prev,
      specialisations: {
        ...prev.specialisations,
        links: prev.specialisations.links.filter((_, i) => i !== index),
      },
    }));
  }

  // About Us
  function setAboutUsHeading(heading: string) {
    updateContent((prev) => ({
      ...prev,
      aboutUs: { ...prev.aboutUs, heading },
    }));
  }

  function setAboutUsLink(index: number, field: keyof FooterLink, value: string | boolean) {
    updateContent((prev) => {
      const links = [...prev.aboutUs.links];
      if (links[index]) {
        links[index] = { ...links[index], [field]: value };
      }
      return { ...prev, aboutUs: { ...prev.aboutUs, links } };
    });
  }

  function addAboutUsLink() {
    updateContent((prev) => ({
      ...prev,
      aboutUs: {
        ...prev.aboutUs,
        links: [...prev.aboutUs.links, { label: 'New Link', href: '/about-us/', openInNewTab: false }],
      },
    }));
  }

  function removeAboutUsLink(index: number) {
    updateContent((prev) => ({
      ...prev,
      aboutUs: {
        ...prev.aboutUs,
        links: prev.aboutUs.links.filter((_, i) => i !== index),
      },
    }));
  }

  // Quick Links
  function setQuickLink(index: number, field: keyof FooterLink, value: string | boolean) {
    updateContent((prev) => {
      const quickLinks = [...prev.aboutUs.quickLinks];
      if (quickLinks[index]) {
        quickLinks[index] = { ...quickLinks[index], [field]: value };
      }
      return { ...prev, aboutUs: { ...prev.aboutUs, quickLinks } };
    });
  }

  function addQuickLink() {
    updateContent((prev) => ({
      ...prev,
      aboutUs: {
        ...prev.aboutUs,
        quickLinks: [...prev.aboutUs.quickLinks, { label: 'New Quick Link', href: '/', openInNewTab: false }],
      },
    }));
  }

  function removeQuickLink(index: number) {
    updateContent((prev) => ({
      ...prev,
      aboutUs: {
        ...prev.aboutUs,
        quickLinks: prev.aboutUs.quickLinks.filter((_, i) => i !== index),
      },
    }));
  }

  // Contacts
  function setContactField(field: 'heading' | 'email' | 'address', value: string) {
    updateContent((prev) => ({
      ...prev,
      contacts: { ...prev.contacts, [field]: value },
    }));
  }

  function setPhone(index: number, field: keyof FooterPhone, value: string) {
    updateContent((prev) => {
      const phones = [...prev.contacts.phones];
      if (phones[index]) {
        phones[index] = { ...phones[index], [field]: value };
      }
      return { ...prev, contacts: { ...prev.contacts, phones } };
    });
  }

  function addPhone() {
    updateContent((prev) => ({
      ...prev,
      contacts: {
        ...prev.contacts,
        phones: [...prev.contacts.phones, { label: '+91 00000 00000', href: 'tel:+910000000000' }],
      },
    }));
  }

  function removePhone(index: number) {
    updateContent((prev) => ({
      ...prev,
      contacts: {
        ...prev.contacts,
        phones: prev.contacts.phones.filter((_, i) => i !== index),
      },
    }));
  }

  // Social Links
  function setSocialLink(key: string, href: string) {
    updateContent((prev) => {
      const socials = [...(prev.socials ?? [])];
      const idx = socials.findIndex((s) => s.key === key);
      if (idx >= 0) {
        socials[idx] = { ...socials[idx], href };
      } else {
        socials.push({ key, label: key, href });
      }
      return { ...prev, socials };
    });
  }

  // Bottom Links
  function setBottomLink(index: number, field: keyof FooterLink, value: string | boolean) {
    updateContent((prev) => {
      const bottomLinks = [...prev.bottomLinks];
      if (bottomLinks[index]) {
        bottomLinks[index] = { ...bottomLinks[index], [field]: value };
      }
      return { ...prev, bottomLinks };
    });
  }

  function addBottomLink() {
    updateContent((prev) => ({
      ...prev,
      bottomLinks: [...prev.bottomLinks, { label: 'New Link', href: '/', openInNewTab: false }],
    }));
  }

  function removeBottomLink(index: number) {
    updateContent((prev) => ({
      ...prev,
      bottomLinks: prev.bottomLinks.filter((_, i) => i !== index),
    }));
  }

  // Copyright
  function setCopyright(copyright: string) {
    updateContent((prev) => ({ ...prev, copyright }));
  }

  async function handleSave(event: FormEvent) {
    event.preventDefault();
    if (!document) return;
    setBusy(true);
    setMessage('');
    setError('');

    try {
      const res = await api<{ data: { content: FooterContent; updatedAt: string } }>('/admin/settings/footer', {
        method: 'PATCH',
        body: JSON.stringify({
          content: document.content,
          updatedAt: document.updatedAt,
        }),
      });

      setDocument(res.data);
      setDirty(false);
      setMessage('✓ Footer content updated successfully! All changes saved to MySQL.');
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Could not save footer settings');
    } finally {
      setBusy(false);
    }
  }

  if (loading) {
    return (
      <div className="cms-footer-editor">
        <header className="page-heading">
          <div>
            <nav className="breadcrumbs" aria-label="Breadcrumb">
              <span>Settings</span>
              <span>/</span>
              <span className="breadcrumb-current">Footer</span>
            </nav>
            <h1 className="cms-footer-heading-title">Footer Content Management</h1>
          </div>
        </header>
        <div style={{ padding: '40px', textAlign: 'center', background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
          <span className="button-spinner" style={{ width: '24px', height: '24px', color: '#272e6d' }} />
          <p style={{ marginTop: '12px', color: '#64748b', fontSize: '13px' }}>Loading footer configuration…</p>
        </div>
      </div>
    );
  }

  if (!document) {
    return (
      <div className="cms-footer-editor">
        <div className="cms-footer-error">
          <span>{error || 'Failed to load footer settings.'}</span>
          <button type="button" onClick={() => void load()}>
            Retry
          </button>
        </div>
      </div>
    );
  }

  const { content } = document;
  const socialMap = new Map((content.socials ?? []).map((s) => [s.key, s.href || '']));

  return (
    <div className="cms-footer-editor">
      {/* Header */}
      <header className="page-heading">
        <div>
          <nav className="breadcrumbs" aria-label="Breadcrumb" style={{ marginBottom: '8px' }}>
            <span>Settings</span>
            <span>/</span>
            <span className="breadcrumb-current">Footer</span>
          </nav>
          <h1 className="cms-footer-heading-title">Footer Content Management</h1>
          <p className="cms-footer-heading-subtitle">
            Manage all website footer brand information, specialisation links, about us links, contacts, social channels, and bottom legal navigation.
          </p>
        </div>
        <div>
          {dirty ? (
            <span className="cms-footer-badge cms-footer-badge--dirty">● Unsaved Changes</span>
          ) : (
            <span className="cms-footer-badge cms-footer-badge--clean">✓ All Changes Saved</span>
          )}
        </div>
      </header>

      {/* Messages */}
      {message && (
        <div className="cms-footer-toast" role="status">
          <Icon name="check" size={16} />
          <span>{message}</span>
        </div>
      )}
      {error && (
        <div className="cms-footer-error" role="alert">
          <span>{error}</span>
          <button type="button" onClick={() => void load()}>
            Reload
          </button>
        </div>
      )}

      <form onSubmit={(e) => void handleSave(e)}>
        {/* 1. Brand & About Column */}
        <section className="cms-footer-card">
          <header className="cms-footer-card-header">
            <div>
              <h2 className="cms-footer-card-title">1. Brand & About Column</h2>
              <p className="cms-footer-card-subtitle">Introductory institute description displayed in the first footer column. Manage the shared website logo under Settings → Global Settings.</p>
            </div>
          </header>
          <div className="cms-footer-card-body">
            <div className="cms-footer-grid">
              <label className="cms-footer-field cms-footer-field--full">
                <span className="cms-footer-label">About Institute Summary Text</span>
                <textarea
                  className="cms-footer-textarea"
                  rows={3}
                  value={content.about.description}
                  disabled={!canEdit}
                  onChange={(e) => setAboutField('description', e.target.value)}
                  placeholder="Enter short about text for the footer…"
                />
              </label>
            </div>
          </div>
        </section>

        {/* 2. Specialisation Column */}
        <section className="cms-footer-card">
          <header className="cms-footer-card-header">
            <div>
              <h2 className="cms-footer-card-title">2. Specialisation Column</h2>
              <p className="cms-footer-card-subtitle">Academic specialisation course links displayed in the second footer column.</p>
            </div>
          </header>
          <div className="cms-footer-card-body">
            <div className="cms-footer-grid">
              <label className="cms-footer-field">
                <span className="cms-footer-label">Column Heading</span>
                <input
                  type="text"
                  className="cms-footer-input"
                  value={content.specialisations.heading}
                  disabled={!canEdit}
                  onChange={(e) => setSpecHeading(e.target.value)}
                  placeholder="Specialisation"
                />
              </label>
            </div>

            <div className="cms-footer-repeater">
              <div className="cms-footer-repeater-headings cms-footer-repeater-headings--no-tab">
                <span>Course Label</span>
                <span>Target Page URL</span>
                <span>Action</span>
              </div>
              {content.specialisations.links.map((link, idx) => (
                <div key={idx} className="cms-footer-row cms-footer-row--no-tab">
                  <input
                    type="text"
                    className="cms-footer-input"
                    placeholder="Link Label (e.g. Finance)"
                    value={link.label}
                    disabled={!canEdit}
                    onChange={(e) => setSpecLink(idx, 'label', e.target.value)}
                  />
                  <input
                    type="text"
                    className="cms-footer-input"
                    placeholder="Link URL (e.g. /our-academics/...)"
                    value={link.href}
                    disabled={!canEdit}
                    onChange={(e) => setSpecLink(idx, 'href', e.target.value)}
                  />
                  <button
                    type="button"
                    className="cms-footer-trash-btn"
                    disabled={!canEdit}
                    onClick={() => removeSpecLink(idx)}
                    title="Delete link"
                    aria-label={`Delete specialisation link ${link.label}`}
                  >
                    <Icon name="trash" size={16} />
                  </button>
                </div>
              ))}
              <div>
                <button
                  type="button"
                  className="cms-footer-add-btn"
                  disabled={!canEdit}
                  onClick={addSpecLink}
                >
                  <Icon name="plus" size={15} /> Add Specialisation Link
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* 3. About Us & Quick Links Column */}
        <section className="cms-footer-card">
          <header className="cms-footer-card-header">
            <div>
              <h2 className="cms-footer-card-title">3. About Us Column</h2>
              <p className="cms-footer-card-subtitle">Institutional links and secondary quick links (Career, Blogs) shown in the third column.</p>
            </div>
          </header>
          <div className="cms-footer-card-body">
            <div className="cms-footer-grid">
              <label className="cms-footer-field">
                <span className="cms-footer-label">Column Heading</span>
                <input
                  type="text"
                  className="cms-footer-input"
                  value={content.aboutUs.heading}
                  disabled={!canEdit}
                  onChange={(e) => setAboutUsHeading(e.target.value)}
                  placeholder="About Us"
                />
              </label>
            </div>

            {/* Institutional Links */}
            <div>
              <h3 className="cms-footer-subheading">
                <span>Institutional Links</span>
                <span className="cms-footer-count-pill">{content.aboutUs.links.length}</span>
              </h3>
              <div className="cms-footer-repeater">
                <div className="cms-footer-repeater-headings">
                  <span>Display Label</span>
                  <span>Target URL / Document Link</span>
                  <span>Target</span>
                  <span>Action</span>
                </div>
                {content.aboutUs.links.map((link, idx) => (
                  <div key={idx} className="cms-footer-row">
                    <input
                      type="text"
                      className="cms-footer-input"
                      placeholder="Label (e.g. Director Message)"
                      value={link.label}
                      disabled={!canEdit}
                      onChange={(e) => setAboutUsLink(idx, 'label', e.target.value)}
                    />
                    <input
                      type="text"
                      className="cms-footer-input"
                      placeholder="URL (e.g. /about-us/... or .pdf)"
                      value={link.href}
                      disabled={!canEdit}
                      onChange={(e) => setAboutUsLink(idx, 'href', e.target.value)}
                    />
                    <label className="cms-footer-checkbox-label">
                      <input
                        type="checkbox"
                        checked={Boolean(link.openInNewTab)}
                        disabled={!canEdit}
                        onChange={(e) => setAboutUsLink(idx, 'openInNewTab', e.target.checked)}
                      />
                      <span>New tab</span>
                    </label>
                    <button
                      type="button"
                      className="cms-footer-trash-btn"
                      disabled={!canEdit}
                      onClick={() => removeAboutUsLink(idx)}
                      title="Delete link"
                      aria-label={`Delete about link ${link.label}`}
                    >
                      <Icon name="trash" size={16} />
                    </button>
                  </div>
                ))}
                <div>
                  <button
                    type="button"
                    className="cms-footer-add-btn"
                    disabled={!canEdit}
                    onClick={addAboutUsLink}
                  >
                    <Icon name="plus" size={15} /> Add Institutional Link
                  </button>
                </div>
              </div>
            </div>

            {/* Quick Links */}
            <div style={{ marginTop: '10px' }}>
              <h3 className="cms-footer-subheading">
                <span>Quick Links (Career & Blogs)</span>
                <span className="cms-footer-count-pill">{content.aboutUs.quickLinks.length}</span>
              </h3>
              <div className="cms-footer-repeater">
                <div className="cms-footer-repeater-headings cms-footer-repeater-headings--no-tab">
                  <span>Display Label</span>
                  <span>Target URL</span>
                  <span>Action</span>
                </div>
                {content.aboutUs.quickLinks.map((link, idx) => (
                  <div key={idx} className="cms-footer-row cms-footer-row--no-tab">
                    <input
                      type="text"
                      className="cms-footer-input"
                      placeholder="Label (e.g. Career)"
                      value={link.label}
                      disabled={!canEdit}
                      onChange={(e) => setQuickLink(idx, 'label', e.target.value)}
                    />
                    <input
                      type="text"
                      className="cms-footer-input"
                      placeholder="URL (e.g. /career/)"
                      value={link.href}
                      disabled={!canEdit}
                      onChange={(e) => setQuickLink(idx, 'href', e.target.value)}
                    />
                    <button
                      type="button"
                      className="cms-footer-trash-btn"
                      disabled={!canEdit}
                      onClick={() => removeQuickLink(idx)}
                      title="Delete link"
                      aria-label={`Delete quick link ${link.label}`}
                    >
                      <Icon name="trash" size={16} />
                    </button>
                  </div>
                ))}
                <div>
                  <button
                    type="button"
                    className="cms-footer-add-btn"
                    disabled={!canEdit}
                    onClick={addQuickLink}
                  >
                    <Icon name="plus" size={15} /> Add Quick Link
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 4. Contacts Column */}
        <section className="cms-footer-card">
          <header className="cms-footer-card-header">
            <div>
              <h2 className="cms-footer-card-title">4. Contacts Column</h2>
              <p className="cms-footer-card-subtitle">Official campus contact details shown in the fourth footer column.</p>
            </div>
          </header>
          <div className="cms-footer-card-body">
            <div className="cms-footer-grid">
              <label className="cms-footer-field">
                <span className="cms-footer-label">Column Heading</span>
                <input
                  type="text"
                  className="cms-footer-input"
                  value={content.contacts.heading}
                  disabled={!canEdit}
                  onChange={(e) => setContactField('heading', e.target.value)}
                  placeholder="Contacts"
                />
              </label>
              <label className="cms-footer-field">
                <span className="cms-footer-label">Official Email Address</span>
                <input
                  type="email"
                  className="cms-footer-input"
                  value={content.contacts.email}
                  disabled={!canEdit}
                  onChange={(e) => setContactField('email', e.target.value)}
                  placeholder="info@vsmedu.in"
                />
              </label>
            </div>

            {/* Repeatable Phones */}
            <div>
              <h3 className="cms-footer-subheading">
                <span>Phone Numbers</span>
                <span className="cms-footer-count-pill">{content.contacts.phones.length}</span>
              </h3>
              <div className="cms-footer-repeater">
                <div className="cms-footer-repeater-headings cms-footer-repeater-headings--no-tab">
                  <span>Display Phone Number</span>
                  <span>Dial URI (tel:...)</span>
                  <span>Action</span>
                </div>
                {content.contacts.phones.map((phone, idx) => (
                  <div key={idx} className="cms-footer-row cms-footer-row--no-tab">
                    <input
                      type="text"
                      className="cms-footer-input"
                      placeholder="Display Label (e.g. +91 730 434 3478)"
                      value={phone.label}
                      disabled={!canEdit}
                      onChange={(e) => setPhone(idx, 'label', e.target.value)}
                    />
                    <input
                      type="text"
                      className="cms-footer-input"
                      placeholder="Tel link (e.g. tel:+917304343478)"
                      value={phone.href}
                      disabled={!canEdit}
                      onChange={(e) => setPhone(idx, 'href', e.target.value)}
                    />
                    <button
                      type="button"
                      className="cms-footer-trash-btn"
                      disabled={!canEdit}
                      onClick={() => removePhone(idx)}
                      title="Delete phone"
                      aria-label={`Delete phone ${phone.label}`}
                    >
                      <Icon name="trash" size={16} />
                    </button>
                  </div>
                ))}
                <div>
                  <button
                    type="button"
                    className="cms-footer-add-btn"
                    disabled={!canEdit}
                    onClick={addPhone}
                  >
                    <Icon name="plus" size={15} /> Add Phone Number
                  </button>
                </div>
              </div>
            </div>

            <div className="cms-footer-grid">
              <label className="cms-footer-field cms-footer-field--full">
                <span className="cms-footer-label">Campus Physical Address</span>
                <textarea
                  className="cms-footer-textarea"
                  rows={3}
                  value={content.contacts.address}
                  disabled={!canEdit}
                  onChange={(e) => setContactField('address', e.target.value)}
                  placeholder="5th Floor, Valia College Building, Cosmopolitan Education Society Road…"
                />
              </label>
            </div>
          </div>
        </section>

        {/* 5. Social Media Channels */}
        <section className="cms-footer-card">
          <header className="cms-footer-card-header">
            <div>
              <h2 className="cms-footer-card-title">5. Social Media Channels</h2>
              <p className="cms-footer-card-subtitle">Public social media profile URLs. Leave blank to omit a channel from the website.</p>
            </div>
          </header>
          <div className="cms-footer-card-body">
            <div className="cms-footer-grid">
              <div className="cms-footer-social-card">
                <div className="cms-footer-social-header">
                  <span className="cms-footer-social-title">Facebook</span>
                  <span className="cms-footer-social-tag">facebook</span>
                </div>
                <input
                  type="url"
                  className="cms-footer-input"
                  value={socialMap.get('facebook') ?? ''}
                  disabled={!canEdit}
                  onChange={(e) => setSocialLink('facebook', e.target.value)}
                  placeholder="https://www.facebook.com/…"
                />
              </div>

              <div className="cms-footer-social-card">
                <div className="cms-footer-social-header">
                  <span className="cms-footer-social-title">X (Twitter)</span>
                  <span className="cms-footer-social-tag">twitter</span>
                </div>
                <input
                  type="url"
                  className="cms-footer-input"
                  value={socialMap.get('x') ?? ''}
                  disabled={!canEdit}
                  onChange={(e) => setSocialLink('x', e.target.value)}
                  placeholder="https://twitter.com/…"
                />
              </div>

              <div className="cms-footer-social-card">
                <div className="cms-footer-social-header">
                  <span className="cms-footer-social-title">Instagram</span>
                  <span className="cms-footer-social-tag">instagram</span>
                </div>
                <input
                  type="url"
                  className="cms-footer-input"
                  value={socialMap.get('instagram') ?? ''}
                  disabled={!canEdit}
                  onChange={(e) => setSocialLink('instagram', e.target.value)}
                  placeholder="https://www.instagram.com/…"
                />
              </div>

              <div className="cms-footer-social-card">
                <div className="cms-footer-social-header">
                  <span className="cms-footer-social-title">LinkedIn</span>
                  <span className="cms-footer-social-tag">linkedin</span>
                </div>
                <input
                  type="url"
                  className="cms-footer-input"
                  value={socialMap.get('linkedin') ?? ''}
                  disabled={!canEdit}
                  onChange={(e) => setSocialLink('linkedin', e.target.value)}
                  placeholder="https://www.linkedin.com/…"
                />
              </div>

              <div className="cms-footer-social-card">
                <div className="cms-footer-social-header">
                  <span className="cms-footer-social-title">YouTube</span>
                  <span className="cms-footer-social-tag">youtube</span>
                </div>
                <input
                  type="url"
                  className="cms-footer-input"
                  value={socialMap.get('youtube') ?? ''}
                  disabled={!canEdit}
                  onChange={(e) => setSocialLink('youtube', e.target.value)}
                  placeholder="https://www.youtube.com/…"
                />
              </div>

              <div className="cms-footer-social-card">
                <div className="cms-footer-social-header">
                  <span className="cms-footer-social-title">Pinterest</span>
                  <span className="cms-footer-social-tag">pinterest</span>
                </div>
                <input
                  type="url"
                  className="cms-footer-input"
                  value={socialMap.get('pinterest') ?? ''}
                  disabled={!canEdit}
                  onChange={(e) => setSocialLink('pinterest', e.target.value)}
                  placeholder="https://www.pinterest.com/…"
                />
              </div>
            </div>
          </div>
        </section>

        {/* 6. Bottom Navigation Links & Copyright */}
        <section className="cms-footer-card">
          <header className="cms-footer-card-header">
            <div>
              <h2 className="cms-footer-card-title">6. Bottom Navigation Links & Legal</h2>
              <p className="cms-footer-card-subtitle">Secondary bottom navigation links bar and website copyright notice.</p>
            </div>
          </header>
          <div className="cms-footer-card-body">
            <div>
              <h3 className="cms-footer-subheading">
                <span>Bottom Navigation Links</span>
                <span className="cms-footer-count-pill">{content.bottomLinks.length}</span>
              </h3>
              <div className="cms-footer-repeater">
                <div className="cms-footer-repeater-headings">
                  <span>Display Label</span>
                  <span>Target URL / External Link</span>
                  <span>Target</span>
                  <span>Action</span>
                </div>
                {content.bottomLinks.map((link, idx) => (
                  <div key={idx} className="cms-footer-row">
                    <input
                      type="text"
                      className="cms-footer-input"
                      placeholder="Label (e.g. PGDM)"
                      value={link.label}
                      disabled={!canEdit}
                      onChange={(e) => setBottomLink(idx, 'label', e.target.value)}
                    />
                    <input
                      type="text"
                      className="cms-footer-input"
                      placeholder="URL (e.g. /admissions/...)"
                      value={link.href}
                      disabled={!canEdit}
                      onChange={(e) => setBottomLink(idx, 'href', e.target.value)}
                    />
                    <label className="cms-footer-checkbox-label">
                      <input
                        type="checkbox"
                        checked={Boolean(link.openInNewTab)}
                        disabled={!canEdit}
                        onChange={(e) => setBottomLink(idx, 'openInNewTab', e.target.checked)}
                      />
                      <span>New tab</span>
                    </label>
                    <button
                      type="button"
                      className="cms-footer-trash-btn"
                      disabled={!canEdit}
                      onClick={() => removeBottomLink(idx)}
                      title="Delete link"
                      aria-label={`Delete bottom link ${link.label}`}
                    >
                      <Icon name="trash" size={16} />
                    </button>
                  </div>
                ))}
                <div>
                  <button
                    type="button"
                    className="cms-footer-add-btn"
                    disabled={!canEdit}
                    onClick={addBottomLink}
                  >
                    <Icon name="plus" size={15} /> Add Bottom Link
                  </button>
                </div>
              </div>
            </div>

            <div className="cms-footer-grid" style={{ marginTop: '10px' }}>
              <label className="cms-footer-field cms-footer-field--full">
                <span className="cms-footer-label">Website Copyright Notice</span>
                <input
                  type="text"
                  className="cms-footer-input"
                  value={content.copyright}
                  disabled={!canEdit}
                  onChange={(e) => setCopyright(e.target.value)}
                  placeholder="Copyright © 2026 | Cosmopolitan Education Society’s Valia School of Management"
                />
              </label>
            </div>
          </div>
        </section>

        {/* Sticky Save Bar */}
        <div className="cms-footer-save-bar">
          <div className="cms-footer-save-info">
            {dirty ? (
              <span className="cms-footer-save-dirty">● You have unsaved changes.</span>
            ) : (
              <span className="cms-footer-save-clean">✓ All changes saved to MySQL database.</span>
            )}
            {document.updatedAt && (
              <span style={{ color: '#94a3b8', fontSize: '11px', marginLeft: '6px' }}>
                (Last updated: {new Date(document.updatedAt).toLocaleTimeString()})
              </span>
            )}
          </div>
          <div className="cms-footer-save-actions">
            <button
              type="button"
              className="cms-footer-btn-reset"
              disabled={busy || !dirty}
              onClick={() => void load()}
            >
              Reset
            </button>
            <button
              type="submit"
              className="cms-footer-btn-save"
              disabled={!canEdit || busy || !dirty}
            >
              {busy ? (
                <>
                  <span className="button-spinner" /> Updating Footer…
                </>
              ) : (
                'Update Footer Content'
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
