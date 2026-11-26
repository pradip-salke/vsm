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

export const ContactPageSchema = z.object({
  breadcrumbLabel: z.string().trim().min(1).max(100).default('Contact'),
  hero: z.object({
    title: z.string().trim().min(1).max(200).default('Get in Touch with VSM'),
    subtitle: z.string().trim().max(300).default("We're Here to Answer Your Queries"),
    image: z.object({
      src: z.string().trim().min(1).max(500).default('/images/figma/academics-banner.webp'),
      alt: z.string().trim().max(300).default('PGDM graduates celebrating at Valia School of Management'),
      width: z.number().int().positive().default(1918),
      height: z.number().int().positive().default(820),
    }).default({ src: '/images/figma/academics-banner.webp', alt: 'PGDM graduates celebrating at Valia School of Management', width: 1918, height: 820 }),
    imagePosition: z.string().trim().max(100).default('70% 100%'),
    mobileImagePosition: z.string().trim().max(100).default('78% 50%'),
    applyText: z.string().trim().max(100).default('Apply Now'),
    applyHref: z.string().trim().max(500).default('/admissions/application-form/'),
    enquireText: z.string().trim().max(100).default('Enquire now'),
    enquireHref: z.string().trim().max(500).default('mailto:admissions@vsmedu.in'),
  }).default({
    title: 'Get in Touch with VSM', subtitle: "We're Here to Answer Your Queries",
    image: { src: '/images/figma/academics-banner.webp', alt: 'PGDM graduates celebrating at Valia School of Management', width: 1918, height: 820 },
    imagePosition: '70% 100%', mobileImagePosition: '78% 50%', applyText: 'Apply Now', applyHref: '/admissions/application-form/',
    enquireText: 'Enquire now', enquireHref: 'mailto:admissions@vsmedu.in',
  }),
  intro: z.string().trim().max(5000).default('At Valia School of Management, we’re always open to your questions, suggestions, and feedback. Whether you’re a prospective student, a parent, or just curious about our programs, our team is here to provide you with the information you need. Reach out to us within our working hours, and we’ll be more than happy to assist you.'),
  closing: z.string().trim().max(5000).default('Feel free to contact us during our working hours, and we’ll ensure your queries are addressed promptly. Your journey towards excellence in management education starts here, and we’re excited to guide you through every step of the way.'),
  mapEmbedUrl: z.string().trim().url().max(2000).default('https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d15077.700395413956!2d72.81570538587455!3d19.132860685866014!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3be7c90a5cf14ec3%3A0x43e2ef0e96af06f9!2sValia%20School%20of%20Management!5e0!3m2!1sen!2sin!4v1739169921810!5m2!1sen!2sin'),
  locations: z.object({
    andheri: z.string().trim().max(1000).default('5th Floor, Valia College Building, Cosmopolitan Education Society Road, Andheri & D. N. Nagar Metro Station, Andheri (West), Mumbai – 400 053.'),
    borivali: z.string().trim().max(1000).default(''),
    ghatkopar: z.string().trim().max(1000).default(''),
  }).default({
    andheri: '5th Floor, Valia College Building, Cosmopolitan Education Society Road, Andheri & D. N. Nagar Metro Station, Andheri (West), Mumbai – 400 053.',
    borivali: '',
    ghatkopar: '',
  }),
  mapLinks: z.object({
    andheri: z.string().trim().url().max(2000).or(z.literal('')).default(''),
    borivali: z.string().trim().url().max(2000).or(z.literal('')).default(''),
    ghatkopar: z.string().trim().url().max(2000).or(z.literal('')).default(''),
  }).default({ andheri: '', borivali: '', ghatkopar: '' }),
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
  contactPage: ContactPageSchema.default(ContactPageSchema.parse({})),
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
      { label: 'Finance', href: '/our-academics/in-demand-specialisations/financial-management-specialisation/', openInNewTab: false },
      { label: 'Human Resources', href: '/our-academics/in-demand-specialisations/mba-pgdm-in-human-resources-mumbai/', openInNewTab: false },
      { label: 'Marketing', href: '/our-academics/in-demand-specialisations/mba-in-marketing-mumbai/', openInNewTab: false },
      { label: 'Business Analytics', href: '/our-academics/in-demand-specialisations/pgdm-in-business-analytics-mumbai/', openInNewTab: false },
      { label: 'Operations & Supply Chain Management', href: '/our-academics/in-demand-specialisations/operations-and-supply-chain-management-specialisation/', openInNewTab: false },
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
  contactPage: ContactPageSchema.parse({}),
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

