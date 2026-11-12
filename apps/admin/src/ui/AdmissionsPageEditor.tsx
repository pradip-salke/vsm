import { admissionsPages, type AdmissionsPageSlug } from '@vsmedu/contracts/admissions';
import { Link } from 'react-router-dom';
import { AcademicsPageEditor } from './AcademicsPageEditor';
import type { AcademicsPageEditorConfig } from './academicsPageConfigs';
import { admissionsCmsPath } from './cmsPaths';
import type { Value } from './ContentFields';

const ANCHORS: Record<string, string> = {
  hero: 'banner',
  'page-nav': 'admissions-pages',
  eligibility: 'eligibility-criteria',
  steps: 'steps-to-apply',
  'apply-cta': 'apply-now',
  intro: 'course-fees',
  fees: 'program-fees',
  'form-section': 'application-form',
  faq: 'faqs',
  policy: 'refund-policy',
  'refund-table': 'aicte-refund-policy',
};

export function admissionsPageConfig(slug: AdmissionsPageSlug): AcademicsPageEditorConfig {
  const page = admissionsPages[slug];
  const name = `${page.navTitle} Page`;
  return {
    apiList: `/admin/admissions/${slug}`,
    apiBulk: `/admin/admissions/${slug}`,
    breadcrumbs: { group: 'Admissions', parent: page.navTitle, current: `${page.navTitle} CMS` },
    title: `Admissions – ${page.navTitle}`,
    description: (
      <>
        Edit all in-page sections for <strong>{page.path}</strong> in display order. Banner slides are edited under{' '}
        <Link to={`${admissionsCmsPath(slug)}/hero`}>Page Banner (slider)</Link>. Use <strong>Update {name}</strong> to save every changed
        section together. Content here is stored for this page only.
      </>
    ),
    liveUrl: page.path,
    sections: Object.keys(page.sections),
    labels: page.labels as Record<string, string>,
    subtitles: page.subtitles as Record<string, string>,
    anchors: ANCHORS,
    defaults: page.sections as unknown as Record<string, Value>,
    masterLinks: { hero: { to: `${admissionsCmsPath(slug)}/hero`, label: 'Manage Page Banner Slides →' } },
    sharedSections:
      slug === 'application-form'
        ? [
            { label: 'Application Submissions', to: '/enquiries/application' },
            { label: 'Footer', to: '/settings/footer' },
          ]
        : [
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
    faq: { metaFields: [], richAnswers: true },
  };
}

export function AdmissionsPageEditor({ canEdit, page }: { canEdit: boolean; page: AdmissionsPageSlug }) {
  return <AcademicsPageEditor canEdit={canEdit} config={admissionsPageConfig(page)} />;
}
