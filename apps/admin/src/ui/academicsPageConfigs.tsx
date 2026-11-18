import { academicsDefaults, academicsLabels, academicTemplateSection, type AcademicsKey } from '@vsmedu/contracts/academics';
import { aimaDefaults, aimaLabels, type AimaKey } from '@vsmedu/contracts/academics-aima';
import { facultyPageDefaults, facultyPageLabels, type FacultyPageKey } from '@vsmedu/contracts/academics-faculty';
import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import {
  ACADEMICS_CMS_PATH,
  ACADEMICS_PAGE_PATH,
  AIMA_CMS_PATH,
  AIMA_PAGE_PATH,
  FACULTY_CMS_PATH,
  FACULTY_PAGE_PATH,
} from './cmsPaths';
import type { Value } from './ContentFields';
import type { FaqMetaField } from './FaqSectionEditor';

export type AcademicsPageEditorConfig = {
  apiList: string;
  apiBulk: string;
  breadcrumbs: { group: string; parent?: string; current: string };
  title: string;
  description: ReactNode;
  liveUrl: string;
  sections: string[];
  labels: Record<string, string>;
  subtitles: Record<string, string>;
  anchors: Record<string, string>;
  defaults: Record<string, Value>;
  masterLinks: Partial<Record<string, { to: string; label: string }>>;
  sharedSections: { label: string; to: string }[];
  sharedCardTitle: string;
  sharedCardSubtitle: string;
  sectionPillPrefix: string;
  saveButtonLabel: string;
  saveBusyLabel: string;
  successMessage: (count: number) => string;
  loadError: string;
  saveError: string;
  loadingLabel: string;
  faq?: { metaFields: FaqMetaField[]; richAnswers: boolean };
};

const AICTE_SECTIONS: AcademicsKey[] = [
  'hero',
  'tabs',
  'glance',
  'about',
  'templateSections',
  'program-videos',
  'why',
  'gallery',
  'events',
  'internships',
  'testimonials',
  'curriculum',
  'faculty',
  'eligibility',
  'fees',
  'admission',
  'advantage',
  'faq',
];

const AICTE_SUBTITLES: Record<AcademicsKey, string> = {
  hero: 'Breadcrumb trail for the banner. Heading, image and buttons are edited in Page Banner (slider).',
  tabs: 'The sticky in-page tab bar below the banner. Each anchor must match a section ID on the page.',
  glance: 'Programme summary card in the left sidebar, with its Apply, Brochure and Contact buttons.',
  about: 'Programme introduction: section heading and one rich-text block for all body copy (links and lists in the editor).',
  templateSections: 'Display order places a section before: 1 About Program, 2 Program Videos, 3 Why VSM, 4 Gallery, 5 Events, 6 Curriculum, 7 Faculty, 8 Eligibility, 9 Fees, 10 Admission, 11 VSM Advantage; 12 places it after VSM Advantage.',
  'program-videos': 'Carousel heading. Video slides are managed in Program Videos.',
  why: 'Why Choose VSM image and highlight list with icons.',
  gallery: 'Carousel heading is edited here. Gallery images and page visibility are managed in the shared Gallery CMS.',
  events: 'Carousel heading. Event slides are managed in Upcoming Events.',
  internships: 'Carousel heading. Internship slides are managed in Summer Internships.',
  testimonials: 'Testimonial heading. Student testimonials and their optional video links are managed in Student Testimonials.',
  curriculum: 'Curriculum introduction and the Year 1 / Year 2 course tables.',
  faculty: 'Faculty section headings. Faculty profiles are shared with the Home page Faculty Slider.',
  eligibility: 'Section heading and eligibility criteria (text + icon per row).',
  fees: 'Fee table heading, column headings, fee rows and footnote.',
  admission: 'Numbered admission steps with icons.',
  advantage: 'Edit the VSM Advantage heading and list.',
  faq: 'FAQ for this page only. Same editor layout as Home → FAQ: title, intro, button, Q&A; add and edit items, then save below.',
};

const AICTE_ANCHORS: Record<AcademicsKey, string> = {
  hero: 'banner',
  tabs: 'tabs',
  glance: 'at-a-glance',
  about: 'about-program',
  templateSections: 'custom-sections',
  'program-videos': 'program-videos',
  why: 'why-vsm',
  gallery: 'gallery',
  events: 'events',
  internships: 'summer-internship',
  testimonials: 'testimonials',
  curriculum: 'curriculum',
  faculty: 'faculties',
  eligibility: 'eligibility',
  fees: 'fees',
  admission: 'admission-procedure',
  advantage: 'vsm-advantage',
  faq: 'faq',
};

export const aictePageConfig: AcademicsPageEditorConfig = {
  apiList: '/admin/academics',
  apiBulk: '/admin/academics',
  breadcrumbs: { group: 'AICTE Program', current: 'AICTE PGDM CMS' },
  title: 'AICTE Program – Page Sections',
  description: (
    <>
      Edit in-page sections of <strong>{ACADEMICS_PAGE_PATH}</strong> in page order (banner slides are under{' '}
      <Link to={`${ACADEMICS_CMS_PATH}/hero`}>Page Banner (slider)</Link>). Click <strong>Update AICTE PGDM Page</strong> at the bottom to save
      all changed sections together.
    </>
  ),
  liveUrl: ACADEMICS_PAGE_PATH,
  sections: AICTE_SECTIONS,
  labels: academicsLabels as Record<string, string>,
  subtitles: AICTE_SUBTITLES as Record<string, string>,
  anchors: AICTE_ANCHORS as Record<string, string>,
  defaults: { ...academicsDefaults, templateSections: { sections: [academicTemplateSection] } } as unknown as Record<string, Value>,
  masterLinks: {
    hero: { to: `${ACADEMICS_CMS_PATH}/hero`, label: 'Manage Page Banner Slides →' },
    'program-videos': { to: `${ACADEMICS_CMS_PATH}/program-videos`, label: 'Manage Program Video Slides →' },
    gallery: { to: '/masters/gallery/life', label: 'Manage Gallery images →' },
    events: { to: `${ACADEMICS_CMS_PATH}/events`, label: 'Manage Event Slides →' },
    faculty: { to: '/masters/faculty', label: 'Manage Faculty Slider →' },
    internships: { to: ACADEMICS_CMS_PATH + '/internships', label: 'Manage Academic Internship Slides' },
    testimonials: { to: ACADEMICS_CMS_PATH + '/testimonials', label: 'Manage Academic Testimonial Slides' },
  },
  sharedSections: [
    { label: 'Recruiter Logos', to: '/masters/recruiters' },
    { label: 'Academic Summer Internships', to: ACADEMICS_CMS_PATH + '/internships' },
    { label: 'Academic Student Testimonials', to: ACADEMICS_CMS_PATH + '/testimonials' },
    { label: 'Enquire Now', to: '/settings/enquire-now' },
    { label: 'Footer', to: '/settings/footer' },
  ],
  sharedCardTitle: 'Shared Closing Sections',
  sharedCardSubtitle:
    'Recruiters, enquiry and footer remain shared. Academic internships and testimonials have separate content from the Home page; manage them here. This page FAQ remains managed in its section.',
  sectionPillPrefix: 'AICTE PGDM',
  saveButtonLabel: '✓ Update AICTE PGDM Page',
  saveBusyLabel: 'Saving AICTE PGDM Page…',
  successMessage: (count) => `✓ AICTE PGDM page updated (${count} section${count > 1 ? 's' : ''} saved)`,
  loadError: 'Could not load the AICTE PGDM page sections',
  saveError: 'Could not save the AICTE PGDM page sections',
  loadingLabel: 'Loading AICTE PGDM page sections…',
};

const AIMA_SECTIONS: AimaKey[] = [
  'hero',
  'tabs',
  'glance',
  'about-vsm',
  'about-aima',
  'templateSections',
  'about-pgdm',
  'program-structure',
  'specialisations',
  'course-modules',
  'fees',
  'other-details',
  'internships',
  'testimonials',
  'faq',
];

const AIMA_SUBTITLES: Record<AimaKey, string> = {
  hero: 'Breadcrumb trail for the banner. Heading, image and buttons are edited in Page Banner (slider).',
  tabs: 'Sticky section navigation. Each anchor must match a section id on the AIMA page.',
  glance: 'Sidebar summary card with Apply, Brochure and Contact actions.',
  'about-vsm': 'Opening “About Program” block: heading, rich HTML, and specialisation chips with icons.',
  'about-aima': 'AIMA introduction, subsection title, and bullet list with icons.',
  templateSections: 'Add sections with a heading, description, subheading and icon list. Display order places a section before: 1 About VSM, 2 About AIMA, 3 About PGDM, 4 Program Structure, 5 Specialisations, 6 Course Modules, 7 Fees; 8 places it before Other Details and 9 places it after Other Details.',
  'about-pgdm': 'Rich HTML describing the PGDM programme structure.',
  'program-structure': 'Program structure note and icon highlight rows.',
  specialisations: 'List of specialisation names with icons (same chips as in About VSM).',
  'course-modules': 'Year 1 two-column module table, Year 2 specialisation × papers grid, Module 4 icon list.',
  fees: 'Fees table: row labels and amounts.',
  'other-details': 'Detail rows shown on the AIMA PGDM page.',
  internships: 'Summer Internship section heading; manage its image slides separately.',
  testimonials: 'Student testimonials heading; manage this page’s independent cards and video links in its Student Testimonials master.',
  faq: 'FAQs for this page (separate from Home). Edit questions and answers, then save all sections below.',
};

const AIMA_ANCHORS: Record<AimaKey, string> = {
  hero: 'banner',
  tabs: 'tabs',
  glance: 'at-a-glance',
  'about-vsm': 'about-vsm',
  'about-aima': 'about-aima',
  templateSections: 'custom-sections',
  'about-pgdm': 'about-pgdm',
  'program-structure': 'program-structure',
  specialisations: 'specialisations',
  'course-modules': 'course-modules',
  fees: 'aima-fees',
  'other-details': 'other-details',
  internships: 'summer-internship',
  testimonials: 'testimonials',
  faq: 'faq',
};

export const aimaPageConfig: AcademicsPageEditorConfig = {
  apiList: '/admin/academics/aima',
  apiBulk: '/admin/academics/aima',
  breadcrumbs: { group: 'Our Academics', current: 'AIMA PGDM – Page Sections' },
  title: 'AIMA PGDM – Page Sections',
  description: (
    <>
      Edit all in-page sections for <strong>{AIMA_PAGE_PATH}</strong> in display order. Banner slides are edited under{' '}
      <Link to={`${AIMA_CMS_PATH}/hero`}>Page Banner (slider)</Link>. Use <strong>Update AIMA PGDM Page</strong> to save every changed section
      together.
    </>
  ),
  liveUrl: AIMA_PAGE_PATH,
  sections: AIMA_SECTIONS,
  labels: aimaLabels as Record<string, string>,
  subtitles: AIMA_SUBTITLES as Record<string, string>,
  anchors: AIMA_ANCHORS as Record<string, string>,
  defaults: { ...aimaDefaults, templateSections: { sections: [academicTemplateSection] } } as unknown as Record<string, Value>,
  masterLinks: {
    hero: { to: `${AIMA_CMS_PATH}/hero`, label: 'Manage Page Banner Slides →' },
    internships: { to: `${AIMA_CMS_PATH}/internships`, label: 'Manage AIMA PGDM Internship Slides' },
    testimonials: { to: `${AIMA_CMS_PATH}/testimonials`, label: 'Manage AIMA Student Testimonial Slides' },
  },
  sharedSections: [
    { label: 'Recruiter Logos', to: '/masters/recruiters' },
    { label: 'AIMA Student Testimonials', to: `${AIMA_CMS_PATH}/testimonials` },
    { label: 'Enquire Now', to: '/settings/enquire-now' },
    { label: 'Footer', to: '/settings/footer' },
  ],
  sharedCardTitle: 'Shared Closing Sections',
  sharedCardSubtitle: 'Recruiters, enquiry and footer remain shared. AIMA internship slides and student testimonials are managed separately for this page.',
  sectionPillPrefix: 'AIMA PGDM',
  saveButtonLabel: '✓ Update AIMA PGDM Page',
  saveBusyLabel: 'Saving AIMA PGDM Page…',
  successMessage: (count) => `✓ AIMA PGDM page updated (${count} section${count > 1 ? 's' : ''} saved)`,
  loadError: 'Could not load the AIMA PGDM page sections',
  saveError: 'Could not save the AIMA PGDM page sections',
  loadingLabel: 'Loading AIMA PGDM page sections…',
};

const FACULTY_SECTIONS: FacultyPageKey[] = ['hero', 'tabs', 'glance', 'intro', 'experience'];

const FACULTY_SUBTITLES: Record<FacultyPageKey, string> = {
  templateSections: 'Display order places a section before: 1 Faculty Profiles, 2 Teaching Experience; 3 places it after Teaching Experience.',
  hero: 'Breadcrumb trail and the “Meet Our Faculty” jump link. Heading, subtitle and image are edited in Page Banner (slider).',
  tabs: 'Sticky section navigation. Each anchor must match a section id on the Faculty page.',
  glance: 'Sidebar summary card: eyebrow, heading, intro text and the two fact rows. The Profiles count is the number of active faculty profiles.',
  intro: 'Heading block above the faculty grid. Faculty cards are managed in Faculty Profiles.',
  experience: 'Closing section heading and rich-text paragraph.',
};

const FACULTY_ANCHORS: Record<FacultyPageKey, string> = {
  templateSections: 'custom-sections',
  hero: 'banner',
  tabs: 'tabs',
  glance: 'faculty-overview',
  intro: 'our-faculty',
  experience: 'faculty-experience',
};

export const facultyPageConfig: AcademicsPageEditorConfig = {
  apiList: '/admin/academics/teaching-faculty',
  apiBulk: '/admin/academics/teaching-faculty',
  breadcrumbs: { group: 'Our Academics', parent: 'Faculty', current: 'Teaching Faculty CMS' },
  title: 'Faculty – Page Sections',
  description: (
    <>
      Edit all in-page sections for <strong>{FACULTY_PAGE_PATH}</strong> in display order. Banner slides are under{' '}
      <Link to={`${FACULTY_CMS_PATH}/hero`}>Page Banner (slider)</Link> and faculty cards under{' '}
      <Link to={`${FACULTY_CMS_PATH}/profiles`}>Faculty Profiles</Link>. Use <strong>Update Faculty Page</strong> to save every changed
      section together.
    </>
  ),
  liveUrl: FACULTY_PAGE_PATH,
  sections: FACULTY_SECTIONS,
  labels: facultyPageLabels as Record<string, string>,
  subtitles: FACULTY_SUBTITLES as Record<string, string>,
  anchors: FACULTY_ANCHORS as Record<string, string>,
  defaults: { ...facultyPageDefaults, templateSections: { sections: [academicTemplateSection] } } as unknown as Record<string, Value>,
  masterLinks: {
    hero: { to: `${FACULTY_CMS_PATH}/hero`, label: 'Manage Page Banner Slides →' },
    intro: { to: `${FACULTY_CMS_PATH}/profiles`, label: 'Manage Faculty Profiles →' },
  },
  sharedSections: [],
  sharedCardTitle: '',
  sharedCardSubtitle: '',
  sectionPillPrefix: 'Faculty',
  saveButtonLabel: '✓ Update Faculty Page',
  saveBusyLabel: 'Saving Faculty Page…',
  successMessage: (count) => `✓ Faculty page updated (${count} section${count > 1 ? 's' : ''} saved)`,
  loadError: 'Could not load the Faculty page sections',
  saveError: 'Could not save the Faculty page sections',
  loadingLabel: 'Loading Faculty page sections…',
};
