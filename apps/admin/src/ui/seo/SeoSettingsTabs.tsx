import { useCallback, useEffect, useState, type FormEvent } from 'react';
import type { SeoGlobalSettings, SeoTrackingSettings } from '@vsmedu/contracts/seo';
import { api } from '../../lib/api';
import { Icon } from '../Icon';
import { Field, ImageDrop, LoadingCard, Notices, SaveBar, SaveButton, Toggle, WEB_BASE, errorText, useLeaveGuard, useSeoDoc } from './seoShared';

const CheckItem = ({ children }: { children: React.ReactNode }) => (
  <li><span className="seo-check-badge"><Icon name="check" size={13} /></span><span>{children}</span></li>
);

export function SeoGlobalTab({ canEdit }: { canEdit: boolean }) {
  const doc = useSeoDoc<SeoGlobalSettings>('/admin/seo/global');
  useLeaveGuard(doc.dirty);
  const { form, setForm } = doc;
  if (doc.loading && !form) return <LoadingCard text="Loading global SEO settings…" />;
  if (!form) return <Notices error={doc.error} notice="" onDismiss={() => doc.setError('')} />;

  const set = <K extends keyof SeoGlobalSettings>(key: K, value: SeoGlobalSettings[K]) => setForm({ ...form, [key]: value });
  const input = (key: keyof SeoGlobalSettings, placeholder = '', type = 'text') => (
    <input id={`seo-${key}`} className="seo-input" type={type} value={String(form[key])} placeholder={placeholder} disabled={!canEdit} onChange={(e) => set(key, e.target.value as never)} />
  );
  const submit = (event: FormEvent) => { event.preventDefault(); void doc.save('Global SEO settings saved. Verification tags and schema are live on the website.'); };

  return (
    <form className="seo-pane" onSubmit={submit}>
      <Notices error={doc.error} notice={doc.notice} onDismiss={() => { doc.setError(''); doc.setNotice(''); }} onReload={() => void doc.load()} />
      <div className="seo-two-col">
        <div className="seo-col">
          <section className="seo-card">
            <h2 className="seo-card-title">Search engine verification</h2>
            <p className="seo-card-desc">Paste only the verification code (the content value), not the whole meta tag.</p>
            <Field label="Google Search Console" htmlFor="seo-googleVerification">{input('googleVerification', 'e.g. 3hX9…')}</Field>
            <Field label="Bing Webmaster Tools" htmlFor="seo-bingVerification">{input('bingVerification', 'msvalidate.01 code')}</Field>
            <Field label="Yandex Webmaster" htmlFor="seo-yandexVerification">{input('yandexVerification')}</Field>
            <Field label="Pinterest" htmlFor="seo-pinterestVerification">{input('pinterestVerification', 'p:domain_verify code')}</Field>
            <Field label="Facebook domain verification" htmlFor="seo-facebookVerification">{input('facebookVerification')}</Field>
          </section>

          <section className="seo-card">
            <h2 className="seo-card-title">Organization schema</h2>
            <p className="seo-card-desc">Adds EducationalOrganization structured data to the home page so search engines can show the school's name, logo and profiles.</p>
            <Toggle id="seo-enableOrgSchema" label="Enable Organization schema" checked={form.enableOrgSchema} disabled={!canEdit} onChange={(v) => set('enableOrgSchema', v)} />
            <Field label="Organization name" htmlFor="seo-orgName">{input('orgName', 'Valia School of Management')}</Field>
            <Field label="Website URL" htmlFor="seo-websiteUrl" hint="Public address used for canonical links, sitemaps and share images. Leave empty to use the configured website origin.">{input('websiteUrl', 'https://vsmedu.com', 'url')}</Field>
            <ImageDrop label="Logo (square, min 112 px)" value={form.orgLogo} disabled={!canEdit} compact onChange={(src) => set('orgLogo', src)} />
            <Field label="Contact email" htmlFor="seo-contactEmail">{input('contactEmail', 'info@vsmedu.in', 'email')}</Field>
            <Field label="Contact phone" htmlFor="seo-contactPhone">{input('contactPhone', '+91 730 434 3478')}</Field>
            <Field label="Social profile URLs (one per line)" htmlFor="seo-socialUrls">
              <textarea id="seo-socialUrls" className="seo-textarea" rows={5} value={form.socialUrls} disabled={!canEdit} onChange={(e) => set('socialUrls', e.target.value)} placeholder={'https://www.facebook.com/…\nhttps://www.instagram.com/…'} />
            </Field>
            <Toggle id="seo-enableSitelinksSearchbox" label="Enable Google sitelinks search box" checked={form.enableSitelinksSearchbox} disabled={!canEdit} onChange={(v) => set('enableSitelinksSearchbox', v)} />
            {form.enableSitelinksSearchbox ? (
              <Field label="Site search URL" htmlFor="seo-siteSearchUrl" hint={<>Address of the website's search results page, with <code className="seo-code-pill">{'{search_term_string}'}</code> where the search words go.</>}>
                {input('siteSearchUrl', 'https://vsmedu.com/search/?q={search_term_string}', 'url')}
              </Field>
            ) : null}
          </section>
        </div>

        <div className="seo-col">
          <section className="seo-card">
            <h2 className="seo-card-title">Social sharing defaults</h2>
            <p className="seo-card-desc">Used only on pages that do not define their own share image.</p>
            <ImageDrop label="Default share image (1200 × 630)" hint="1200 × 630 px" value={form.defaultShareImage} disabled={!canEdit} onChange={(src) => set('defaultShareImage', src)} />
            <Field label="X / Twitter handle" htmlFor="seo-twitterHandle">{input('twitterHandle', '@ValiaSOM')}</Field>
          </section>
          <section className="seo-card">
            <h2 className="seo-card-title">Good to know</h2>
            <ul className="seo-rules">
              <CheckItem>Verification tags are added to every page, so you can verify in Search Console with the "HTML tag" method.</CheckItem>
              <CheckItem>After verifying, submit <code className="seo-code-pill">{WEB_BASE}/sitemap.xml</code>, <code className="seo-code-pill">blog-sitemap.xml</code> and <code className="seo-code-pill">gallery-sitemap.xml</code>.</CheckItem>
              <CheckItem>The Organization schema is added only to the home page.</CheckItem>
              <CheckItem>A share image set in Page SEO always wins over the default share image.</CheckItem>
            </ul>
          </section>
        </div>
      </div>
      <SaveBar dirty={doc.dirty}><SaveButton saving={doc.saving} disabled={!canEdit || !doc.dirty} label="Save global settings" /></SaveBar>
    </form>
  );
}

export function SeoTrackingTab({ canEdit }: { canEdit: boolean }) {
  const doc = useSeoDoc<SeoTrackingSettings>('/admin/seo/tracking');
  useLeaveGuard(doc.dirty);
  const { form, setForm } = doc;
  if (doc.loading && !form) return <LoadingCard text="Loading tracking settings…" />;
  if (!form) return <Notices error={doc.error} notice="" onDismiss={() => doc.setError('')} />;

  const set = (key: keyof SeoTrackingSettings, value: string) => setForm({ ...form, [key]: value });
  const idInput = (key: keyof SeoTrackingSettings, placeholder: string) => (
    <input id={`seo-${key}`} className="seo-input seo-mono" value={form[key]} placeholder={placeholder} disabled={!canEdit} spellCheck={false} onChange={(e) => set(key, e.target.value.trim())} />
  );
  const code = (key: keyof SeoTrackingSettings, placeholder: string) => (
    <textarea id={`seo-${key}`} className="seo-code-editor" rows={6} spellCheck={false} value={form[key]} placeholder={placeholder} disabled={!canEdit} onChange={(e) => set(key, e.target.value)} />
  );
  const submit = (event: FormEvent) => { event.preventDefault(); void doc.save('Tracking & custom code saved. Snippets are added to every public page.'); };

  return (
    <form className="seo-pane" onSubmit={submit}>
      <Notices error={doc.error} notice={doc.notice} onDismiss={() => { doc.setError(''); doc.setNotice(''); }} onReload={() => void doc.load()} />
      <div className="seo-two-col">
        <section className="seo-card">
          <h2 className="seo-card-title">Analytics &amp; tracking</h2>
          <p className="seo-card-desc">Enter only the ID. The correct snippet is added to every public page automatically.</p>
          <Field label="Google Analytics 4 measurement ID" htmlFor="seo-googleAnalyticsId">{idInput('googleAnalyticsId', 'G-XXXXXXXXXX')}</Field>
          <Field label="Google Tag Manager container ID" htmlFor="seo-gtmContainerId">{idInput('gtmContainerId', 'GTM-XXXXXXX')}</Field>
          <Field label="Meta (Facebook) Pixel ID" htmlFor="seo-metaPixelId">{idInput('metaPixelId', '123456789012345')}</Field>
          <Field label="Microsoft Clarity project ID" htmlFor="seo-clarityProjectId">{idInput('clarityProjectId', 'abcd1234ef')}</Field>
          <p className="seo-hint">If Google Analytics is already configured inside Tag Manager, fill in only the Tag Manager ID to avoid counting visits twice.</p>
        </section>
        <section className="seo-card">
          <h2 className="seo-card-title">Custom code</h2>
          <p className="seo-card-desc">For other tools (chat widgets, extra verification, ad tags). Code is inserted as-is on every public page, so paste only snippets you trust.</p>
          <Field label="Custom code before </head>" htmlFor="seo-customHeadCode" hint="Only <script>, <style>, <meta>, <link> and <noscript> tags are valid in the page head.">{code('customHeadCode', '<!-- e.g. extra meta tags or scripts -->')}</Field>
          <Field label="Custom code after <body>" htmlFor="seo-customBodyStartCode">{code('customBodyStartCode', '<!-- e.g. noscript iframes or banners -->')}</Field>
          <Field label="Custom code before </body>" htmlFor="seo-customBodyEndCode" hint="Third-party scripts from domains other than Google, Meta and Microsoft Clarity must also be allowed in the website's Content Security Policy.">{code('customBodyEndCode', '<!-- e.g. chat widget or footer scripts -->')}</Field>
        </section>
      </div>
      <SaveBar dirty={doc.dirty}><SaveButton saving={doc.saving} disabled={!canEdit || !doc.dirty} label="Save tracking & code" /></SaveBar>
    </form>
  );
}

type RobotsDoc = {
  content: string;
  updatedAt: string | null;
  backup: { content: string; savedAt: string } | null;
  defaultContent: string;
  siteUrl: string;
  sitemaps: { file: string; label: string; description: string; url: string; urlCount: number }[];
};

export function SeoRobotsTab({ canEdit }: { canEdit: boolean }) {
  const [doc, setDoc] = useState<RobotsDoc | null>(null);
  const [content, setContent] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const dirty = doc !== null && content !== doc.content;
  useLeaveGuard(dirty);

  const load = useCallback(async () => {
    setError('');
    try {
      const { data } = await api<{ data: RobotsDoc }>('/admin/seo/robots');
      setDoc(data);
      setContent(data.content);
    } catch (cause) {
      setError(errorText(cause, 'Could not load robots.txt'));
    }
  }, []);
  useEffect(() => { void load(); }, [load]);

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!doc) return;
    setSaving(true);
    setError('');
    setNotice('');
    try {
      await api('/admin/seo/robots', { method: 'PATCH', body: JSON.stringify({ content, updatedAt: doc.updatedAt }) });
      await load();
      setNotice('robots.txt saved. The website serves the new rules now.');
    } catch (cause) {
      setError(errorText(cause, 'Could not save robots.txt'));
    } finally {
      setSaving(false);
    }
  }

  if (!doc) return error ? <Notices error={error} notice="" onDismiss={() => setError('')} /> : <LoadingCard text="Loading robots.txt…" />;
  const missing = doc.sitemaps.filter((map) => !content.toLowerCase().includes(`sitemap: ${map.url}`.toLowerCase()));

  return (
    <form className="seo-pane" onSubmit={submit}>
      <Notices error={error} notice={notice} onDismiss={() => { setError(''); setNotice(''); }} onReload={() => void load()} />
      <div className="seo-two-col">
        <section className="seo-card">
          <div className="seo-card-head">
            <h2 className="seo-card-title">robots.txt</h2>
            <a className="seo-icon-link" href={`${WEB_BASE}/robots.txt`} target="_blank" rel="noopener noreferrer" title="Open robots.txt in a new tab" aria-label="Open robots.txt in a new tab"><Icon name="external" size={15} /></a>
          </div>
          <textarea aria-label="robots.txt content" className="seo-code-editor seo-robots-editor" rows={14} spellCheck={false} value={content} disabled={!canEdit} onChange={(e) => setContent(e.target.value)} />
          <div className="seo-robots-actions">
            <button type="button" className="seo-text-button" disabled={!canEdit || content === doc.defaultContent} onClick={() => setContent(doc.defaultContent)}>Insert recommended rules</button>
            {doc.backup ? <button type="button" className="seo-text-button" disabled={!canEdit || content === doc.backup.content} onClick={() => setContent(doc.backup!.content)}>Restore original (backup from {new Date(doc.backup.savedAt).toLocaleDateString()})</button> : null}
          </div>
          <p className="seo-hint">A backup of the original rules is kept the first time you save, so you can always restore it.</p>
        </section>
        <section className="seo-card">
          <h2 className="seo-card-title">Sitemaps</h2>
          <div className="seo-sitemaps">
            {doc.sitemaps.map((map) => (
              <div className="seo-sitemap-row" key={map.file}>
                <span>
                  <span className="seo-sitemap-title">{map.label}</span>
                  <span className="seo-sitemap-desc">{map.description} · {map.urlCount} URL{map.urlCount === 1 ? '' : 's'}</span>
                </span>
                <a className="seo-icon-link" href={`${WEB_BASE}/${map.file}`} target="_blank" rel="noopener noreferrer" title={`Open ${map.file} in a new tab`} aria-label={`Open ${map.file} in a new tab`}><Icon name="external" size={15} /></a>
              </div>
            ))}
          </div>
          <p className="seo-tip">Sitemaps are generated live from the website's pages, gallery albums and published blog posts. Pages set to <code className="seo-code-pill">noindex</code> in Page SEO are left out automatically.</p>
          {missing.length ? (
            <div className="seo-alert is-warn"><span>robots.txt does not list {missing.map((m) => m.file).join(', ')}. Add a <code className="seo-code-pill">Sitemap:</code> line for each so search engines discover them.</span></div>
          ) : (
            <p className="seo-tip">Tip: robots.txt lists every sitemap with a <code className="seo-code-pill">Sitemap:</code> line, so search engines can discover them.</p>
          )}
        </section>
      </div>
      <SaveBar dirty={dirty}><SaveButton saving={saving} disabled={!canEdit || !dirty} label="Save robots.txt" /></SaveBar>
    </form>
  );
}
