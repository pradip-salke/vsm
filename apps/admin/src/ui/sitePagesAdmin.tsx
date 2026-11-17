import { aboutPages } from '@vsmedu/contracts/about-pages';
import { blogPages } from '@vsmedu/contracts/blogs';
import { careerPages } from '@vsmedu/contracts/career-page';
import type { SitePageDefinition } from '@vsmedu/contracts/site-pages';
import { Link } from 'react-router-dom';
import { AcademicsPageEditor } from './AcademicsPageEditor';
import type { AcademicsPageEditorConfig } from './academicsPageConfigs';
import type { Value } from './ContentFields';
import type { PageGroupMeta } from './SliderMaster';

export const ABOUT_CMS_PATH = '/website/about-us';
export const CAREER_CMS_PATH = '/website/career';
export const BLOGS_CMS_PATH = '/website/blogs';
export const BLOG_POSTS_PATH = `${BLOGS_CMS_PATH}/posts`;

export type SiteGroupKey = 'about' | 'career' | 'blogs';

type MasterInfo = { label: string; section?: string; noun?: string };

type SiteGroup = {
  label: string;
  registry: Record<string, SitePageDefinition>;
  api: (slug: string) => string;
  cms: (slug: string) => string;
  masters: Record<string, MasterInfo>;
  shared: { label: string; to: string }[];
};

export const siteGroups: Record<SiteGroupKey, SiteGroup> = {
  about: {
    label: 'About Us',
    registry: aboutPages,
    api: (slug) => `/admin/about/${slug}`,
    cms: (slug) => `${ABOUT_CMS_PATH}/${slug}`,
    masters: { hero: { label: 'Page Banner' } },
    shared: [{ label: 'Footer (About links)', to: '/settings/footer' }],
  },
  career: {
    label: 'Career',
    registry: careerPages,
    api: (slug) => `/admin/career/${slug}`,
    cms: () => CAREER_CMS_PATH,
    masters: { hero: { label: 'Page Banner' } },
    shared: [
      { label: 'Career Applications', to: '/enquiries/career' },
      { label: 'Footer', to: '/settings/footer' },
    ],
  },
  blogs: {
    label: 'Blogs',
    registry: blogPages,
    api: (slug) => `/admin/blogs/pages/${slug}`,
    cms: (slug) => `${BLOGS_CMS_PATH}/${slug}`,
    masters: { hero: { label: 'Page Banner' } },
    shared: [{ label: 'Blog Posts', to: BLOG_POSTS_PATH }],
  },
};


export function sitePageSlugs(group: SiteGroupKey) {
  return Object.keys(siteGroups[group].registry);
}

/** Props for SliderMaster (`scope="site"`) for one master of one page. */
export function siteMasterPage(group: SiteGroupKey, slug: string) {
  const { label, registry, api, masters } = siteGroups[group];
  const page = registry[slug]!;
  const meta: PageGroupMeta = {
    path: page.path,
    navTitle: page.navTitle,
    sections: page.sections,
    masters: page.masters,
    masterLabels: Object.fromEntries(Object.entries(masters).map(([key, info]) => [key, info.label])),
    masterSections: Object.fromEntries(Object.entries(masters).flatMap(([key, info]) => (info.section ? [[key, info.section]] : []))),
  };
  return { label, api: api(slug), meta };
}

export function sitePageConfig(group: SiteGroupKey, slug: string): AcademicsPageEditorConfig {
  const { label, registry, api, cms, masters, shared } = siteGroups[group];
  const page = registry[slug]!;
  const isBlogDetail = group === 'blogs' && slug === 'detail';
  const name = isBlogDetail ? 'Blog Detail Defaults' : `${page.navTitle} Page`;
  const hasHeroMaster = !(group === 'blogs' && slug === 'detail');
  const masterLinks: AcademicsPageEditorConfig['masterLinks'] = hasHeroMaster
    ? { hero: { to: `${cms(slug)}/hero`, label: 'Manage Page Banner Slides →' } }
    : {};
  for (const [key, info] of Object.entries(masters)) {
    if (info.section && key in page.masters) masterLinks[info.section] = { to: `${cms(slug)}/${key}`, label: `Manage ${info.label} →` };
  }
  return {
    apiList: api(slug),
    apiBulk: api(slug),
    breadcrumbs: isBlogDetail
      ? { group: 'Blog Management', parent: 'Blog Posts', current: 'Detail Defaults' }
      : { group: label, parent: page.navTitle, current: `${page.navTitle} CMS` },
    title: isBlogDetail ? 'Blog Detail Defaults' : label === page.navTitle ? `${label} Page` : `${label} – ${page.navTitle}`,
    description: (
      <>
        Edit all in-page sections for <strong>{group === 'blogs' && slug === 'detail' ? 'every blog detail page (/blogs/<post-slug>/)' : page.path}</strong> in display order.{' '}
        {hasHeroMaster && <>Banner slides are edited under <Link to={`${cms(slug)}/hero`}>Page Banner (slider)</Link>. </>}
        Use <strong>Update {name}</strong> to save every changed section together.
        Content here is stored for this page only.
      </>
    ),
    liveUrl: page.path,
    sections: Object.keys(page.sections),
    labels: page.labels,
    subtitles: page.subtitles,
    anchors: Object.fromEntries(Object.keys(page.sections).map((key) => [key, key === 'hero' ? 'banner' : key])),
    defaults: page.sections as unknown as Record<string, Value>,
    masterLinks,
    sharedSections: shared,
    sharedCardTitle: 'Related Areas',
    sharedCardSubtitle: 'Related content managed in other CMS areas.',
    sectionPillPrefix: page.navTitle,
    saveButtonLabel: `✓ Update ${name}`,
    saveBusyLabel: `Saving ${name}…`,
    successMessage: (count) => `✓ ${name} updated (${count} section${count > 1 ? 's' : ''} saved)`,
    loadError: `Could not load the ${name} sections`,
    saveError: `Could not save the ${name} sections`,
    loadingLabel: `Loading ${name} sections…`,
  };
}

export function SitePageEditor({ canEdit, group, slug }: { canEdit: boolean; group: SiteGroupKey; slug: string }) {
  return <AcademicsPageEditor canEdit={canEdit} config={sitePageConfig(group, slug)} />;
}
