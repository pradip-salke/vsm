import { useRef, useState } from 'react';
import { preview, type Value } from './ContentFields';
import { RichSubtitle } from './RichSubtitle';
import { Icon } from './Icon';

type Item = Record<string, Value>;
type Asset = { src: string; alt: string; width: number; height: number };
export function HeroSlideFields({ value, onChange, disabled, upload, position, maxPosition, onPositionChange }: { value: Item; onChange: (value: Item) => void; disabled: boolean; upload: (file: File) => Promise<Asset>; position: number; maxPosition: number; onPositionChange: (position: number) => void }) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState('');
  const asset = value.image as unknown as Asset;
  const update = (key: string, text: Value) => onChange({ ...value, [key]: text });
  async function replace(file?: File) {
    if (!file) return;
    setError('');
    try { const image = await upload(file); onChange({ ...value, image: { src: image.src, alt: asset.alt, width: image.width, height: image.height } }); }
    catch (cause) { setError(cause instanceof Error ? cause.message : 'Image upload failed'); }
  }
  return <div className="cms-hero-fields">
    <h2>Slide details</h2>
    <div className="cms-hero-form-body">
      <label className="cms-field cms-field--standard"><span>Heading <span className="cms-required">*</span></span><input required placeholder="e.g. PGDM Admissions 2026" disabled={disabled} value={String(value.title ?? '')} onChange={event => update('title', event.target.value)} /></label>
      <div className="cms-hero-description"><span className="cms-hero-label">Description <small>(Optional)</small></span><RichSubtitle value={String(value.subtitle ?? '')} disabled={disabled} onChange={text => update('subtitle', text)} /></div>
      <div className="cms-hero-columns">
        <fieldset className="cms-hero-button"><legend>Primary button <small>(Optional)</small></legend><div><label className="cms-field cms-field--short"><span className="cms-visually-hidden">Primary button text</span><input disabled={disabled} placeholder="Button label" value={String(value.primaryText ?? '')} onChange={event => update('primaryText', event.target.value)} /></label><label className="cms-field cms-field--link"><span className="cms-visually-hidden">Primary button link</span><input disabled={disabled} placeholder="/page-path or URL" value={String(value.primaryHref ?? '')} onChange={event => update('primaryHref', event.target.value)} /></label></div></fieldset>
        <fieldset className="cms-hero-button"><legend>Secondary button <small>(Optional)</small></legend><div><label className="cms-field cms-field--short"><span className="cms-visually-hidden">Secondary button text</span><input disabled={disabled} placeholder="Button label" value={String(value.secondaryText ?? '')} onChange={event => update('secondaryText', event.target.value)} /></label><label className="cms-field cms-field--link"><span className="cms-visually-hidden">Secondary button link</span><input disabled={disabled} placeholder="/page-path or URL" value={String(value.secondaryHref ?? '')} onChange={event => update('secondaryHref', event.target.value)} /></label></div></fieldset>
      </div>
      <div className="cms-hero-image"><span className="cms-hero-label">Background image <small>(1920 × 820 recommended)</small></span>
        <div className="cms-hero-image-widget">
          {asset.src && <img src={preview(asset.src)} alt={asset.alt || 'Current slide background'} />}
          <div className="cms-hero-image-info"><strong>{asset.src.split('/').pop() || 'Choose a background image'}</strong><div className="cms-image-badges"><span>Current background</span><span>{asset.width} × {asset.height}</span></div><button type="button" disabled={disabled} className="cms-secondary" onClick={() => fileRef.current?.click()}>↑ Choose Image File</button><input ref={fileRef} type="file" className="cms-visually-hidden" aria-label="Upload slide background" accept="image/png,image/jpeg,image/webp,image/avif,image/svg+xml" disabled={disabled} onChange={event => void replace(event.target.files?.[0])} /></div>
          <div className="cms-hero-image-actions">{asset.src && <a href={preview(asset.src)} aria-label="View background image" title="View background image" target="_blank" rel="noopener noreferrer"><Icon name="eye" size={18} /></a>}<button type="button" title="Replace background image" aria-label="Replace background image" disabled={disabled} onClick={() => fileRef.current?.click()}><Icon name="edit" size={18} /></button></div>
        </div>
        {error && <p className="cms-error" role="alert">{error}</p>}
        <small className="cms-image-hint">PNG, JPG, WebP, AVIF or self-contained SVG. Maximum 2 MB.</small>
      </div>
      <label className="cms-field cms-field--link"><span>Image path or URL</span><input required placeholder="/images/banner.jpg or https://…" disabled={disabled} value={asset.src} onChange={event => update('image', { ...asset, src: event.target.value })} /><small>Upload an image above, or enter an existing website image path.</small></label>
      <label className="cms-field cms-field--standard"><span>Image description (alt text)</span><input placeholder="Describe the image for accessibility" disabled={disabled} value={asset.alt} onChange={event => update('image', { ...asset, alt: event.target.value })} /></label>
      <div className="cms-hero-columns"><label className="cms-field cms-hero-order"><span>Display order</span><input type="number" required min={1} max={maxPosition} disabled={disabled} value={position} onChange={event => onPositionChange(Number(event.target.value))} /></label><label className="cms-field cms-hero-status"><span>Status</span><select disabled={disabled} value={value.enabled ? 'active' : 'inactive'} onChange={event => update('enabled', event.target.value === 'active')}><option value="active">Active</option><option value="inactive">Inactive</option></select></label></div>
    </div>
  </div>;
}
