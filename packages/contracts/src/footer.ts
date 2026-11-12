import { z } from 'zod';

export const FooterLinkSchema = z.object({
  label: z.string().trim().min(1, 'Label is required').max(200),
  href: z.string().trim().min(1, 'Link URL is required').max(1000),
  openInNewTab: z.boolean().optional().default(false),
});

export const FooterPhoneSchema = z.object({
  label: z.string().trim().min(1, 'Phone label is required').max(100),
  href: z.string().trim().min(1, 'Phone link is required').max(100),
});

export const FooterSocialLinkSchema = z.object({
  key: z.string().trim().min(1).max(50),
  label: z.string().trim().min(1).max(100),
  href: z.string().trim().max(1000).nullable().default(''),
});

export const FooterContentSchema = z.object({
  about: z.object({
    logoUrl: z.string().trim().max(500).default('/images/brand/vsm-logo.svg'),
    description: z.string().trim().max(2000),
  }),
  specialisations: z.object({
    heading: z.string().trim().min(1, 'Heading is required').max(120).default('Specialisation'),
    links: z.array(FooterLinkSchema),
  }),
  aboutUs: z.object({
    heading: z.string().trim().min(1, 'Heading is required').max(120).default('About Us'),
    links: z.array(FooterLinkSchema),
    quickLinks: z.array(FooterLinkSchema),
  }),
  contacts: z.object({
    heading: z.string().trim().min(1, 'Heading is required').max(120).default('Contacts'),
    email: z.string().trim().email('Valid email is required').max(254),
    phones: z.array(FooterPhoneSchema),
    address: z.string().trim().max(1000),
  }),
  socials: z.array(FooterSocialLinkSchema).optional().default([]),
  bottomLinks: z.array(FooterLinkSchema),
  copyright: z.string().trim().max(500),
});

export type FooterContent = z.infer<typeof FooterContentSchema>;
export type FooterLink = z.infer<typeof FooterLinkSchema>;
export type FooterPhone = z.infer<typeof FooterPhoneSchema>;
export type FooterSocialLink = z.infer<typeof FooterSocialLinkSchema>;

export const footerDefaults: FooterContent = {
  about: {
    logoUrl: '/images/brand/vsm-logo.svg',
    description:
      'VSM stands not just as an educational institute but as a catalyst for future-ready leaders poised to make a meaningful impact in the business world.',
  },
  specialisations: {
    heading: 'Specialisation',
    links: [
      { label: 'PGDM in Finance', href: '/our-academics/in-demand-specialisations/financial-management-specialisation/', openInNewTab: false },
      { label: 'PGDM in Human Resources', href: '/our-academics/in-demand-specialisations/mba-pgdm-in-human-resources-mumbai/', openInNewTab: false },
      { label: 'PGDM in Marketing', href: '/our-academics/in-demand-specialisations/mba-in-marketing-mumbai/', openInNewTab: false },
      { label: 'PGDM in Business Analytics', href: '/our-academics/in-demand-specialisations/pgdm-in-business-analytics-mumbai/', openInNewTab: false },
      { label: 'PGDM in Operations & Supply Chain Management', href: '/our-academics/in-demand-specialisations/operations-and-supply-chain-management-specialisation/', openInNewTab: false },
    ],
  },
  aboutUs: {
    heading: 'About Us',
    links: [
      { label: 'About VSM', href: '/about-us/about-vsm-mba-pgdm-colleges-in-mumbai/', openInNewTab: false },
      { label: 'Our Philosophy', href: '/about-us/our-philosophy/', openInNewTab: false },
      { label: 'Academic Advisory Board', href: '/about-us/academic-advisory-board/', openInNewTab: false },
      { label: 'Trustee’s Message', href: '/about-us/trustee-message/', openInNewTab: false },
      { label: 'Vice Chairman Message', href: '/about-us/vice-chairman-message/', openInNewTab: false },
      { label: 'Director Message', href: '/about-us/director-message/', openInNewTab: false },
      { label: 'Affiliation & Industry Leadership', href: '/about-us/affiliation-industry-leadership/', openInNewTab: false },
      { label: 'Infrastructure', href: '/about-us/infrastructure/', openInNewTab: false },
      { label: 'Student Residence', href: '/about-us/student-residence/', openInNewTab: false },
      { label: 'Board of Governance', href: 'https://vsmedu.com/wp-content/uploads/2026/08/DocScanner-25-Aug-2026-3-56-pm.pdf', openInNewTab: true },
    ],
    quickLinks: [
      { label: 'Career', href: '/career/', openInNewTab: false },
      { label: 'Blogs', href: '/blogs/', openInNewTab: false },
    ],
  },
  contacts: {
    heading: 'Contacts',
    email: 'info@vsmedu.in',
    phones: [
      { label: '+91 730 434 3478', href: 'tel:+917304343478' },
      { label: '+91 730 434 3460', href: 'tel:+917304343460' },
    ],
    address: '5th Floor, Valia College Building, Cosmopolitan Education Society Road, Andheri & D. N. Nagar Metro Station, Andheri (West), Mumbai – 400 053.',
  },
  socials: [
    { key: 'facebook', label: 'Facebook', href: 'https://www.facebook.com/profile.php?id=61569771774772' },
    { key: 'x', label: 'X (Twitter)', href: 'https://twitter.com/ValiaSOM' },
    { key: 'instagram', label: 'Instagram', href: 'https://www.instagram.com/vsom_official/' },
    { key: 'linkedin', label: 'LinkedIn', href: 'https://www.linkedin.com/company/108657561/' },
    { key: 'pinterest', label: 'Pinterest', href: '' },
    { key: 'youtube', label: 'YouTube', href: 'https://www.youtube.com/@valiaschoolofmanagement' },
  ],
  bottomLinks: [
    { label: 'PGDM', href: '/our-academics/aicte-pgdm-courses-in-mumbai/', openInNewTab: false },
    { label: 'Admissions Process', href: '/admissions/mba-pgdm-admissions-process/', openInNewTab: false },
    { label: 'Application Form', href: '/admissions/application-form/', openInNewTab: false },
    { label: 'Pay Online', href: 'https://fees.easebuzz.in/cf/vsmedu-online', openInNewTab: true },
    { label: 'Students Residence', href: '/about-us/student-residence/', openInNewTab: false },
    { label: 'Testimonials', href: '/#testimonials', openInNewTab: false },
    { label: 'Admin Login', href: 'http://localhost:5173', openInNewTab: false },
  ],
  copyright: 'Copyright © 2026 | Cosmopolitan Education Society’s Valia School of Management',
};

