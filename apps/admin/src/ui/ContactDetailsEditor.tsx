import type { FormEvent } from 'react';
import type { FooterContent } from '@vsmedu/contracts/footer';
import { Field, ImageDrop, LoadingCard, Notices, SaveBar, SaveButton, useSeoDoc } from './seo/seoShared';
import { RichSubtitle } from './RichSubtitle';
import './seo/seo-studio.css';

export function ContactDetailsEditor({ canEdit }: { canEdit: boolean }) {
  const { form, setForm, loading, saving, error, notice, setError, setNotice, load, save, dirty } = useSeoDoc<FooterContent>('/admin/settings/footer');
  const content = form?.contactPage;

  function updateContactPage<K extends keyof FooterContent['contactPage']>(field: K, value: FooterContent['contactPage'][K]) {
    setForm((current) => current ? { ...current, contactPage: { ...current.contactPage, [field]: value } } : current);
  }

  function updateHero<K extends keyof FooterContent['contactPage']['hero']>(field: K, value: FooterContent['contactPage']['hero'][K]) {
    setForm((current) => current ? {
      ...current,
      contactPage: { ...current.contactPage, hero: { ...current.contactPage.hero, [field]: value } },
    } : current);
  }

  function updateImage<K extends keyof FooterContent['contactPage']['hero']['image']>(field: K, value: FooterContent['contactPage']['hero']['image'][K]) {
    setForm((current) => current ? {
      ...current,
      contactPage: {
        ...current.contactPage,
        hero: { ...current.contactPage.hero, image: { ...current.contactPage.hero.image, [field]: value } },
      },
    } : current);
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void save('Contact page content saved and published.');
  }

  return (
    <div className="cms-editor cms-contact-details-editor">
      <header className="page-heading">
        <div>
          <nav className="cms-breadcrumbs" aria-label="Breadcrumb">
            <span>Settings</span><span className="cms-breadcrumb-sep">/</span><span className="cms-breadcrumb-current">Contact Details</span>
          </nav>
          <h1>Contact Details</h1>
          <p className="page-description">Manage the Contact page banner, copy, calls to action, and map shown on the public website.</p>
        </div>
      </header>

      {loading ? <LoadingCard text="Loading Contact page content…" /> : (
        <form className="seo-pane" onSubmit={submit}>
          <Notices error={error} notice={notice} onDismiss={() => { setError(''); setNotice(''); }} onReload={() => void load()} />

          {content && <>
            <section className="seo-card">
              <h2 className="seo-card-title">Page banner</h2>
              <p className="seo-card-desc">Edit the Contact page heading, supporting line, banner image, and breadcrumb label.</p>
              <div className="seo-two-col">
                <Field label="Page title" htmlFor="contact-hero-title"><input id="contact-hero-title" className="seo-input" maxLength={200} value={content.hero.title} disabled={!canEdit || saving} onChange={(event) => updateHero('title', event.target.value)} /></Field>
                <Field label="Supporting text" htmlFor="contact-hero-subtitle"><input id="contact-hero-subtitle" className="seo-input" maxLength={300} value={content.hero.subtitle} disabled={!canEdit || saving} onChange={(event) => updateHero('subtitle', event.target.value)} /></Field>
                <Field label="Breadcrumb label" htmlFor="contact-breadcrumb"><input id="contact-breadcrumb" className="seo-input" maxLength={100} value={content.breadcrumbLabel} disabled={!canEdit || saving} onChange={(event) => updateContactPage('breadcrumbLabel', event.target.value)} /></Field>
                <Field label="Image description (alt text)" htmlFor="contact-hero-alt"><input id="contact-hero-alt" className="seo-input" maxLength={300} value={content.hero.image.alt} disabled={!canEdit || saving} onChange={(event) => updateImage('alt', event.target.value)} /></Field>
              </div>
              <ImageDrop label="Banner image" hint="Shown behind the Contact page title" value={content.hero.image.src} disabled={!canEdit || saving} onChange={(src) => updateImage('src', src)} />
            </section>

            <section className="seo-card">
              <h2 className="seo-card-title">Banner buttons</h2>
              <p className="seo-card-desc">Set the button labels and destinations. Leave a label or link empty to hide that button.</p>
              <div className="seo-two-col">
                <Field label="Apply button text" htmlFor="contact-apply-text"><input id="contact-apply-text" className="seo-input" maxLength={100} value={content.hero.applyText} disabled={!canEdit || saving} onChange={(event) => updateHero('applyText', event.target.value)} /></Field>
                <Field label="Apply button link" htmlFor="contact-apply-href"><input id="contact-apply-href" className="seo-input" maxLength={500} value={content.hero.applyHref} disabled={!canEdit || saving} onChange={(event) => updateHero('applyHref', event.target.value)} /></Field>
                <Field label="Enquire button text" htmlFor="contact-enquire-text"><input id="contact-enquire-text" className="seo-input" maxLength={100} value={content.hero.enquireText} disabled={!canEdit || saving} onChange={(event) => updateHero('enquireText', event.target.value)} /></Field>
                <Field label="Enquire button link" htmlFor="contact-enquire-href"><input id="contact-enquire-href" className="seo-input" maxLength={500} value={content.hero.enquireHref} disabled={!canEdit || saving} onChange={(event) => updateHero('enquireHref', event.target.value)} /></Field>
              </div>
            </section>

            <section className="seo-card">
              <h2 className="seo-card-title">Page introduction</h2>
              <p className="seo-card-desc">These paragraphs appear below the banner and above the shared Enquire Now section.</p>
              <Field label="Introductory text" htmlFor="contact-intro"><RichSubtitle id="contact-intro" label="Introductory text" value={content.intro} disabled={!canEdit || saving} onChange={(html) => updateContactPage('intro', html)} /></Field>
              <Field label="Closing text" htmlFor="contact-closing"><RichSubtitle id="contact-closing" label="Closing text" value={content.closing} disabled={!canEdit || saving} onChange={(html) => updateContactPage('closing', html)} /></Field>
            </section>

            <section className="seo-card">
              <h2 className="seo-card-title">Contact locations</h2>
              <p className="seo-card-desc">Edit the address and Google Maps link for each location. Selecting a location in the Contact navigation updates only the address and map link in the Contact page footer.</p>
              <div className="seo-two-col">
                {([
                  ['andheri', 'Andheri'],
                  ['borivali', 'Borivali'],
                  ['ghatkopar', 'Ghatkopar'],
                ] as const).map(([key, label]) => (
                  <div key={key} className="seo-field">
                    <Field label={`${label} address`} htmlFor={`contact-location-${key}`}>
                      <textarea id={`contact-location-${key}`} className="seo-input" rows={3} maxLength={1000} value={content.locations[key]} disabled={!canEdit || saving} onChange={(event) => updateContactPage('locations', { ...content.locations, [key]: event.target.value })} />
                    </Field>
                    <Field label={`${label} Google Maps embed URL`} htmlFor={`contact-map-link-${key}`}>
                      <input id={`contact-map-link-${key}`} type="url" className="seo-input" maxLength={2000} placeholder="https://www.google.com/maps/embed?..." value={content.mapLinks[key]} disabled={!canEdit || saving} onChange={(event) => updateContactPage('mapLinks', { ...content.mapLinks, [key]: event.target.value })} />
                    </Field>
                  </div>
                ))}
              </div>
            </section>

            <SaveBar dirty={dirty}>
              <SaveButton saving={saving} disabled={!canEdit || !dirty} label="Update Contact Page" />
            </SaveBar>
          </>}
        </form>
      )}
    </div>
  );
}
