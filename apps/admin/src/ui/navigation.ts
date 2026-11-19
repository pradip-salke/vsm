import { academicsSpecialisationIndex } from '@vsmedu/contracts/academics-specialisations';
import { admissionsPages, admissionsPageSlugs } from '@vsmedu/contracts/admissions';
import { placementsPages, placementsPageSlugs } from '@vsmedu/contracts/placements';
import { eventsPages, eventsPageSlugs } from '@vsmedu/contracts/events';
import { aboutPages, aboutPageSlugs } from '@vsmedu/contracts/about-pages';

export type AdminMenuLink = {
  label: string;
  path: string;
  icon?: string;
  description?: string;
};

/** Nested folder under Website Pages (e.g. Home, Our Academics). */
export type AdminMenuBranch = {
  label: string;
  icon: string;
  children: AdminMenuNode[];
};

export type AdminMenuNode = AdminMenuLink | AdminMenuBranch;

export function isMenuLeaf(item: AdminMenuNode): item is AdminMenuLink {
  return 'path' in item;
}

/** Stable id for sidebar expand/collapse (e.g. `pages:Our Academics:AICTE PGDM`). */
export function branchSectionKey(groupId: string, trailToParent: string[], label: string) {
  return [groupId, ...trailToParent, label].join(':');
}

export type AdminMenuGroup = {
  id: string;
  label: string;
  icon: string;
  /** Renders the group as a single direct sidebar link (no submenu). */
  path?: string;
  children?: AdminMenuNode[];
};

/** Admin menu label overrides (e.g. shorter name than `navTitle` in contracts). */
const SPECIALISATION_MENU_LABELS: Partial<Record<string, string>> = {
  'mba-pgdm-in-human-resources-mumbai': 'Human Resources',
};

const specialisationPageMenus: AdminMenuNode[] = academicsSpecialisationIndex.map(({ slug, navTitle }) => ({
  label: SPECIALISATION_MENU_LABELS[slug] ?? navTitle,
  icon: 'pages',
  children: [
    {
      label: 'Page Banner',
      path: `/website/academics/specialisations/page/${encodeURIComponent(slug)}/hero`,
      description: `Banner slides for ${navTitle}.`,
    },
    {
      label: `${SPECIALISATION_MENU_LABELS[slug] ?? navTitle} CMS`,
      path: `/website/academics/specialisations/page/${encodeURIComponent(slug)}`,
      description: `All in-page sections for ${navTitle}.`,
    },
  ],
}));

const academicDisclosureSlugs = ['anti-ragging-policy', 'committee', 'eoa-report'] as const;

const aboutPageMenus: AdminMenuNode[] = aboutPageSlugs.filter((slug) => !academicDisclosureSlugs.includes(slug as typeof academicDisclosureSlugs[number])).map((slug) => {
  const { navTitle } = aboutPages[slug];
  return {
    label: navTitle,
    icon: 'pages',
    children: [
      { label: 'Page Banner', path: `/website/about-us/${slug}/hero`, description: `Banner slides for the ${navTitle} page.` },
      { label: `${navTitle} CMS`, path: `/website/about-us/${slug}`, description: `All in-page sections of the ${navTitle} page.` },
    ],
  };
});

const admissionsPageMenus: AdminMenuNode[] = admissionsPageSlugs.map((slug) => {
  const { navTitle } = admissionsPages[slug];
  return {
    label: navTitle,
    icon: 'pages',
    children: [
      { label: 'Page Banner', path: `/website/admissions/${slug}/hero`, description: `Banner slides for the ${navTitle} page.` },
      { label: `${navTitle} CMS`, path: `/website/admissions/${slug}`, description: `All in-page sections of the ${navTitle} page.` },
    ],
  };
});

function pageGroupMenus(base: string, pages: Record<string, { navTitle: string; masterLabels: Record<string, string> }>): AdminMenuBranch[] {
  return Object.entries(pages).map(([slug, { navTitle, masterLabels }]) => ({
    label: navTitle,
    icon: 'pages',
    children: [
      { label: 'Page Banner', path: `${base}/${slug}/hero`, description: `Banner slides for the ${navTitle} page.` },
      { label: `${navTitle} CMS`, path: `${base}/${slug}`, description: `All in-page sections of the ${navTitle} page.` },
      ...Object.entries(masterLabels)
        .filter(([key]) => key !== 'hero')
        .map(([key, label]) => ({
          label,
          path: `${base}/${slug}/${key}`,
          description: `${label} master for the ${navTitle} page.`,
        })),
    ],
  }));
}

const placementsPageMenus = pageGroupMenus(
  '/website/placements',
  Object.fromEntries(placementsPageSlugs.map((slug) => [slug, placementsPages[slug]])) as Record<string, { navTitle: string; masterLabels: Record<string, string> }>
);
const eventsPageMenus = pageGroupMenus(
  '/website/events',
  Object.fromEntries([...eventsPageSlugs].filter((slug) => slug !== 'gallery-2').sort((a, b) => {
    const order = ['list-of-speakers', 'gallery', 'achievements', 'videos-of-speakers'];
    const rank = (slug: string) => { const index = order.indexOf(slug); return index === -1 ? order.length : index; };
    return rank(a) - rank(b);
  }).map((slug) => [slug, eventsPages[slug]])) as Record<string, { navTitle: string; masterLabels: Record<string, string> }>
).map((page) => ({ ...page, children: [
  ...page.children.filter((child) => isMenuLeaf(child) ? child.label !== 'Gallery Albums' : true),
  ...(page.label === 'Photo Gallery' ? [{ label: 'Gallery Management', path: '/masters/gallery', description: 'Manage Gallery Albums and Life @ VSM images in one place.' }] : []),
] }));

export const adminMenu: AdminMenuGroup[] = [
  { id: 'dashboard', label: 'Dashboard', icon: 'dashboard', children: [{ label: 'Overview', path: '/' }] },
  {
    id: 'pages',
    label: 'Website Pages',
    icon: 'pages',
    children: [
      {
        label: 'Home',
        icon: 'home',
        children: [
          { label: 'Home Slider', path: '/masters/hero', description: 'Manage homepage banner slides.' },
          { label: 'Home CMS', path: '/website/home-sections', description: 'Homepage content sections.' },
        ],
      },
      {
        label: 'Our Academics',
        icon: 'pages',
        children: [
          {
            label: 'AICTE PGDM',
            icon: 'pages',
            children: [
              { label: 'Page Banner', path: '/website/academics/aicte-pgdm/hero', description: 'Banner slides for the AICTE PGDM page.' },
              { label: 'AICTE PGDM CMS', path: '/website/academics/aicte-pgdm', description: 'All in-page sections of the AICTE PGDM page.' },
            ],
          },
          {
            label: 'AIMA PGDM',
            icon: 'pages',
            children: [
              { label: 'Page Banner', path: '/website/academics/aima-pgdm/hero', description: 'Banner slides for the AIMA PGDM page.' },
              { label: 'AIMA PGDM CMS', path: '/website/academics/aima-pgdm', description: 'All in-page sections of the AIMA PGDM page.' },
            ],
          },
          ...specialisationPageMenus,
          {
            label: 'Faculty',
            icon: 'pages',
            children: [
              { label: 'Page Banner', path: '/website/academics/faculty/hero', description: 'Banner slides for the Teaching Faculty page.' },
              { label: 'Teaching Faculty CMS', path: '/website/academics/faculty', description: 'All in-page sections of the Teaching Faculty page.' },
            ],
          },
          {
            label: 'Mandatory Disclosure',
            icon: 'pages',
            children: academicDisclosureSlugs.map((slug) => {
              const { navTitle } = aboutPages[slug];
              return {
                label: navTitle,
                icon: 'pages',
                children: [
                  { label: 'Page Banner', path: `/website/about-us/${slug}/hero`, description: `Banner slides for the ${navTitle} page.` },
                  { label: `${navTitle} CMS`, path: `/website/about-us/${slug}`, description: `Manage content for the ${navTitle} page.` },
                ],
              };
            }),
          },
        ],
      },
      {
        label: 'Admissions',
        icon: 'pages',
        children: admissionsPageMenus,
      },
      {
        label: 'Placements',
        icon: 'pages',
        children: placementsPageMenus,
      },
      {
        label: 'Events',
        icon: 'pages',
        children: eventsPageMenus,
      },
      {
        label: 'About Us',
        icon: 'users',
        children: aboutPageMenus,
      },
      {
        label: 'Careers',
        icon: 'pages',
        children: [
          { label: 'Page Banner', path: '/website/career/hero', description: 'Banner slides for the Career page.' },
          { label: 'Career CMS', path: '/website/career', description: 'All in-page sections of the Career page.' },
        ],
      },
      {
        label: 'Blog Management',
        icon: 'pages',
        children: [
          { label: 'All Posts', path: '/website/blogs/posts', description: 'Add, edit, preview, publish and manage blog articles.' },
          {
            label: 'Listing Page',
            icon: 'pages',
            children: [
              { label: 'Page Banner', path: '/website/blogs/listing/hero', description: 'Banner slides for the blog listing page.' },
              { label: 'Listing Settings', path: '/website/blogs/listing', description: 'Heading, listing settings and SEO of /blogs/.' },
            ],
          },
        ],
      },
    ],
  },
  { id: 'masters', label: 'Slider Masters', icon: 'package', children: [
    { label: 'Faculty Slider', path: '/masters/faculty', description: 'Faculty profiles.' },
    { label: 'Companies Hiring Our PGDM Students', path: '/masters/recruiters' },
    { label: 'Summer Internship', path: '/masters/internships' },
    { label: 'Student Testimonials', path: '/masters/testimonials' },
  ] },
  {
    id: 'seo',
    label: 'SEO Studio',
    icon: 'chart',
    path: '/seo',
    children: [
      {
        label: 'SEO Studio',
        path: '/seo',
        description: 'Overview, page-wise SEO, global settings, tracking & custom code, robots.txt & sitemaps, and SEO audit.',
      },
    ],
  },
  {
    id: 'enquiries',
    label: 'Enquiries',
    icon: 'inbox',
    children: [
      { label: 'Career', path: '/enquiries/career', description: 'Faculty and staff career applications.' },
      { label: 'Enquiry', path: '/enquiries/enquiry', description: 'Course and website contact enquiries.' },
      { label: 'Application', path: '/enquiries/application', description: 'Online PGDM admission applications.' },
    ],
  },
  {
    id: 'access',
    label: 'Access',
    icon: 'settings',
    children: [{ label: 'Users', path: '/access/users', description: 'Manage admin accounts.' }, { label: 'Roles', path: '/access/roles', description: 'Manage roles and permissions.' }],
  },
  {
    id: 'settings',
    label: 'Settings',
    icon: 'settings',
    children: [
      { label: 'Global Settings', path: '/settings/global', description: 'Website-wide configuration.' },
      { label: 'Enquire Now', path: '/settings/enquire-now', description: 'Global Enquire Now section content.' },
      { label: 'Contact Details', path: '/settings/contact', description: 'Public contact information.' },
      { label: 'Footer', path: '/settings/footer', description: 'Footer content and links.' },
      { label: 'My Profile', path: '/settings/profile', description: 'Admin account settings.' },
    ],
  },
];

function collectMenuLeaves(nodes: AdminMenuNode[]): AdminMenuLink[] {
  return nodes.flatMap((n) => (isMenuLeaf(n) ? [n] : collectMenuLeaves(n.children)));
}

/** Every leaf CMS route in menu order (for global search / shortcuts). */
export function getAllAdminMenuLinks(): AdminMenuLink[] {
  return adminMenu.flatMap((group) => (group.children ?? []).flatMap((item) => (isMenuLeaf(item) ? [item] : collectMenuLeaves(item.children))));
}

/** Rich rows for command-palette style search (grouped + subtitles). */
export type AdminSearchIndexEntry = {
  path: string;
  title: string;
  subtitle: string;
  categoryLabel: string;
  categoryOrder: number;
  /** Lowercase blob for matching */
  searchBlob: string;
};

const SEARCH_CATEGORY_ORDER: Record<string, number> = {
  dashboard: 0,
  pages: 1,
  masters: 2,
  seo: 3,
  enquiries: 4,
  settings: 5,
};

const SEARCH_CATEGORY_LABEL: Record<string, string> = {
  dashboard: 'Dashboard',
  pages: 'Website pages',
  masters: 'Slider masters',
  seo: 'SEO studio',
  enquiries: 'Enquiries',
  settings: 'Settings',
};

function pushSearchEntries(
  group: AdminMenuGroup,
  breadcrumb: string,
  nodes: AdminMenuNode[],
  categoryLabel: string,
  categoryOrder: number,
  out: AdminSearchIndexEntry[]
) {
  for (const n of nodes) {
    if (isMenuLeaf(n)) {
      const searchBlob = [n.label, n.description, breadcrumb, categoryLabel, group.label].filter(Boolean).join(' ').toLocaleLowerCase();
      out.push({ path: n.path, title: n.label, subtitle: breadcrumb, categoryLabel, categoryOrder, searchBlob });
    } else {
      pushSearchEntries(group, `${breadcrumb} · ${n.label}`, n.children, categoryLabel, categoryOrder, out);
    }
  }
}

export function getAdminSearchIndex(): AdminSearchIndexEntry[] {
  const out: AdminSearchIndexEntry[] = [];
  for (const group of adminMenu) {
    const categoryOrder = SEARCH_CATEGORY_ORDER[group.id] ?? 50;
    const categoryLabel = SEARCH_CATEGORY_LABEL[group.id] ?? group.label;
    for (const child of group.children ?? []) {
      if (isMenuLeaf(child)) {
        const title = group.id === 'dashboard' && child.path === '/' ? 'Dashboard' : child.label;
        const subtitle = group.id === 'dashboard' && child.path === '/' ? 'Overview' : group.label;
        const searchBlob = [title, child.description, subtitle, categoryLabel, group.label].filter(Boolean).join(' ').toLocaleLowerCase();
        out.push({ path: child.path, title, subtitle, categoryLabel, categoryOrder, searchBlob });
        continue;
      }
      pushSearchEntries(group, child.label, child.children, categoryLabel, categoryOrder, out);
    }
  }
  return out;
}

export function normalizeMenuPath(p: string) {
  const t = p.replace(/\/$/, '');
  return t === '' ? '/' : t;
}

type ExactHit = { page: AdminMenuLink; openSectionKeys: string[] };

function findExactInNodes(groupId: string, nodes: AdminMenuNode[], normalized: string, trail: string[]): ExactHit | undefined {
  for (const n of nodes) {
    if (isMenuLeaf(n)) {
      if (normalizeMenuPath(n.path) === normalized) {
        return { page: n, openSectionKeys: trail.map((label, i) => branchSectionKey(groupId, trail.slice(0, i), label)) };
      }
    } else {
      const nextTrail = [...trail, n.label];
      const found = findExactInNodes(groupId, n.children, normalized, nextTrail);
      if (found) return found;
    }
  }
  return undefined;
}

type PrefixHit = {
  group: (typeof adminMenu)[number];
  section: string;
  page: AdminMenuLink;
  len: number;
  openSectionKeys: string[];
};

function collectPrefixHits(
  group: (typeof adminMenu)[number],
  sectionRoot: string,
  nodes: AdminMenuNode[],
  normalized: string,
  out: PrefixHit[],
  branchTrail: string[] = [],
  keyTrail: string[] = []
) {
  const section = branchTrail.length ? `${sectionRoot} › ${branchTrail.join(' › ')}` : sectionRoot;
  for (const n of nodes) {
    if (isMenuLeaf(n)) {
      const p = normalizeMenuPath(n.path);
      if (normalized !== '/' && normalized.startsWith(`${p}/`)) {
        const openSectionKeys = keyTrail.map((label, i) => branchSectionKey(group.id, keyTrail.slice(0, i), label));
        out.push({ group, section, page: n, len: p.length, openSectionKeys });
      }
    } else {
      collectPrefixHits(group, sectionRoot, n.children, normalized, out, [...branchTrail, n.label], [...keyTrail, n.label]);
    }
  }
}

/** Resolve active menu item; supports nested master routes (/masters/hero/new, …/:n/edit). */
export function findAdminPage(path: string) {
  const normalized = normalizeMenuPath(path);
  for (const group of adminMenu) {
    for (const child of group.children ?? []) {
      if (isMenuLeaf(child)) {
        const p = normalizeMenuPath(child.path);
        if (p === normalized) {
          const sectionKey = `${group.id}:${child.label}`;
          return { group, section: child.label, page: child, sectionKey, openSectionKeys: [sectionKey] };
        }
      } else {
        const hit = findExactInNodes(group.id, child.children, normalized, [child.label]);
        if (hit) {
          const openSectionKeys = hit.openSectionKeys;
          const lastTrail = (() => {
            function trailOf(nodes: AdminMenuNode[], target: string, acc: string[]): string[] | undefined {
              for (const n of nodes) {
                if (isMenuLeaf(n)) {
                  if (normalizeMenuPath(n.path) === target) return acc;
                } else {
                  const t = trailOf(n.children, target, [...acc, n.label]);
                  if (t) return t;
                }
              }
              return undefined;
            }
            return trailOf(child.children, normalized, []) ?? [];
          })();
          const section =
            lastTrail.length > 0 ? `${child.label} › ${lastTrail.join(' › ')}` : child.label;
          return { group, section, page: hit.page, sectionKey: openSectionKeys[openSectionKeys.length - 1], openSectionKeys };
        }
      }
    }
  }
  const prefixHits: PrefixHit[] = [];
  for (const group of adminMenu) {
    for (const child of group.children ?? []) {
      if (!isMenuLeaf(child)) {
        collectPrefixHits(group, child.label, child.children, normalized, prefixHits, [], [child.label]);
      } else if (group.path && normalizeMenuPath(child.path) === normalizeMenuPath(group.path) && normalized.startsWith(`${normalizeMenuPath(group.path)}/`)) {
        prefixHits.push({ group, section: child.label, page: child, len: normalizeMenuPath(group.path).length, openSectionKeys: [`${group.id}:${child.label}`] });
      }
    }
  }
  if (prefixHits.length === 0) return undefined;
  prefixHits.sort((a, b) => b.len - a.len);
  const best = prefixHits[0];
  return {
    group: best.group,
    section: best.section,
    page: best.page,
    sectionKey: best.openSectionKeys[best.openSectionKeys.length - 1],
    openSectionKeys: best.openSectionKeys,
  };
}

/** Leaf menu path for the current URL (handles /masters/hero/new, …/1/edit, etc.). */
export function getActiveAdminMenuPath(pathname: string): string | undefined {
  return findAdminPage(pathname)?.page.path;
}
