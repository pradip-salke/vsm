import { Icon } from './Icon';
import type { AdminMenuLink } from './navigation';

export function PlaceholderPage({ page }: { page: AdminMenuLink }) {
  return <><div className="page-heading"><div><p className="eyebrow">VSM CMS workspace</p><h1>{page.label}</h1><p className="page-description">{page.description ?? 'This workspace is ready for future CMS capabilities.'}</p></div></div><section className="phase-card"><div className="phase-icon"><Icon name="file" size={21} /></div><div className="phase-copy"><span className="phase-tag"><span /> Foundation ready</span><h2>This module is prepared for a future phase.</h2><p>The navigation, permissions, and page structure are in place. Module-specific workflows will be added in a later implementation phase.</p></div></section></>;
}
