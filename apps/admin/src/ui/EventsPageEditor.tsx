import { eventsPages, type EventsPageSlug } from '@vsmedu/contracts/events';
import { AcademicsPageEditor } from './AcademicsPageEditor';
import { eventsCmsPath } from './cmsPaths';
import { pageGroupEditorConfig } from './PlacementsPageEditor';

export function EventsPageEditor({ canEdit, page }: { canEdit: boolean; page: EventsPageSlug }) {
  const config = pageGroupEditorConfig({
    group: 'Events',
    api: `/admin/events/${page}`,
    cmsBase: eventsCmsPath(page),
    page: eventsPages[page] as unknown as Parameters<typeof pageGroupEditorConfig>[0]['page'],
  });
  return <AcademicsPageEditor canEdit={canEdit} config={config} />;
}
