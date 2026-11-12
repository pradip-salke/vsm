import { placementsPages, type PlacementsPageSlug } from '@vsmedu/contracts/placements';
import { Link } from 'react-router-dom';
import { AcademicsPageEditor } from './AcademicsPageEditor';
import type { AcademicsPageEditorConfig } from './academicsPageConfigs';
import { placementsCmsPath } from './cmsPaths';
import type { Value } from './ContentFields';

const ANCHORS: Record<string, string> = {
  hero: 'banner',
  'page-nav': 'placement-pages',
  'batch-nav': 'batch-records',
  intro: 'introduction',
  cards: 'placement-cards',
  highlights: 'highlights',
  recruiters: 'our-recruiters',
  records: 'placement-records',
  'placement-records': 'placement-records',
  'internship-records': 'internship-records',
  'specialisation-table': 'specialisation-placement-record',
  'salary-table': 'salary-range',
  pagination: 'gallery-pages',
};

type PageGroupPage = {
  path: string;
  navTitle: string;
  sections: Record<string, unknown>;
  masters: Record<string, unknown>;
  masterLabels: Record<string, string>;
  masterSections: Record<string, string>;
  labels: Record<string, string>;
  subtitles: Record<string, string>;
};

/** Page Sections editor config for one page of a page group (Placements, Events). */
export function pageGroupEditorConfig({ group, api, cmsBase, page }: { group: string; api: string; cmsBase: string; page: PageGroupPage }): AcademicsPageEditorConfig {
  const name = `${page.navTitle} Page`;
  const masterLinks: AcademicsPageEditorConfig['masterLinks'] = {
    hero: { to: `${cmsBase}/hero`, label: 'Manage Page Banner Slides →' },
  };
  for (const [master, section] of Object.entries(page.masterSections)) {
    masterLinks[section] = { to: `${cmsBase}/${master}`, label: `Manage ${page.masterLabels[master]} →` };
  }
  const otherMasters = Object.keys(page.masters).filter((key) => key !== 'hero');
  return {
    apiList: api,
    apiBulk: api,
    breadcrumbs: { group, parent: page.navTitle, current: `${page.navTitle} CMS` },
    title: `${group} – ${page.navTitle}`,
    description: (
      <>
        Edit all in-page sections for <strong>{page.path}</strong> in display order. Banner slides are edited under{' '}
        <Link to={`${cmsBase}/hero`}>Page Banner (slider)</Link>
        {otherMasters.map((key, index) => (
          <span key={key}>
            {index === otherMasters.length - 1 ? ' and ' : ', '}
            <Link to={`${cmsBase}/${key}`}>{page.masterLabels[key]}</Link>
          </span>
        ))}
        . Use <strong>Update {name}</strong> to save every changed section together. Content here is stored for this page only.
      </>
    ),
    liveUrl: page.path,
    sections: Object.keys(page.sections),
    labels: page.labels,
    subtitles: page.subtitles,
    anchors: ANCHORS,
    defaults: page.sections as unknown as Record<string, Value>,
    masterLinks,
    sharedSections: [
      { label: 'Enquire Now', to: '/settings/enquire-now' },
      { label: 'Footer', to: '/settings/footer' },
    ],
    sharedCardTitle: 'Shared Sections',
    sharedCardSubtitle: 'Blocks shared across the website are maintained from these global areas.',
    sectionPillPrefix: page.navTitle,
    saveButtonLabel: `✓ Update ${name}`,
    saveBusyLabel: `Saving ${name}…`,
    successMessage: (count) => `✓ ${name} updated (${count} section${count > 1 ? 's' : ''} saved)`,
    loadError: `Could not load the ${name} sections`,
    saveError: `Could not save the ${name} sections`,
    loadingLabel: `Loading ${name} sections…`,
  };
}

export function placementsPageConfig(slug: PlacementsPageSlug): AcademicsPageEditorConfig {
  return pageGroupEditorConfig({
    group: 'Placements',
    api: `/admin/placements/${slug}`,
    cmsBase: placementsCmsPath(slug),
    page: placementsPages[slug] as unknown as PageGroupPage,
  });
}

export function PlacementsPageEditor({ canEdit, page }: { canEdit: boolean; page: PlacementsPageSlug }) {
  return <AcademicsPageEditor canEdit={canEdit} config={placementsPageConfig(page)} />;
}
