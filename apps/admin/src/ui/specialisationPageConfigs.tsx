import {
  academicsSpecialisationDefaults,
  academicsSpecialisationIndex,
  type SpecPageDefaults,
} from '@vsmedu/contracts/academics-specialisations';
import { Link } from 'react-router-dom';
import { SPECIALISATIONS_HUB_PATH, specialisationPagePath } from './cmsPaths';
import type { AcademicsPageEditorConfig } from './academicsPageConfigs';
import type { Value } from './ContentFields';

const WEB_PATH_PREFIX = '/our-academics/in-demand-specialisations/';

type SpecSectionKey = keyof Omit<SpecPageDefaults, never>;

const SECTION_ORDER: SpecSectionKey[] = [
  'meta',
  'hero',
  'tabs',
  'glance',
  'overview',
  'why',
  'careers',
  'curriculum',
  'admission',
  'internships',
  'testimonials',
  'faq',
];

const LABELS: Record<SpecSectionKey, string> = {
  meta: 'Page identity & SEO',
  hero: 'Banner breadcrumb',
  tabs: 'Section navigation tabs',
  glance: 'At a Glance (sidebar)',
  overview: 'Programme overview',
  why: 'Why this specialisation',
  careers: 'Careers & roles',
  curriculum: 'Curriculum subjects',
  admission: 'Admission procedure',
  internships: 'Summer Internship heading and image cards',
  testimonials: 'Student Testimonials heading',
  faq: 'FAQ (this page)',
};

const SUBTITLES: Record<SpecSectionKey, string> = {
  meta: 'URL slug (do not change without web routing), short admin label, page title segment, banner heading, and card icon.',
  hero: 'Breadcrumb line under the banner. Banner image and CTAs are edited in Page Banner (slider).',
  tabs: 'Sticky “on this page” links. Each anchor must match a section id on the public page.',
  glance: 'Sidebar fact rows and action buttons (when shown on the site).',
  overview: 'Eyebrow, H1-style title, and rich HTML intro paragraphs.',
  why: 'Section title and bullet rows with optional icons.',
  careers: 'Title, short intro HTML, and job role lines.',
  curriculum: 'Title, intro HTML, and subject lines (one per row).',
  admission: 'Section heading and numbered steps with icons.',
  internships: 'Summer Internship heading; manage the image cards in the page-specific master.',
  testimonials: 'Student testimonial heading. Manage this page’s independent cards, student details, images and video URLs in its Student Testimonials master.',
  faq: 'FAQ block for this landing page only — same editor as Home FAQ.',
};

const ANCHORS: Record<SpecSectionKey, string> = {
  meta: 'about-program',
  hero: 'banner',
  tabs: 'tabs',
  glance: 'at-a-glance',
  overview: 'overview',
  why: 'why-specialisation',
  careers: 'career-opportunities',
  curriculum: 'specialisation-curriculum',
  admission: 'admission-procedure',
  internships: 'summer-internship',
  testimonials: 'testimonials',
  faq: 'faq',
};

export function getSpecialisationSlugList() {
  return academicsSpecialisationIndex;
}

export function buildSpecialisationPageConfig(slug: string): AcademicsPageEditorConfig | null {
  const page = academicsSpecialisationDefaults[slug] as SpecPageDefaults | undefined;
  if (!page) return null;
  const meta = page.meta;
  const liveUrl = `${WEB_PATH_PREFIX}${meta.slug}/`;
  const apiBase = `/admin/academics/specialisations/page/${encodeURIComponent(slug)}`;

  return {
    apiList: apiBase,
    apiBulk: apiBase,
    breadcrumbs: {
      group: 'Our Academics',
      parent: meta.navTitle,
      current: `${meta.navTitle} CMS`,
    },
    title: `${meta.navTitle} CMS`,
    description: (
      <>
        Edit all sections for the <strong>In-demand specialisation</strong> landing page{' '}
        <strong>{liveUrl}</strong>. Banner slides:{' '}
        <Link to={`${specialisationPagePath(slug)}/hero`}>Page Banner (slider)</Link>. Return to{' '}
        <Link to={SPECIALISATIONS_HUB_PATH}>all specialisation pages</Link>.
      </>
    ),
    liveUrl,
    sections: SECTION_ORDER,
    labels: LABELS as Record<string, string>,
    subtitles: SUBTITLES as Record<string, string>,
    anchors: ANCHORS as Record<string, string>,
    defaults: Object.fromEntries(SECTION_ORDER.map((k) => [k, page[k as SpecSectionKey] as unknown as Value])) as Record<string, Value>,
    masterLinks: {
      hero: { to: `${specialisationPagePath(slug)}/hero`, label: 'Manage Page Banner Slides →' },
      internships: { to: `${specialisationPagePath(slug)}/internships`, label: `Manage ${meta.navTitle} Summer Internship Slides` },
      testimonials: { to: `${specialisationPagePath(slug)}/testimonials`, label: `Manage ${meta.navTitle} Student Testimonials` },
    },
    /** Specialisation pages use their own DB keys (`academics-specs.*`); do not link to Home / AICTE masters here. */
    sharedSections: [],
    sharedCardTitle: '',
    sharedCardSubtitle: '',
    sectionPillPrefix: meta.navTitle,
    saveButtonLabel: '✓ Update Specialisation Page',
    saveBusyLabel: 'Saving specialisation page…',
    successMessage: (count) => `✓ ${meta.navTitle} page updated (${count} section${count > 1 ? 's' : ''} saved)`,
    loadError: 'Could not load this specialisation page',
    saveError: 'Could not save this specialisation page',
    loadingLabel: 'Loading specialisation sections…',
  };
}
