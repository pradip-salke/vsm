import { Icon } from './Icon';
import { RichSubtitle } from './RichSubtitle';

/** FAQ Q&A rows — same editor as Home Page CMS FAQ section. */
export type FaqItem = { question?: string; answer?: string };

/** Full FAQ block shape (heading, intro, CTA, items). */
export type FaqContent = {
  title?: string;
  eyebrow?: string;
  description?: string;
  items?: FaqItem[];
  buttonText?: string;
  buttonHref?: string;
};

export type FaqMetaField = 'eyebrow' | 'description' | 'button';
const ALL_META_FIELDS: FaqMetaField[] = ['eyebrow', 'description', 'button'];

/** Heading, intro, button + Q&A list with add/remove — same as Home FAQ section. */
export function FaqSectionEditor({
  content,
  readOnly,
  onChange,
  metaFields = ALL_META_FIELDS,
  richAnswers = false,
}: {
  content: FaqContent;
  readOnly: boolean;
  onChange: (next: FaqContent) => void;
  /** Optional heading fields this page's FAQ block actually renders. */
  metaFields?: FaqMetaField[];
  richAnswers?: boolean;
}) {
  const patch = (updates: Partial<FaqContent>) => onChange({ ...content, ...updates });
  const items = content.items ?? [];

  return (
    <div className="cms-faq-section-editor">
      <div className="cms-faq-section-meta">
        <div className="cms-faq-meta-field">
          <label className="cms-enquire-field-label" htmlFor="faq-title">
            Section title
          </label>
          <input
            id="faq-title"
            className="cms-enquire-input"
            value={String(content.title ?? '')}
            onChange={(e) => patch({ title: e.target.value })}
            disabled={readOnly}
            placeholder="e.g. FAQ About PGDM Admissions"
          />
        </div>
        {metaFields.includes('eyebrow') && (
          <div className="cms-faq-meta-field">
            <label className="cms-enquire-field-label" htmlFor="faq-eyebrow">
              Eyebrow / subtitle
            </label>
            <input
              id="faq-eyebrow"
              className="cms-enquire-input"
              value={String(content.eyebrow ?? '')}
              onChange={(e) => patch({ eyebrow: e.target.value })}
              disabled={readOnly}
              placeholder="Short line above the title"
            />
          </div>
        )}
        {metaFields.includes('description') && (
          <div className="cms-faq-meta-field">
            <label className="cms-enquire-field-label" htmlFor="faq-description">
              Intro (body text)
            </label>
            <textarea
              id="faq-description"
              className="cms-enquire-textarea"
              value={String(content.description ?? '')}
              onChange={(e) => patch({ description: e.target.value })}
              disabled={readOnly}
              placeholder="Paragraph shown beside or above the accordion…"
              rows={4}
            />
          </div>
        )}
        {metaFields.includes('button') && (
          <div className="cms-faq-meta-row">
            <div className="cms-faq-meta-field">
              <label className="cms-enquire-field-label" htmlFor="faq-button-text">
                Button label
              </label>
              <input
                id="faq-button-text"
                className="cms-enquire-input"
                value={String(content.buttonText ?? '')}
                onChange={(e) => patch({ buttonText: e.target.value })}
                disabled={readOnly}
                placeholder="e.g. More FAQs"
              />
            </div>
            <div className="cms-faq-meta-field">
              <label className="cms-enquire-field-label" htmlFor="faq-button-href">
                Button link (URL path)
              </label>
              <input
                id="faq-button-href"
                className="cms-enquire-input"
                value={String(content.buttonHref ?? '')}
                onChange={(e) => patch({ buttonHref: e.target.value })}
                disabled={readOnly}
                placeholder="e.g. /admissions/mba-pgdm-admissions-process/"
              />
            </div>
          </div>
        )}
      </div>
      <FaqItemsEditor items={items} readOnly={readOnly} richAnswers={richAnswers} onItemsChange={(nextItems) => patch({ items: nextItems })} />
    </div>
  );
}

export function FaqItemsEditor({
  items,
  readOnly,
  onItemsChange,
  richAnswers = false,
}: {
  items: FaqItem[];
  readOnly: boolean;
  onItemsChange: (next: FaqItem[]) => void;
  richAnswers?: boolean;
}) {
  const setItem = (index: number, field: keyof FaqItem, val: string) => {
    const next = [...items];
    next[index] = { ...next[index], [field]: val };
    onItemsChange(next);
  };
  const removeItem = (index: number) => onItemsChange(items.filter((_, i) => i !== index));
  const addItem = () => onItemsChange([...items, { question: '', answer: '' }]);

  return (
    <div className="cms-compact-editor cms-compact-faq cms-compact-fullwidth">
      <div className="cms-compact-items">
        {items.map((item, index) => (
          <div key={index} className="cms-compact-item-row cms-compact-item-row-fullwidth">
            <div className="cms-compact-field-fullwidth">
              <label className="cms-compact-field-label">Question</label>
              <input
                className="cms-compact-input cms-compact-input-fullwidth"
                value={String(item.question ?? '')}
                onChange={(e) => setItem(index, 'question', e.target.value)}
                disabled={readOnly}
                placeholder="e.g. What job roles can I get after PGDM?"
              />
            </div>
            <div className="cms-compact-field-fullwidth">
              <label className="cms-compact-field-label">Answer</label>
              {richAnswers ? (
                <RichSubtitle
                  value={String(item.answer ?? '')}
                  disabled={readOnly}
                  onChange={(html) => setItem(index, 'answer', html)}
                />
              ) : (
                <textarea
                  className="cms-compact-textarea cms-compact-textarea-fullwidth"
                  value={String(item.answer ?? '')}
                  onChange={(e) => setItem(index, 'answer', e.target.value)}
                  disabled={readOnly}
                  placeholder="Type the answer…"
                  rows={3}
                />
              )}
            </div>
            <div className="cms-compact-field-action-fullwidth">
              <button
                type="button"
                className="cms-compact-delete"
                disabled={readOnly}
                aria-label={`Delete item ${index + 1}`}
                title="Delete item"
                onClick={() => removeItem(index)}
              >
                <Icon name="trash" size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>
      <button
        type="button"
        className="cms-compact-add"
        disabled={readOnly || items.length >= 100}
        onClick={addItem}
      >
        ＋ Add Item
      </button>
    </div>
  );
}
