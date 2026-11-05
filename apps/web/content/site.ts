export type NavLink = { label: string; href: string };
export type NavItem = NavLink & { children?: NavLink[] };

export const ACADEMICS_PGDM_PATH = '/our-academics/aicte-pgdm-courses-in-mumbai/';
export const APPLY_PATH = '/admissions/application-form/';
export const ENQUIRY_ANCHOR = '#enquire-now';

export const contact = {
  phones: [
    { label: '+91 730 434 3478', href: 'tel:+917304343478' },
    { label: '+91 730 434 3460', href: 'tel:+917304343460' },
  ],
  phonesShort: '73043 43478 | 73043 43460',
  email: 'info@vsmedu.in',
  addressTitle: 'Valia School of Management',
  address:
    '5th Floor, Valia College Building, Cosmopolitan Education Society Road, Andheri & D. N. Nagar Metro Station, Andheri (West), Mumbai – 400 053.',
  openTime: ['Monday – Saturday:', '10:00 AM – 06:00 PM'],
};

export type SocialKey = 'facebook' | 'x' | 'instagram' | 'linkedin' | 'pinterest' | 'youtube';
/** `href: null` = profile URL not supplied yet; linked-only lists (`withUrl`) hide the icon until it is. */
export type SocialLink = { key: SocialKey; label: string; href: string | null };

export const socials: Record<SocialKey, SocialLink> = {
  facebook: { key: 'facebook', label: 'Facebook', href: 'https://www.facebook.com/profile.php?id=61569771774772' },
  x: { key: 'x', label: 'X (Twitter)', href: 'https://twitter.com/ValiaSOM' },
  instagram: { key: 'instagram', label: 'Instagram', href: 'https://www.instagram.com/vsom_official/' },
  linkedin: { key: 'linkedin', label: 'LinkedIn', href: 'https://www.linkedin.com/company/108657561/' },
  pinterest: { key: 'pinterest', label: 'Pinterest', href: null },
  youtube: { key: 'youtube', label: 'YouTube', href: 'https://www.youtube.com/@valiaschoolofmanagement' },
};

const withUrl = (links: SocialLink[]) => links.filter((link) => link.href);

export const topBarSocials = withUrl([socials.facebook, socials.instagram, socials.youtube]);
/** The contact card shows every icon from the design; ones without a URL render unlinked. */
export const contactCardSocials = [socials.facebook, socials.x, socials.instagram, socials.linkedin, socials.pinterest];

export const specialisationLinks: NavLink[] = [
  { label: 'Finance', href: '/our-academics/in-demand-specialisations/financial-management-specialisation/' },
  { label: 'Human Resources', href: '/our-academics/in-demand-specialisations/mba-pgdm-in-human-resources-mumbai/' },
  { label: 'Marketing', href: '/our-academics/in-demand-specialisations/mba-in-marketing-mumbai/' },
  { label: 'Business Analytics', href: '/our-academics/in-demand-specialisations/pgdm-in-business-analytics-mumbai/' },
  {
    label: 'Operations & Supply Chain Management',
    href: '/our-academics/in-demand-specialisations/operations-and-supply-chain-management-specialisation/',
  },
];

export const mainNav: NavItem[] = [
  {
    label: 'Academics',
    href: ACADEMICS_PGDM_PATH,
    children: [
      { label: 'AICTE PGDM', href: ACADEMICS_PGDM_PATH },
      { label: 'AIMA PGDM', href: '/our-academics/aima-pgdm/' },
      ...specialisationLinks.map((link) => ({ label: `PGDM in ${link.label}`, href: link.href })),
      { label: 'Faculty', href: '/faculty/' },
    ],
  },
  {
    label: 'Admissions',
    href: '/admissions/mba-pgdm-admissions-process/',
    children: [
      { label: 'Admissions Process', href: '/admissions/mba-pgdm-admissions-process/' },
      { label: 'Fees Structure', href: '/admissions/pgdm-fee-structure/' },
      { label: 'Application Form', href: APPLY_PATH },
      { label: 'Refund Policy', href: '/admissions/refund-policy/' },
    ],
  },
  {
    label: 'Placements',
    href: '/placements/',
    children: [
      { label: 'Our Recruiters', href: '/placements/our-recruiters/' },
      { label: 'Placement Records', href: '/placements/placement-records/' },
      { label: 'Connect With Us', href: '/connect-with-us/' },
    ],
  },
  {
    label: 'Events',
    href: '/events/',
    children: [
      { label: 'Photo Gallery', href: '/events/gallery/' },
      { label: 'Achievements', href: '/events/achievements/' },
      { label: 'List of Speakers', href: '/list-of-speakers/' },
      { label: 'Videos of Speakers', href: '/videos-of-speakers/' },
    ],
  },
  { label: 'Contact', href: '/contact-us/' },
];

/** Secondary links shown only in the mobile / hamburger drawer. */
export const drawerNav: NavLink[] = [
  { label: 'Committee', href: '/committee/' },
  { label: 'Anti-Ragging Policy', href: '/anti-ragging-policy/' },
];

export const aboutLinks: NavLink[] = [
  { label: 'About VSM', href: '/about-us/about-vsm-mba-pgdm-colleges-in-mumbai/' },
  { label: 'Our Philosophy', href: '/about-us/our-philosophy/' },
  { label: 'Academic Advisory Board', href: '/about-us/academic-advisory-board/' },
  { label: 'Trustee’s Message', href: '/about-us/trustee-message/' },
  { label: 'Vice Chairman Message', href: '/about-us/vice-chairman-message/' },
  { label: 'Director Message', href: '/about-us/director-message/' },
  { label: 'Affiliation & Industry Leadership', href: '/about-us/affiliation-industry-leadership/' },
  { label: 'Infrastructure', href: '/about-us/infrastructure/' },
  { label: 'Student Residence', href: '/about-us/student-residence/' },
  { label: 'Board of Governance', href: 'https://vsmedu.com/wp-content/uploads/2026/08/DocScanner-25-Aug-2026-3-56-pm.pdf' },
];

export const careerAndBlogLinks: NavLink[] = [
  { label: 'Career', href: '/career/' },
  { label: 'Blogs', href: '/blogs/' },
];

export const footer = {
  about:
    'VSM stands not just as an educational institute but as a catalyst for future-ready leaders poised to make a meaningful impact in the business world.',
  bottomLinks: [
    { label: 'PGDM', href: ACADEMICS_PGDM_PATH },
    { label: 'Admissions Process', href: '/admissions/mba-pgdm-admissions-process/' },
    { label: 'Application Form', href: APPLY_PATH },
    { label: 'Pay Online', href: '/pay-online/' },
    { label: 'Students Residence', href: '/about-us/student-residence/' },
    { label: 'Testimonials', href: '/#testimonials' },
    { label: 'Admin Login', href: process.env.NEXT_PUBLIC_ADMIN_URL ?? 'http://localhost:5173' },
  ] satisfies NavLink[],
  copyright:
    'Copyright © 2026 | Cosmopolitan Education Society’s Valia School of Management',
};
