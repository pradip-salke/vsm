/** Public website path for the AICTE PGDM page (trailing slash). */
export const ACADEMICS_PAGE_PATH = '/our-academics/aicte-pgdm-courses-in-mumbai/';
/** Admin CMS base path for AICTE PGDM (no trailing slash). */
export const ACADEMICS_CMS_PATH = '/website/academics/aicte-pgdm';

/** Public website path for the AIMA PGDM page (trailing slash). */
export const AIMA_PAGE_PATH = '/our-academics/aima-pgdm/';
/** Admin CMS base path for AIMA PGDM (no trailing slash). */
export const AIMA_CMS_PATH = '/website/academics/aima-pgdm';

/** Public website path for the Teaching Faculty page (trailing slash). */
export const FACULTY_PAGE_PATH = '/faculty/';
/** Admin CMS base path for the Teaching Faculty page (no trailing slash). */
export const FACULTY_CMS_PATH = '/website/academics/faculty';

/** Hub: all “In-demand specialisation” landing pages. */
export const SPECIALISATIONS_HUB_PATH = '/website/academics/specialisations';
/** CMS editor for one specialisation (avoids `.../hero` being parsed as a slug). */
export const specialisationPagePath = (slug: string) =>
  `${SPECIALISATIONS_HUB_PATH}/page/${encodeURIComponent(slug)}`;

/** Admin CMS base path for Admissions pages (no trailing slash). */
export const ADMISSIONS_CMS_PATH = '/website/admissions';
export const admissionsCmsPath = (page: string) => `${ADMISSIONS_CMS_PATH}/${page}`;

/** Admin CMS base path for Placements pages (no trailing slash). */
export const PLACEMENTS_CMS_PATH = '/website/placements';
export const placementsCmsPath = (page: string) => `${PLACEMENTS_CMS_PATH}/${page}`;

/** Admin CMS base path for Events pages (no trailing slash). */
export const EVENTS_CMS_PATH = '/website/events';
export const eventsCmsPath = (page: string) => `${EVENTS_CMS_PATH}/${page}`;
