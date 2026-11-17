import { eventsPages, type EventsPageSlug } from '@vsmedu/contracts/events';
import { AcademicsPageEditor } from './AcademicsPageEditor';
import { eventsCmsPath } from './cmsPaths';
import { pageGroupEditorConfig } from './PlacementsPageEditor';

export function EventsPageEditor({ canEdit, page }: { canEdit: boolean; page: EventsPageSlug }) {
  const pageData = eventsPages[page];
  const masters = Object.fromEntries(Object.entries(pageData.masters).filter(([key]) => key !== 'albums'));
  const masterSections = Object.fromEntries(Object.entries(pageData.masterSections).filter(([key]) => key !== 'albums'));
  const config = pageGroupEditorConfig({
    group: 'Events',
    api: `/admin/events/${page}`,
    cmsBase: eventsCmsPath(page),
    page: { ...pageData, masters, masterSections } as unknown as Parameters<typeof pageGroupEditorConfig>[0]['page'],
  });
  return <AcademicsPageEditor canEdit={canEdit} config={config} />;
}
