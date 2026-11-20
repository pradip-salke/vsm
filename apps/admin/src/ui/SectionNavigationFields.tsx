import type { ReactNode } from 'react';
import { Icon } from './Icon';
import { useWebsiteAction } from './roleActions';

type NavigationItem = { label?: unknown; anchor?: unknown; href?: unknown };

/** Shared presentation for section anchors and page navigation links. */
export function SectionNavigationFields({ items, title, destination, readOnly, minimum, maximum, addLabel, onUpdate, onAdd, onRemove, renderExtra }: {
  items: NavigationItem[];
  title: string;
  destination: 'anchor' | 'href';
  readOnly: boolean;
  minimum: number;
  maximum: number;
  addLabel: string;
  onUpdate: (index: number, field: 'label' | 'anchor' | 'href', value: string) => void;
  onAdd: () => void;
  onRemove: (index: number) => void;
  renderExtra?: (index: number) => ReactNode;
}) {
  const allowAdd = useWebsiteAction('add');
  const allowDelete = useWebsiteAction('delete');
  return <fieldset className="cms-list cms-simple-list">
    <legend className="cms-list-legend">{title} <span className="cms-count-badge">({items.length})</span></legend>
    <div className="cms-marquee-rows">
      {items.map((item, index) => <div className="cms-marquee-row cms-why-item-row cms-navigation-row" key={index}>
        <input type="text" className="cms-marquee-input" placeholder="Tab label (e.g. About Program)" aria-label={`Tab label ${index + 1}`} value={String(item.label ?? '')} disabled={readOnly} onChange={event => onUpdate(index, 'label', event.target.value)} />
        <input type="text" className="cms-marquee-input" placeholder={destination === 'anchor' ? 'Section ID (e.g. about-program)' : 'Page path or URL (e.g. /about-us)'} aria-label={`${destination === 'anchor' ? 'Section anchor' : 'Link URL / Path'} ${index + 1}`} value={String(item[destination] ?? '')} disabled={readOnly} onChange={event => onUpdate(index, destination, event.target.value)} />
        <button type="button" className="cms-btn-delete" disabled={readOnly || !allowDelete || items.length <= minimum} onClick={() => onRemove(index)} title="Delete tab" aria-label={`Delete tab ${index + 1}`}><Icon name="trash" size={15} /></button>
        {renderExtra && <div className="cms-navigation-extra">{renderExtra(index)}</div>}
      </div>)}
    </div>
    <div className="cms-marquee-actions"><button type="button" className="cms-secondary cms-btn-add-item" disabled={readOnly || !allowAdd || items.length >= maximum} onClick={onAdd}>＋ {addLabel}</button></div>
  </fieldset>;
}
