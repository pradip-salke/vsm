import { SectionNavigationFields } from './SectionNavigationFields';
import { useState, useRef, useEffect, type CSSProperties } from 'react';
import { Icon } from './Icon';
import { RichSubtitle } from './RichSubtitle';

export type Value = string | number | boolean | Value[] | { [key: string]: Value };

const labels: Record<string, string> = {
  src: 'Image File Path / URL',
  alt: 'Image Description (Alt Text)',
  href: 'Link URL / Path',
  videoLink: 'Video URL',
  eyebrow: 'Section Eyebrow',
  title: 'Section Main Heading',
  subtitle: 'Description / Subtitle',
  lead: 'Lead Description',
  body: 'Main Content',
  text: 'Text Content',
  primaryText: 'Button 1 (Primary) Text',
  primaryHref: 'Button 1 Link URL',
  secondaryText: 'Button 2 (Secondary) Text',
  secondaryHref: 'Button 2 Link URL',
  buttonText: 'Button Text',
  buttonHref: 'Button Link URL',
  icon: 'Icon File / SVG',
  iconSize: 'Icon Size (px)',
  width: 'Image Width (px)',
  height: 'Image Height (px)',
  poster: 'Video Cover Poster Image',
  imagePosition: 'Desktop Image Alignment',
  mobileImagePosition: 'Mobile Image Alignment',
  highlight: 'Highlight Text',
  label: 'Label',
  value: 'Metric / Value',
  quote: 'Student Testimonial',
  answer: 'FAQ Answer',
  question: 'FAQ Question',
  name: 'Full Name',
  role: 'Designation / Title',
  expertise: 'Area of Expertise',
  experience: 'Total Industry / Teaching Experience',
  previous: 'Previous Company',
  organisations: 'Other Companies Worked With',
  academic: 'Academic Assignments',
  linkText: 'Link Text',
  images: 'Album Photos (lightbox slideshow)',
  videoUrl: 'YouTube URL or embed link (or video file URL)',
  bio: 'Profile Description',
  specialisation: 'Specialization',
  percentage: 'Placed Students %',
  count: 'No. of Students',
  stream: 'Stream',
  average: 'Average Salary',
  highest: 'Highest Salary',
  specialisationHeading: 'Specialization Column Heading',
  percentageHeading: 'Percentage Column Heading',
  countHeading: 'Students Column Heading',
  streamHeading: 'Stream Column Heading',
  averageHeading: 'Average Salary Column Heading',
  highestHeading: 'Highest Salary Column Heading',
  profilesLabel: 'Profiles Row Label',
  experienceLabel: 'Experience Row Label',
  experienceValue: 'Experience Row Value',
  shortRole: 'Short Designation',
  details: 'Detail Rows',
  avatar: 'Profile Photo',
  batch: 'Academic Batch',
  phones: 'Contact Phone Numbers',
  addressLabel: 'Address Heading',
  contactLabel: 'Contact Heading',
  openTimeLabel: 'Opening Hours Heading',
  socialLabel: 'Social Links Heading',
  addressTitle: 'Location / Campus Name',
  address: 'Full Postal Address',
  openTime: 'Opening Hours Schedule',
  items: 'Repeatable Items',
  highlights: 'Program Key Highlights',
  description: 'Section Description',
  Content: 'Section Content',
  breadcrumb: 'Breadcrumb Trail',
  links: 'Tab Links',
  anchor: 'Section Anchor ID',
  facts: 'Programme Facts',
  brochureText: 'Brochure Button Text',
  brochureHref: 'Brochure Button Link',
  contactText: 'Contact Button Text',
  contactHref: 'Contact Button Link',
  paragraphs: 'Paragraphs',
  linkLabel: 'Inline Link Text',
  linkHref: 'Inline Link URL',
  intro: 'Introduction',
  years: 'Curriculum Years',
  year: 'Year Tab Label',
  columns: 'Column Headings',
  rows: 'Table Rows',
  cells: 'Column Values (one course per line)',
  totalLabel: 'Total Row Label',
  totalValue: 'Total Row Value',
  note: 'Footnote',
  columnLabel: 'First Column Heading',
  columnValue: 'Second Column Heading',
  amount: 'Fee Amount',
  criteria: 'Eligibility Criteria',
  steps: 'Admission Steps',
  advantageSteps: 'VSM Advantage Items',
  slug: 'URL slug (do not change without developer)',
  navTitle: 'Short label (admin menu)',
  pageTitle: 'SEO / browser title segment',
  heroTitle: 'Banner main heading',
  cardIcon: 'Listing card icon',
  specialisations: 'Specialisation chips',
  roles: 'Job roles',
  subjects: 'Curriculum subjects',
  employers: 'Employers',
  itemsTitle: 'Reasons heading',
  itemsIntro: 'Reasons introduction',
  outro: 'Text after the list',
  moduleTitle: 'Module heading',
  subsectionTitle: 'Subsection heading',
  year1Module1Heading: 'Year 1 Module 1 table heading',
  year1Module2Heading: 'Year 1 Module 2 table heading',
  year2Intro: 'Year 2 intro (above table)',
  year1Rows: 'Year 1 module pairs (rows)',
  year2Rows: 'Year 2 specialisation papers (rows)',
  moduleFourTitle: 'Module 4 heading',
  moduleFourItems: 'Module 4 subject lines',
  left: 'Module 1 column',
  right: 'Module 2 column',
  paper1: 'Paper 1',
  paper2: 'Paper 2',
  paper3: 'Paper 3',
  paper4: 'Paper 4',
  paper5: 'Paper 5',
  programStructure: 'Program structure',
  'about-vsm': 'About VSM block',
  'about-aima': 'About AIMA block',
  'about-pgdm': 'About PGDM block',
  'course-modules': 'Course modules',
  'other-details': 'Other details',
  'program-structure': 'Program structure highlights',
  overview: 'Overview',
  why: 'Why this programme',
  careers: 'Careers',
  curriculum: 'Curriculum',
  meta: 'Page metadata',
  subheading: 'Subheading',
  detail: 'Description',
  profiles: 'Profiles',
  enabled: 'Active',
  cards: 'Cards',
  signature: 'Signature Lines',
  bridge: 'Industry Bridge Points',
  pillars: 'Pillars',
  closing: 'Closing Paragraphs',
  metaTitle: 'Meta Title (browser tab / search result)',
  metaDescription: 'Meta Description',
  pageSize: 'Articles per Page',
  imageFallbackText: 'No-image Placeholder Text',
  applyText: 'Apply Button Text',
  applyHref: 'Apply Button Link',
  clauses: 'Policy Clauses',
  refundRows: 'Refund Table Rows',
  particular: 'Fees Particulars',
  deduction: 'Deduction',
  refund: 'Refund',
  particularHeading: 'Column 1 Heading',
  deductionHeading: 'Column 2 Heading',
  refundHeading: 'Column 3 Heading',
  policy: 'Anti-Ragging Policy',
  committees: 'Committees',
  groups: 'Committee Sections',
  members: 'Committee Members',
  designation: 'Designation',
  report: 'EOA Report',
};

const multilineLists = /^(cells|roles|subjects)$/;

/** AICTE curriculum.years[] — edited via CurriculumYearsField, not generic nested fields */
type CurriculumYearValue = {
  year?: string;
  columns?: string[];
  rows?: { label?: string; cells?: string[] }[];
  totalLabel?: string;
  totalValue?: string;
  note?: string;
};

function curriculumColCount(y: CurriculumYearValue): number {
  const fromCols = y.columns?.length ?? 0;
  const fromRow =
    y.rows?.reduce((m, r) => Math.max(m, Array.isArray(r.cells) ? r.cells.length : 0), 0) ?? 0;
  return Math.max(fromCols, fromRow, 1);
}

function normalizeCurriculumCells(cells: string[] | undefined, n: number): string[] {
  const arr = [...(cells ?? [])];
  while (arr.length < n) arr.push('');
  return arr.slice(0, n);
}

type CurriculumYearsFieldProps = {
  value: CurriculumYearValue[];
  readOnly: boolean;
  onChange: (v: Value) => void;
};

function CurriculumYearsField({ value: years, readOnly, onChange }: CurriculumYearsFieldProps) {
  const [tab, setTab] = useState(0);

  useEffect(() => {
    if (years.length === 0) {
      setTab(0);
      return;
    }
    if (tab >= years.length) setTab(years.length - 1);
  }, [years.length, tab]);

  const updateYears = (next: CurriculumYearValue[]) => {
    onChange(next as unknown as Value);
  };

  const setYearAt = (index: number, updater: (y: CurriculumYearValue) => CurriculumYearValue) => {
    updateYears(years.map((y, i) => (i === index ? updater({ ...y }) : y)));
  };

  const active = years[tab];
  const colCount = active ? curriculumColCount(active) : 1;
  const columns = active?.columns ?? [];

  if (years.length === 0) {
    return (
      <p className="cms-curriculum-year-empty" role="status">
        No curriculum years in content. Restore defaults or add years in raw JSON if needed.
      </p>
    );
  }

  return (
    <div className="cms-curriculum-years-editor">
      <div className="cms-curriculum-year-tabs" role="tablist" aria-label="Curriculum year">
        {years.map((y, i) => (
          <button
            key={i}
            type="button"
            role="tab"
            id={`cms-curriculum-tab-${i}`}
            aria-selected={tab === i}
            aria-controls={`cms-curriculum-panel-${i}`}
            className={`cms-curriculum-year-tab${tab === i ? ' cms-curriculum-year-tab--active' : ''}`}
            disabled={readOnly}
            onClick={() => setTab(i)}
          >
            {String(y.year ?? `Year ${i + 1}`)}
          </button>
        ))}
      </div>

      {active && (
        <div
          className="cms-curriculum-year-panel"
          style={{ '--cms-cur-cols': String(colCount) } as CSSProperties}
          role="tabpanel"
          id={`cms-curriculum-panel-${tab}`}
          aria-labelledby={`cms-curriculum-tab-${tab}`}
        >
          <p className="cms-curriculum-column-hint">
            Column headings are fixed for this programme. Add or edit table rows below; use one line
            per course in each cell.
          </p>
          <div className="cms-curriculum-column-headers" aria-hidden={colCount === 0}>
            <span className="cms-curriculum-header-spacer" />
            {Array.from({ length: colCount }, (_, ci) => (
              <span key={ci} className="cms-curriculum-column-heading">
                {columns[ci] ?? `Column ${ci + 1}`}
              </span>
            ))}
            <span className="cms-curriculum-header-actions-spacer" />
          </div>

          <div className="cms-marquee-rows">
            {(active.rows ?? []).map((row, ri) => {
              const cells = normalizeCurriculumCells(row.cells, colCount);
              return (
                <div
                  className="cms-marquee-row cms-why-item-row cms-curriculum-row"
                  key={ri}
                >
                  <input
                    type="text"
                    className="cms-marquee-input cms-curriculum-row-label"
                    placeholder="Row label (optional)"
                    aria-label={`${String(active.year ?? 'Year')} row ${ri + 1} label`}
                    value={String(row.label ?? '')}
                    disabled={readOnly}
                    onChange={(e) => {
                      const label = e.target.value;
                      setYearAt(tab, (y) => {
                        const rows = [...(y.rows ?? [])];
                        const r = rows[ri] ?? { label: '', cells: [] };
                        rows[ri] = {
                          ...r,
                          label,
                          cells: normalizeCurriculumCells(r.cells, curriculumColCount(y)),
                        };
                        return { ...y, rows };
                      });
                    }}
                  />
                  {cells.map((cell, ci) => (
                    <textarea
                      key={ci}
                      className="cms-marquee-input cms-curriculum-cell"
                      rows={5}
                      placeholder={
                        columns[ci]
                          ? `${columns[ci]} — one course per line`
                          : `Column ${ci + 1} — one course per line`
                      }
                      aria-label={`${String(active.year ?? 'Year')} row ${ri + 1}, ${columns[ci] ?? `column ${ci + 1}`}`}
                      value={cell}
                      disabled={readOnly}
                      onChange={(e) => {
                        const nextVal = e.target.value;
                        setYearAt(tab, (y) => {
                          const n = curriculumColCount(y);
                          const rows = [...(y.rows ?? [])];
                          const r = rows[ri] ?? { label: '', cells: [] };
                          const nextCells = normalizeCurriculumCells(r.cells, n);
                          nextCells[ci] = nextVal;
                          rows[ri] = { ...r, cells: nextCells };
                          return { ...y, rows };
                        });
                      }}
                    />
                  ))}
                  <button
                    type="button"
                    className="cms-btn-delete cms-curriculum-row-delete"
                    disabled={readOnly || (active.rows?.length ?? 0) <= 1}
                    onClick={() => {
                      setYearAt(tab, (y) => ({
                        ...y,
                        rows: (y.rows ?? []).filter((_, i) => i !== ri),
                      }));
                    }}
                    title="Delete row"
                    aria-label={`Delete row ${ri + 1}`}
                  >
                    <Icon name="trash" size={15} />
                  </button>
                </div>
              );
            })}
          </div>

          <div className="cms-marquee-actions">
            <button
              type="button"
              className="cms-secondary cms-btn-add-item"
              disabled={readOnly || (active.rows?.length ?? 0) >= 100}
              onClick={() => {
                setYearAt(tab, (y) => {
                  const n = curriculumColCount(y);
                  const empty = Array.from({ length: n }, () => '');
                  return {
                    ...y,
                    rows: [...(y.rows ?? []), { label: '', cells: empty }],
                  };
                });
              }}
            >
              ＋ Add row
            </button>
          </div>
          <div className="cms-field cms-field--standard">
            <span className="cms-field-label">Table footnote (optional)</span>
            <RichSubtitle value={String(active.note ?? '')} disabled={readOnly} onChange={(value) => updateYears(years.map((year, index) => ({ ...year, note: index === tab ? value : year.note ?? '' })))} />
          </div>
        </div>
      )}
    </div>
  );
}

const label = (key: string) =>
  labels[key] ??
  key
    .replace(/[_-]/g, ' ')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/^./, (c) => c.toUpperCase());

type EligibilityCriterion = { text?: string; icon?: { src?: string; alt?: string; width?: number; height?: number } };

function EligibilityCriteriaList({
  items,
  templateItem,
  readOnly,
  onUpload,
  onChange,
}: {
  items: EligibilityCriterion[];
  templateItem: EligibilityCriterion;
  readOnly: boolean;
  onUpload: (file: File) => Promise<{ src: string; alt: string; width: number; height: number }>;
  onChange: (next: EligibilityCriterion[]) => void;
}) {
  const defaultIcon =
    templateItem?.icon &&
    typeof templateItem.icon === 'object' &&
    !Array.isArray(templateItem.icon)
      ? { ...templateItem.icon }
      : { src: '', alt: '', width: 68, height: 68 };

  const mergeIcon = (existing: EligibilityCriterion['icon'] | string) => {
    if (typeof existing === 'string') {
      return { ...defaultIcon, src: existing };
    }
    const e = existing && typeof existing === 'object' && !Array.isArray(existing) ? existing : {};
    return { ...defaultIcon, ...e };
  };

  const setAt = (index: number, patch: Partial<EligibilityCriterion>) => {
    onChange(items.map((item, i) => (i === index ? { ...item, ...patch } : item)));
  };

  return (
    <fieldset className="cms-list cms-simple-list">
      <legend className="cms-list-legend">{label('criteria')}</legend>
      <p className="cms-facts-hint">
        Each row has its own image/icon: use Upload or Replace to change the file, or paste a path. Saving persists <code>src</code> on that criterion. Display size follows the site design. The number of rows is fixed for this section.
      </p>
      <div className="cms-marquee-rows">
        {items.map((item, index) => {
          const icon = mergeIcon(item.icon as EligibilityCriterion['icon'] | string);
          return (
            <div className="cms-marquee-row cms-why-item-row cms-eligibility-criterion-row" key={index}>
              <EligibilityCriterionIconField
                icon={icon}
                readOnly={readOnly}
                onUpload={onUpload}
                onChange={(next) => setAt(index, { icon: next })}
              />
              <textarea
                className="cms-marquee-input"
                rows={3}
                aria-label={`Eligibility criterion ${index + 1}`}
                placeholder="Eligibility requirement…"
                value={String(item.text ?? '')}
                disabled={readOnly}
                onChange={(e) => setAt(index, { text: e.target.value })}
              />
            </div>
          );
        })}
      </div>
    </fieldset>
  );
}

function EligibilityCriterionIconField({
  icon,
  readOnly,
  onUpload,
  onChange,
}: {
  icon: NonNullable<EligibilityCriterion['icon']>;
  readOnly: boolean;
  onUpload: (file: File) => Promise<{ src: string; alt: string; width: number; height: number }>;
  onChange: (next: NonNullable<EligibilityCriterion['icon']>) => void;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState(false);

  async function handleFile(file: File) {
    if (file.size > 2 * 1024 * 1024) {
      setError('File must be < 2 MB');
      return;
    }
    setError('');
    setUploading(true);
    try {
      const asset = await onUpload(file);
      onChange({ ...icon, src: asset.src, width: asset.width, height: asset.height, alt: icon.alt || asset.alt });
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Upload failed');
    } finally {
      setUploading(false);
    }
  }

  const srcStr = String(icon.src ?? '');
  const thumb = srcStr ? preview(srcStr) : '';

  return (
    <div className="cms-eligibility-icon-field">
      <div className="cms-eligibility-icon-preview">
        {thumb ? (
          <img src={thumb} alt="" className="cms-eligibility-icon-thumb" />
        ) : (
          <span className="cms-eligibility-icon-placeholder">No icon</span>
        )}
        <div className="cms-eligibility-icon-actions">
          <button
            type="button"
            className="cms-marquee-icon-btn"
            disabled={readOnly || uploading}
            onClick={() => fileInputRef.current?.click()}
          >
            {uploading ? '…' : thumb ? 'Replace' : 'Upload'}
          </button>
          <button
            type="button"
            className="cms-marquee-icon-btn"
            disabled={readOnly || uploading}
            onClick={() => {
              const next = window.prompt('Icon path (e.g. /images/icons/… or /cms-media/…):', srcStr);
              if (next !== null) onChange({ ...icon, src: next.trim() });
            }}
          >
            URL
          </button>
        </div>
      </div>
      <input
        ref={fileInputRef}
        type="file"
        className="cms-visually-hidden"
        accept="image/png,image/jpeg,image/webp,image/avif,image/svg+xml"
        disabled={readOnly || uploading}
        onChange={(e) => {
          if (e.target.files?.[0]) void handleFile(e.target.files[0]);
        }}
      />
      <label className="cms-field cms-field--standard cms-eligibility-icon-meta">
        <span className="cms-field-label">Alt (accessibility)</span>
        <input
          type="text"
          disabled={readOnly}
          placeholder="Describe the icon"
          value={String(icon.alt ?? '')}
          onChange={(e) => onChange({ ...icon, alt: e.target.value })}
        />
      </label>
      {error && <small className="cms-compact-image-error" role="alert">{error}</small>}
    </div>
  );
}

/** AICTE fees section — same table layout as Curriculum Years (no column add/remove) */
type ProgramFeesRow = { label?: string; amount?: string };
type ProgramFeesValue = {
  title?: string;
  columnLabel?: string;
  columnValue?: string;
  rows?: ProgramFeesRow[];
  note?: string;
};

function isProgramFeesObject(v: Value): v is ProgramFeesValue {
  if (!v || typeof v !== 'object' || Array.isArray(v)) return false;
  const o = v as Record<string, unknown>;
  if (!('columnLabel' in o) || !('columnValue' in o) || !('rows' in o)) return false;
  if (typeof o.columnLabel !== 'string' || typeof o.columnValue !== 'string') return false;
  if (!Array.isArray(o.rows)) return false;
  return o.rows.every((r) => {
    if (!r || typeof r !== 'object' || Array.isArray(r)) return false;
    const row = r as Record<string, unknown>;
    return 'label' in row && 'amount' in row;
  });
}

function ProgramFeesSection({
  value,
  readOnly,
  onChange,
}: {
  value: ProgramFeesValue;
  readOnly: boolean;
  onChange: (v: Value) => void;
}) {
  const columnLabel = String(value.columnLabel ?? '');
  const columnValue = String(value.columnValue ?? '');
  const rows = value.rows ?? [];

  const setRows = (next: ProgramFeesRow[]) => {
    onChange({ ...value, rows: next } as unknown as Value);
  };

  return (
    <>
      <label className="cms-field cms-field--standard cms-field--fees-section-heading">
        <span className="cms-field-label">{label('title')}</span>
        <input
          type="text"
          placeholder="e.g. PGDM Program Fees 2026-28"
          disabled={readOnly}
          value={String(value.title ?? '')}
          onChange={(e) => onChange({ ...value, title: e.target.value } as unknown as Value)}
        />
      </label>

      <div className="cms-curriculum-year-panel cms-fees-table-editor">
        <p className="cms-curriculum-column-hint">
          Column headings are fixed for this table. Add or edit fee rows below.
        </p>
        <div className="cms-curriculum-column-headers cms-fees-column-headers" aria-hidden={false}>
          <span className="cms-curriculum-column-heading">{columnLabel || label('columnLabel')}</span>
          <span className="cms-curriculum-column-heading">{columnValue || label('columnValue')}</span>
          <span className="cms-curriculum-header-actions-spacer" />
        </div>

        <div className="cms-marquee-rows">
          {rows.map((row, ri) => (
            <div
              className="cms-marquee-row cms-why-item-row cms-curriculum-row cms-fees-data-row"
              key={ri}
            >
              <input
                type="text"
                className="cms-marquee-input cms-curriculum-cell"
                placeholder="e.g. 1st Year"
                aria-label={`Fee row ${ri + 1}, ${columnLabel || 'fee label'}`}
                value={String(row.label ?? '')}
                disabled={readOnly}
                onChange={(e) => {
                  const next = [...rows];
                  next[ri] = { ...next[ri], label: e.target.value };
                  setRows(next);
                }}
              />
              <input
                type="text"
                className="cms-marquee-input cms-curriculum-cell"
                placeholder="e.g. INR 3,00,000/-"
                aria-label={`Fee row ${ri + 1}, ${columnValue || 'amount'}`}
                value={String(row.amount ?? '')}
                disabled={readOnly}
                onChange={(e) => {
                  const next = [...rows];
                  next[ri] = { ...next[ri], amount: e.target.value };
                  setRows(next);
                }}
              />
              <button
                type="button"
                className="cms-btn-delete cms-curriculum-row-delete"
                disabled={readOnly || rows.length <= 1}
                onClick={() => setRows(rows.filter((_, i) => i !== ri))}
                title="Delete row"
                aria-label={`Delete fee row ${ri + 1}`}
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
            disabled={readOnly || rows.length >= 100}
            onClick={() => setRows([...rows, { label: '', amount: '' }])}
          >
            ＋ Add row
          </button>
        </div>
      </div>

      <label className="cms-field cms-field--standard cms-field--fees-footnote">
        <span className="cms-field-label">{label('note')}</span>
        <textarea
          rows={2}
          placeholder="Optional footnote below the table"
          disabled={readOnly}
          value={String(value.note ?? '')}
          onChange={(e) => onChange({ ...value, note: e.target.value } as unknown as Value)}
        />
      </label>
    </>
  );
}

export const preview = (src: string) =>
  src.startsWith('/cms-media/')
    ? `${import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:4000'}${src}`
    : src.startsWith('/')
      ? `${import.meta.env.VITE_WEB_BASE_URL ?? 'http://localhost:3000'}${src}`
      : src;

export function blank(value: Value): Value {
  if (Array.isArray(value)) return [];
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value).map(([k, v]) => [
        k,
        ['width', 'height', 'iconSize'].includes(k) ? v : blank(v),
      ])
    );
  }
  return typeof value === 'boolean' ? true : typeof value === 'number' ? value : '';
}

type CompactIconUploadProps = {
  value?: string;
  onChange: (src: string) => void;
  readOnly: boolean;
  upload: (file: File) => Promise<{ src: string; alt: string; width: number; height: number }>;
  placeholder?: string;
};

function CompactIconUpload({
  value,
  onChange,
  readOnly,
  upload,
  placeholder,
}: CompactIconUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState(false);

  async function handleFile(file: File) {
    if (file.size > 2 * 1024 * 1024) {
      setError('File must be < 2 MB');
      return;
    }
    setError('');
    setUploading(true);
    try {
      const res = await upload(file);
      onChange(res.src);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Upload failed');
    } finally {
      setUploading(false);
    }
  }

  const promptManualUrl = () => {
    if (readOnly) return;
    const next = window.prompt('Enter icon path or URL (e.g. /images/icons/...):', String(value ?? ''));
    if (next !== null) onChange(next.trim());
  };

  const iconSrc = value ? preview(String(value)) : '';

  return (
    <div className="cms-marquee-icon-widget">
      {iconSrc ? (
        <div
          className="cms-marquee-icon-thumb-wrap"
          title={`${value} (Double-click to edit URL directly)`}
          onDoubleClick={promptManualUrl}
        >
          <img src={iconSrc} alt="Icon preview" className="cms-marquee-icon-thumb" />
          <button
            type="button"
            className="cms-marquee-icon-btn"
            disabled={readOnly || uploading}
            onClick={() => fileInputRef.current?.click()}
            title="Replace icon file"
          >
            {uploading ? '…' : 'Replace'}
          </button>
        </div>
      ) : (
        <button
          type="button"
          className="cms-marquee-icon-choose-btn"
          disabled={readOnly || uploading}
          onClick={() => fileInputRef.current?.click()}
          title="Upload icon"
        >
          {uploading ? 'Uploading…' : placeholder || '＋ Icon'}
        </button>
      )}
      <input
        ref={fileInputRef}
        type="file"
        className="cms-visually-hidden"
        accept="image/png,image/jpeg,image/webp,image/avif,image/svg+xml"
        disabled={readOnly || uploading}
        onChange={(e) => {
          if (e.target.files?.[0]) void handleFile(e.target.files[0]);
        }}
      />
      {error && <small className="cms-compact-image-error" role="alert">{error}</small>}
    </div>
  );
}

export function Field({
  name,
  value,
  template,
  onChange,
  readOnly,
  onUpload,
  hideLegend,
  caption,
}: {
  name: string;
  value: Value;
  template: Value;
  onChange: (v: Value) => void;
  readOnly: boolean;
  onUpload: (file: File) => Promise<{ src: string; alt: string; width: number; height: number }>;
  hideLegend?: boolean;
  caption?: string;
}) {
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function upload(file?: File) {
    if (!file) return;
    setUploading(true);
    setError('');
    try {
      const asset = await onUpload(file);
      onChange(
        typeof value === 'string'
          ? asset.src
          : { ...(value as object), src: asset.src, width: asset.width, height: asset.height }
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Upload failed');
    } finally {
      setUploading(false);
    }
  }

  // Repeatable array of items (Cards, Stats, FAQs, etc.)
  if (Array.isArray(value)) {
    const itemTemplate = (Array.isArray(template) ? template[0] : undefined) ?? value[0] ?? '';
    const isListSectionTemplate = name === 'sections' && itemTemplate && typeof itemTemplate === 'object' && !Array.isArray(itemTemplate) && 'subsectionTitle' in itemTemplate && 'displayOrder' in itemTemplate && 'items' in itemTemplate;
    const itemName = isListSectionTemplate ? 'Section' : label(name).replace(/s$/, '') || 'Item';
    const itemLabel = (item: unknown) => isListSectionTemplate && item && typeof item === 'object' && !Array.isArray(item) && (item as Record<string, unknown>).sectionType === 'text' ? 'Text Section' : isListSectionTemplate ? 'List Section' : itemName;
    const eligibilityCriterionTemplate =
      itemTemplate &&
      typeof itemTemplate === 'object' &&
      !Array.isArray(itemTemplate) &&
      'text' in itemTemplate &&
      'icon' in itemTemplate &&
      itemTemplate.icon &&
      typeof itemTemplate.icon === 'object' &&
      !Array.isArray(itemTemplate.icon) &&
      'src' in (itemTemplate.icon as object);
    const isStringArray =
      (value.length > 0 && value.every((item) => typeof item === 'string')) ||
      (value.length === 0 && typeof itemTemplate === 'string');

    /** Legacy PGDM eligibility: criteria saved as string[] — show per-row icon upload and coerce save shape on edit */
    if (name === 'criteria' && eligibilityCriterionTemplate && isStringArray && value.length > 0) {
      const tmpl = itemTemplate as EligibilityCriterion;
      const baseIcon =
        tmpl.icon && typeof tmpl.icon === 'object' && !Array.isArray(tmpl.icon) ? { ...tmpl.icon } : {};
      const stringValues = value as string[];
      const items: EligibilityCriterion[] = stringValues.map((s) => ({
        text: s,
        icon: { ...baseIcon },
      }));
      return (
        <EligibilityCriteriaList
          items={items}
          templateItem={tmpl}
          readOnly={readOnly}
          onUpload={onUpload}
          onChange={(next) => onChange(next as unknown as Value)}
        />
      );
    }

    if (isStringArray) {
      const stringValues = value as string[];

      const updateStringItem = (index: number, val: string) => {
        onChange(stringValues.map((v, i) => (i === index ? val : v)));
      };

      const removeStringItem = (index: number) => {
        onChange(stringValues.filter((_, i) => i !== index));
      };

      const addStringItem = () => {
        onChange([...stringValues, '']);
      };

      return (
        <fieldset className="cms-list cms-simple-list">
          <legend className="cms-list-legend">
            {label(name)} <span className="cms-count-badge">({value.length})</span>
          </legend>
          <div className="cms-marquee-rows">
            {stringValues.map((item, index) => (
              <div className="cms-marquee-row" key={index}>
                {multilineLists.test(name) ? (
                  <textarea
                    className="cms-marquee-input"
                    rows={name === 'cells' ? 5 : 3}
                    aria-label={`${itemName} ${index + 1}`}
                    placeholder={`Enter ${itemName.toLowerCase()}…`}
                    value={item}
                    disabled={readOnly}
                    onChange={(e) => updateStringItem(index, e.target.value)}
                  />
                ) : (
                <input
                  type="text"
                  className="cms-marquee-input"
                  placeholder={
                    name === 'highlights'
                      ? 'e.g. AICTE Approved, 100% Placement Support…'
                      : `Enter ${itemName.toLowerCase()}…`
                  }
                  value={item}
                  disabled={readOnly}
                  onChange={(e) => updateStringItem(index, e.target.value)}
                />
                )}
                <button
                  type="button"
                  className="cms-btn-delete"
                  disabled={readOnly || stringValues.length <= 1}
                  onClick={() => removeStringItem(index)}
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
              disabled={readOnly || stringValues.length >= 50}
              onClick={addStringItem}
            >
              ＋ Add Item
            </button>
          </div>
        </fieldset>
      );
    }

    const isEligibilityCriterionRow = (item: unknown) => {
      if (!item || typeof item !== 'object' || Array.isArray(item)) return false;
      const r = item as Record<string, unknown>;
      if (typeof r.text !== 'string') return false;
      if (r.icon === undefined) return true;
      if (typeof r.icon === 'string') return true;
      return !!(r.icon && typeof r.icon === 'object' && !Array.isArray(r.icon));
    };
    const isEligibilityCriteriaArray =
      name === 'criteria' &&
      eligibilityCriterionTemplate &&
      (value.length === 0 || value.every(isEligibilityCriterionRow));

    if (isEligibilityCriteriaArray) {
      const items = (value.length > 0 ? value : [itemTemplate]) as EligibilityCriterion[];
      return (
        <EligibilityCriteriaList
          items={items}
          templateItem={itemTemplate as EligibilityCriterion}
          readOnly={readOnly}
          onUpload={onUpload}
          onChange={(next) => onChange(next as unknown as Value)}
        />
      );
    }

    const isIconTextArray =
      !isStringArray &&
      name !== 'criteria' &&
      ((value.length > 0 &&
        value.every(
          (item) =>
            item &&
            typeof item === 'object' &&
            !Array.isArray(item) &&
            ('text' in item || 'icon' in item) &&
            !('question' in item) &&
            !('quote' in item) &&
            !('caption' in item) &&
            !('title' in item)
        )) ||
        (value.length === 0 &&
          itemTemplate &&
          typeof itemTemplate === 'object' &&
          !Array.isArray(itemTemplate) &&
          ('text' in itemTemplate || 'icon' in itemTemplate)));

    if (isIconTextArray) {
      type IconTextItem = Record<string, Value>;
      const itemValues = value as IconTextItem[];

      const updateItem = (index: number, field: string, val: Value) => {
        onChange(itemValues.map((item, i) => (i === index ? { ...item, [field]: val } : item)) as unknown as Value);
      };

      const removeItem = (index: number) => {
        onChange(itemValues.filter((_, i) => i !== index) as unknown as Value);
      };

      const addItem = () => {
        onChange([...itemValues, { icon: '', iconSize: 40, text: '', ...(itemTemplate && typeof itemTemplate === 'object' && !Array.isArray(itemTemplate) && 'displayOrder' in itemTemplate ? { displayOrder: itemValues.length + 1 } : {}) }] as unknown as Value);
      };

      const listHeading = name === 'items' && itemTemplate && typeof itemTemplate === 'object' && !Array.isArray(itemTemplate) && 'displayOrder' in itemTemplate ? 'Icon List' : name === 'items' ? 'Why Choose VSM Highlights' : label(name);

      return (
        <fieldset className="cms-list cms-simple-list">
          <legend className="cms-list-legend">
            {listHeading} <span className="cms-count-badge">({value.length})</span>
          </legend>
          <div className="cms-marquee-rows">
            {itemValues.map((item, index) => (
              <div className="cms-marquee-row cms-why-item-row" key={index}>
                <CompactIconUpload
                  value={String(item.icon ?? '')}
                  onChange={(src) => updateItem(index, 'icon', src)}
                  readOnly={readOnly}
                  upload={onUpload}
                  placeholder="Upload icon"
                />
                <input
                  type="text"
                  className="cms-marquee-input"
                  placeholder="e.g. International immersion to Dubai…"
                  value={String(item.text ?? '')}
                  disabled={readOnly}
                  onChange={(e) => updateItem(index, 'text', e.target.value)}
                />
                {itemTemplate && typeof itemTemplate === 'object' && !Array.isArray(itemTemplate) && 'displayOrder' in itemTemplate && <label>Display order <input type="number" min={0} value={Number(item.displayOrder ?? index + 1)} disabled={readOnly} onChange={e => updateItem(index, 'displayOrder', Number(e.target.value))} /></label>}
                <button
                  type="button"
                  className="cms-btn-delete"
                  disabled={readOnly || (itemValues.length <= 1 && !(itemTemplate && typeof itemTemplate === 'object' && !Array.isArray(itemTemplate) && 'displayOrder' in itemTemplate))}
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
              disabled={readOnly || itemValues.length >= 50}
              onClick={addItem}
            >
              ＋ Add Item
            </button>
          </div>
        </fieldset>
      );
    }

    const navigationTemplate = itemTemplate && typeof itemTemplate === 'object' && !Array.isArray(itemTemplate) ? itemTemplate : null;
    const destination = navigationTemplate && 'anchor' in navigationTemplate ? 'anchor' : 'href';
    const isNavigationArray = navigationTemplate && 'label' in navigationTemplate && destination in navigationTemplate && !('text' in navigationTemplate) &&
      value.every(item => item && typeof item === 'object' && !Array.isArray(item) && 'label' in item && destination in item);

    if (isNavigationArray) {
      const items = value as Record<string, Value>[];
      // Preserve the original AICTE limits; other lists retain generic-list limits.
      const originalTabList = name === 'links' && destination === 'anchor';
      const extras = items.some(item => Object.keys(item).some(key => key !== 'label' && key !== destination));
      return <SectionNavigationFields
        items={items}
        title={destination === 'anchor' ? 'Section Navigation Tabs' : label(name)}
        destination={destination}
        readOnly={readOnly}
        minimum={originalTabList ? 1 : 0}
        maximum={originalTabList ? 50 : 100}
        addLabel={originalTabList ? 'Add Item' : `Add ${itemName}`}
        onUpdate={(index, field, text) => onChange(items.map((item, i) => i === index ? { ...item, [field]: text } : item))}
        onRemove={index => onChange(items.filter((_, i) => i !== index))}
        onAdd={() => onChange([...items, originalTabList ? { label: '', anchor: '' } : blank(itemTemplate)])}
        renderExtra={extras ? index => Object.entries(items[index]).filter(([key]) => key !== 'label' && key !== destination).map(([key, item]) =>
          <Field key={key} name={key} value={item} template={navigationTemplate[key] ?? item} readOnly={readOnly} onUpload={onUpload} onChange={next => onChange(items.map((entry, i) => i === index ? { ...entry, [key]: next } : entry))} />
        ) : undefined}
      />;
    }
    const factTemplate =
      itemTemplate &&
      typeof itemTemplate === 'object' &&
      !Array.isArray(itemTemplate) &&
      'label' in itemTemplate &&
      'value' in itemTemplate &&
      !('anchor' in itemTemplate) &&
      !('text' in itemTemplate) &&
      !('icon' in itemTemplate);
    const isFactsArray =
      name === 'facts' &&
      !isStringArray &&
      factTemplate &&
      ((value.length > 0 &&
        value.every(
          (item) =>
            item &&
            typeof item === 'object' &&
            !Array.isArray(item) &&
            'label' in item &&
            'value' in item &&
            !('anchor' in item) &&
            !('text' in item)
        )) ||
        value.length === 0);

    if (isFactsArray) {
      type FactItem = { label?: string; value?: string };
      const itemValues = value as FactItem[];

      const updateItem = (index: number, field: 'label' | 'value', val: string) => {
        onChange(itemValues.map((item, i) => (i === index ? { ...item, [field]: val } : item)) as unknown as Value);
      };

      return (
        <fieldset className="cms-list cms-simple-list">
          <legend className="cms-list-legend">Programme facts (At a Glance)</legend>
          <p className="cms-facts-hint">Update the label and value for each row. The number of rows is fixed for this section.</p>
          <div className="cms-marquee-rows">
            {itemValues.map((item, index) => (
              <div className="cms-marquee-row cms-why-item-row" key={index}>
                <input
                  type="text"
                  className="cms-marquee-input"
                  placeholder="Label (e.g. Full Time)"
                  aria-label={`Fact label ${index + 1}`}
                  value={String(item.label ?? '')}
                  disabled={readOnly}
                  onChange={(e) => updateItem(index, 'label', e.target.value)}
                />
                <input
                  type="text"
                  className="cms-marquee-input"
                  placeholder="Value (e.g. 2 Years +)"
                  aria-label={`Fact value ${index + 1}`}
                  value={String(item.value ?? '')}
                  disabled={readOnly}
                  onChange={(e) => updateItem(index, 'value', e.target.value)}
                />
              </div>
            ))}
          </div>
        </fieldset>
      );
    }

    const isCurriculumYearsArray =
      name === 'years' &&
      !isStringArray &&
      itemTemplate &&
      typeof itemTemplate === 'object' &&
      !Array.isArray(itemTemplate) &&
      'columns' in itemTemplate &&
      'rows' in itemTemplate &&
      'year' in itemTemplate &&
      ((value.length > 0 &&
        value.every(
          (item) =>
            item &&
            typeof item === 'object' &&
            !Array.isArray(item) &&
            'year' in item &&
            Array.isArray((item as CurriculumYearValue).columns) &&
            Array.isArray((item as CurriculumYearValue).rows)
        )) ||
        value.length === 0);

    if (isCurriculumYearsArray) {
      return (
        <fieldset className="cms-list cms-simple-list">
          <legend className="cms-list-legend">
            {label(name)} <span className="cms-count-badge">({value.length})</span>
          </legend>
          <CurriculumYearsField
            value={value as CurriculumYearValue[]}
            readOnly={readOnly}
            onChange={onChange}
          />
        </fieldset>
      );
    }

    return (
      <fieldset className="cms-list">
        <legend className="cms-list-legend">
          {label(name)} <span className="cms-count-badge">({value.length})</span>
        </legend>
        {name === 'profiles' && (
          <p className="cms-field-help">If all profiles on this page are inactive, the section will be hidden on the live site.</p>
        )}
        <div className="cms-list-items">
          {value.map((item, index) => (
            <div className="cms-list-item" key={index}>
              <div className="cms-item-bar">
                <span className="cms-item-tag">{itemLabel(item)} {index + 1}</span>
                <div className="cms-item-actions">
                  <button
                    type="button"
                    className="cms-item-remove-btn cms-btn-delete"
                    disabled={readOnly}
                    onClick={() => onChange(value.filter((_, i) => i !== index))}
                    title={`Delete ${itemLabel(item)} ${index + 1}`}
                    aria-label={`Delete ${itemLabel(item)} ${index + 1}`}
                  >
                    <Icon name="trash" size={15} />
                  </button>
                </div>
              </div>
              <Field
                name={`${itemLabel(item)} ${index + 1}`}
                value={name === 'profiles' && item && typeof item === 'object' && !Array.isArray(item) ? { enabled: true, ...item } : item}
                template={name === 'profiles' && itemTemplate && typeof itemTemplate === 'object' && !Array.isArray(itemTemplate) ? { enabled: true, ...itemTemplate } : itemTemplate}
                readOnly={readOnly}
                onUpload={onUpload}
                onChange={(v) => onChange(value.map((entry, i) => (i === index ? v : entry)))}
              />
            </div>
          ))}
        </div>
        {!isListSectionTemplate && (
          <button
            type="button"
            className="cms-secondary cms-btn-add-item"
            disabled={readOnly || value.length >= 100}
            onClick={() => onChange([...value, blank(itemTemplate)])}
          >
            ＋ Add {itemName}
          </button>
        )}
      </fieldset>
    );
  }

  // Nested object (or image asset)
  if (value && typeof value === 'object') {
    if (!name && isProgramFeesObject(value)) {
      return (
        <fieldset className="cms-fields">
          <ProgramFeesSection
            value={value}
            readOnly={readOnly}
            onChange={onChange}
          />
        </fieldset>
      );
    }

    const isImage = 'src' in value && 'width' in value;

    if (isImage) {
      const srcStr = String(value.src ?? '');
      const altStr = String(value.alt ?? '');
      const filename = srcStr.split('/').pop() || 'No image selected';
      const widthVal = Number(value.width ?? 0);
      const heightVal = Number(value.height ?? 0);

      return (
        <fieldset className="cms-fields cms-image-field-group">
          <legend>{label(name)}</legend>
          <div className="cms-reference-image-card">
            <div className="cms-image-card-main">
              {srcStr ? (
                <div className="cms-image-thumb-wrap">
                  <img
                    className="cms-image-thumb"
                    src={preview(srcStr)}
                    alt={altStr || 'Preview'}
                  />
                </div>
              ) : (
                <div className="cms-image-placeholder">No image</div>
              )}
              <div className="cms-image-info">
                <strong className="cms-image-filename">{filename}</strong>
                <div className="cms-image-badges">
                  {srcStr && <span className="cms-badge cms-badge--current">Current image</span>}
                  {widthVal > 0 && heightVal > 0 && (
                    <span className="cms-badge cms-badge--dims">
                      {widthVal} × {heightVal}
                    </span>
                  )}
                </div>
                <button
                  type="button"
                  className="cms-image-choose-btn"
                  disabled={readOnly || uploading}
                  onClick={() => fileInputRef.current?.click()}
                >
                  {uploading ? 'Uploading…' : 'Drop new image or click replace'}
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  className="cms-visually-hidden"
                  accept="image/png,image/jpeg,image/webp,image/avif,image/svg+xml"
                  disabled={readOnly || uploading}
                  onChange={(e) => void upload(e.target.files?.[0])}
                />
              </div>
              <div className="cms-image-action-icons">
                {srcStr && (
                  <a
                    href={preview(srcStr)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="cms-icon-btn"
                    title="View full image"
                  >
                    <Icon name="eye" size={16} />
                  </a>
                )}
                <button
                  type="button"
                  className="cms-icon-btn"
                  disabled={readOnly || uploading}
                  onClick={() => fileInputRef.current?.click()}
                  title="Replace image"
                >
                  <Icon name="edit" size={16} />
                </button>
              </div>
            </div>
            <div className="cms-image-hints">
              <span>Files must be less than <strong>2 MB</strong>.</span>
              <span>Allowed file types: <strong>png, jpg, jpeg, webp, svg</strong>.</span>
            </div>
            {error && <p role="alert" className="cms-error">{error}</p>}
          </div>

          <label className="cms-field cms-field--link">
            <span>Image Path / URL</span>
            <input
              placeholder="/images/... or URL"
              disabled={readOnly}
              value={srcStr}
              onChange={(e) => onChange({ ...value, src: e.target.value })}
            />
          </label>
          <label className="cms-field cms-field--standard">
            <span>Image Description (Alt Text)</span>
            <input
              placeholder="Describe image for accessibility"
              disabled={readOnly}
              value={altStr}
              onChange={(e) => onChange({ ...value, alt: e.target.value })}
            />
          </label>
        </fieldset>
      );
    }

    return (
      <fieldset className="cms-fields">
        {!hideLegend && name && !/^\d+$/.test(name) && !name.startsWith('Item ') && (
          <legend>{label(name)}</legend>
        )}
        {error && <p role="alert" className="cms-error">{error}</p>}
        {Object.entries(value).filter(([key]) => key !== 'sectionType' && key !== 'imageUrl' && !(value.sectionType === 'text' && (key === 'subsectionTitle' || key === 'items'))).map(([key, item]) => (
          <Field
            key={key}
            name={key}
            caption={key === 'title' ? (Object.keys(value).sort().join() === 'image,text,title' ? 'Card Heading' : undefined) : undefined}
            value={item}
            template={
              template && typeof template === 'object' && !Array.isArray(template)
                ? template[key] ?? item
                : item
            }
            readOnly={readOnly}
            onUpload={onUpload}
            onChange={(v) => onChange({ ...value, [key]: v })}
          />
        ))}
        {value.sectionType === 'text' && <div className="cms-field cms-field--long">
          <span className="cms-field-label">Optional image</span>
          <input type="file" accept="image/png,image/jpeg,image/webp,image/avif,image/svg+xml" disabled={readOnly || uploading} onChange={async event => {
            const file = event.target.files?.[0];
            event.target.value = '';
            if (!file) return;
            setUploading(true); setError('');
            try { const asset = await onUpload(file); onChange({ ...value, imageUrl: asset.src }); }
            catch (cause) { setError(cause instanceof Error ? cause.message : 'Image upload failed'); }
            finally { setUploading(false); }
          }} />
          {typeof value.imageUrl === 'string' && value.imageUrl && <><img src={preview(value.imageUrl)} alt="Section image preview" style={{ maxWidth: '180px', maxHeight: '120px', objectFit: 'contain' }} /><button type="button" className="cms-secondary" disabled={readOnly || uploading} onClick={() => onChange({ ...value, imageUrl: '' })}>Remove image</button></>}
        </div>}
      </fieldset>
    );
  }

  // Primitive fields (string, number, boolean)
  const pathImage = name === 'icon';
  const link = name === 'videoLink' || name === 'videoUrl' || /href|url|^src$|^poster$|^icon$/i.test(name);
  const longText =
    /^(body|description|quote|answer|lead|subtitle|address|content|intro|itemsIntro|outro|employers|year1Intro|year2Intro|closing)$/i.test(name);
  const plainLongText = /^(note|organisations|academic|bio|summary|metaDescription|emptyText)$/.test(name);
  const placeholder = link
    ? name === 'videoUrl' || name === 'videoLink'
      ? 'YouTube URL, embed link, or direct video URL'
      : name === 'href' || /Href$/.test(name)
      ? '/page-path or https://...'
      : 'Paste an image or file URL'
    : name === 'alt'
      ? 'Describe what the image shows'
      : `Enter ${label(name).toLowerCase()}`;
  const updatePrimitive = (next: string) => {
    if (name !== 'videoUrl' && name !== 'videoLink') {
      onChange(next);
      return;
    }
    const trimmed = next.trim();
    const iframeSrc = trimmed.match(/<iframe[^>]+src=["']([^"']+)["']/i)?.[1];
    onChange(iframeSrc?.replace(/&amp;/g, '&') ?? next);
  };
  const compact =
    typeof value === 'number' ||
    /^(value|iconSize|width|height|date|time|status|batch|order|index|year|count)$/i.test(name) ||
    /Text$/.test(name);
  const size = longText || plainLongText ? 'long' : compact ? 'short' : link ? 'link' : 'standard';
  const isRequired = ['title', 'name', 'question'].includes(name);

  return (
    <label
      className={`cms-field cms-field--${size} ${typeof value === 'boolean' ? 'cms-checkbox' : ''}`}
    >
      <span className="cms-field-label">
        {caption ?? label(name)} {isRequired && <span className="cms-required">*</span>}
      </span>
      {typeof value === 'boolean' ? (
        <input
          type="checkbox"
          disabled={readOnly}
          checked={value}
          onChange={(e) => onChange(e.target.checked)}
        />
      ) : typeof value === 'number' ? (
        <input
          type="number"
          min={['width', 'height'].includes(name) ? 1 : 0}
          max={20000}
          disabled={readOnly}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
        />
      ) : longText ? (
        <RichSubtitle value={String(value)} disabled={readOnly} onChange={(html) => onChange(html)} />
      ) : plainLongText ? (
        <textarea rows={3} placeholder={placeholder} disabled={readOnly} value={String(value)} onChange={(e) => onChange(e.target.value)} />
      ) : (
        <input placeholder={placeholder} disabled={readOnly} value={String(value)} onChange={(e) => updatePrimitive(e.target.value)} />
      )}
      {pathImage && (
        <div className="cms-icon-uploader">
          <input
            type="file"
            accept="image/*"
            disabled={readOnly || uploading}
            onChange={(e) => void upload(e.target.files?.[0])}
          />
          {value && (
            <img className="cms-icon-preview" src={preview(String(value))} alt="Current icon" />
          )}
          {error && <small role="alert">{error}</small>}
        </div>
      )}
      {name === 'videoLink' && (
        <div className="cms-video-upload">
          <input type="file" accept="video/mp4,video/webm,video/ogg" disabled={readOnly || uploading} aria-label="Upload video file (MP4, WebM or Ogg; maximum 100 MB)" onChange={(event) => void upload(event.target.files?.[0])} />
          <small>Or paste a YouTube / direct video URL above. MP4, WebM and Ogg uploads up to 100 MB.</small>
          {error && <small role="alert" className="cms-error">{error}</small>}
        </div>
      )}
    </label>
  );
}
