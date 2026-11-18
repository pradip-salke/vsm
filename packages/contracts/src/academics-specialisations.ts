// In-demand PGDM specialisation landing pages — CMS defaults (mirrors static content).
import type { AcademicPageFaq } from './academic-faq.js';
import { academicPageFaqDefault } from './academic-faq.js';
import type { AcademicsHeroSlide, AcademicsImage } from './academics.js';
import { academicTemplateSection } from './academics.js';
import { homeDefaults, homeMasterDefaults } from './home.js';

const FIG = '/images/figma';
const APPLY_PATH = '/admissions/application-form/';
const ENQUIRY_ANCHOR = '#enquire-now';
const AICTE_PATH = '/our-academics/aicte-pgdm-courses-in-mumbai/';
const NEUTRAL_ICON = '/images/figma/icon-neutral.svg';

const iconItem = (text: string, icon = NEUTRAL_ICON, iconSize = 32) => ({ icon, iconSize, text });

export type SpecTabLink = { label: string; anchor: string };

export type SpecPageMeta = {
    slug: string;
    /** Short label for CMS navigation */
    navTitle: string;
    /** Browser / SEO title segment */
    pageTitle: string;
    /** Banner slide main heading */
    heroTitle: string;
    cardIcon: AcademicsImage;
};

export type SpecPageDefaults = {
  templateSections: { sections: (typeof academicTemplateSection)[] };
  meta: SpecPageMeta;
  hero: {
    /** Earlier segments link elsewhere; the current page segment is often label-only (no link). */
    breadcrumb: { label: string; href?: string }[];
  };
  tabs: {
    links: SpecTabLink[];
  };
  glance: {
    title: string;
    facts: { label: string; value: string }[];
    buttonText: string;
    buttonHref: string;
    brochureText: string;
    brochureHref: string;
    contactText: string;
    contactHref: string;
  };
  overview: {
    eyebrow: string;
    title: string;
    body: string;
  };
  why?: {
    title: string;
    intro?: string;
    itemsTitle?: string;
    itemsIntro?: string;
    outro?: string;
    items: { icon: string; iconSize: number; text: string }[];
  };
  careers?: {
    title: string;
    intro: string;
    roles: { icon: string; iconSize: number; text: string }[];
    employers?: string;
  };
  curriculum?: {
    title: string;
    intro: string;
    moduleTitle?: string;
    subjects: { icon: string; iconSize: number; text: string }[];
  };
  admission?: {
    title: string;
    steps: { icon: string; iconSize: number; text: string }[];
  };
  faq: AcademicPageFaq;
  internships: { title: string };
  testimonials: typeof homeDefaults.testimonials;
};

const defaultTabs: SpecTabLink[] = [
  { label: 'Overview', anchor: 'overview' },
  { label: 'Why Choose This Specialisation', anchor: 'why-specialisation' },
  { label: 'Career Opportunities', anchor: 'career-opportunities' },
  { label: 'Curriculum', anchor: 'specialisation-curriculum' },
  { label: 'Admission Procedure', anchor: 'admission-procedure' },
];

const defaultGlance = {
  title: 'At a Glance',
  facts: [
    { label: 'Duration', value: '2 Years' },
    { label: 'Study Mode', value: 'Full Time' },
    { label: 'Location', value: 'Andheri, Mumbai' },
  ],
  buttonText: 'Apply Now',
  buttonHref: APPLY_PATH,
  brochureText: 'Download Brochure',
  brochureHref: ENQUIRY_ANCHOR,
  contactText: 'Contact Us',
  contactHref: '/contact-us/',
};

const defaultAdmissionSteps = [
  { icon: `${FIG}/step-icon-1.svg`, iconSize: 40, text: 'Step 1: Apply and Submit your Application at www.vsmedu.com' },
  { icon: `${FIG}/step-icon-2.svg`, iconSize: 36, text: 'Step 2: Appear for Personal Interview' },
  { icon: `${FIG}/step-icon-3a.svg`, iconSize: 36, text: 'Step 3: Issuance of Admission Offer, Upon Selection' },
  { icon: `${FIG}/step-icon-4.svg`, iconSize: 34, text: 'Step 4: Acceptance of Admission Offer by Candidate and Payment of Admission Fees' },
];

const pages: (Omit<SpecPageDefaults, 'internships' | 'testimonials' | 'careers' | 'curriculum' | 'admission' | 'templateSections'> & { careers?: Omit<NonNullable<SpecPageDefaults['careers']>, 'roles'> & { roles: string[] }; curriculum?: Omit<NonNullable<SpecPageDefaults['curriculum']>, 'subjects'> & { subjects: string[] }; admission?: SpecPageDefaults['admission'] })[] = [
  {
    meta: {
      slug: 'financial-management-specialisation',
      navTitle: 'Financial Management',
      pageTitle: 'PGDM in Financial Management',
      heroTitle: 'PGDM in Financial Management',
      cardIcon: { src: '/images/icons/spec-financial.svg', alt: 'Financial Management specialisation', width: 80, height: 80 },
    },
    hero: {
      breadcrumb: [
        { label: 'Home', href: '/' },
        { label: 'Academics', href: AICTE_PATH },
        { label: 'Financial Management', href: '' },
      ],
    },
    tabs: { links: defaultTabs },
    glance: defaultGlance,
    overview: {
      eyebrow: 'About Program',
      title: 'PGDM in Financial Management',
      body:
        '<p>Finance goes beyond numbers: it helps organisations understand markets, allocate capital, manage risk, and plan for sustainable growth. VSM’s PGDM in Financial Management builds practical financial judgement alongside a strong grounding in management.</p>' +
        '<p>Students learn to interpret financial information, evaluate investment opportunities, and make informed business decisions through an industry-oriented curriculum, case work, and project learning.</p>',
    },
    why: {
      title: 'Why Choose PGDM in Financial Management?',
      items: [
        'High demand across industries',
        'A wide range of finance career paths',
        'Strong analytical and decision-making skills',
        'Exposure to investment, risk, and corporate finance',
        'A foundation for long-term professional growth',
      ].map((t) => iconItem(t)),
    },
    careers: {
      title: 'Careers in Financial Management',
      intro:
        '<p>The PGDM specialisation combines management fundamentals with applied learning to prepare students for opportunities across industries.</p>',
      roles: [
        'Investment Banker',
        'Private Equity Analyst',
        'Financial Analyst',
        'Financial Manager',
        'Chief Financial Officer',
        'Accounting Manager',
        'Corporate Finance Controller',
        'Management Consultant',
        'Credit Manager',
        'Hedge Fund Manager',
      ],
    },
    curriculum: {
      title: 'Financial Management Curriculum',
      intro:
        '<p>Alongside the common PGDM foundation, students study specialisation-focused subjects and apply their learning through projects and industry exposure.</p>',
      subjects: [
        'Financial Modelling & Equity Research',
        'Security Analysis & Portfolio Management',
        'Corporate Valuation, Mergers & Acquisitions',
        'Financial Derivatives',
        'Financial Analytics',
        'Digital Financial Systems',
        'International Finance',
        'Management of Financial Services',
        'Corporate Law',
        'Credit Rating & Credit Analysis',
      ],
    },
    admission: { title: 'PGDM Admission Procedure', steps: defaultAdmissionSteps },
    faq: structuredClone(academicPageFaqDefault),
  },
  {
    meta: {
      slug: 'mba-pgdm-in-human-resources-mumbai',
      navTitle: 'Human Resource Management',
      pageTitle: 'PGDM in Human Resource Management',
      heroTitle: 'PGDM in Human Resource Management',
      cardIcon: { src: '/images/icons/spec-hr.svg', alt: 'Human Resource Management specialisation', width: 80, height: 80 },
    },
    hero: {
      breadcrumb: [
        { label: 'Home', href: '/' },
        { label: 'Academics', href: AICTE_PATH },
        { label: 'Human Resource Management', href: '' },
      ],
    },
    tabs: { links: defaultTabs },
    glance: defaultGlance,
    overview: {
      eyebrow: 'About Program',
      title: 'PGDM in Human Resource Management',
      body:
        '<p>Human Resource Management focuses on the people, culture, and systems that help organisations perform. The PGDM specialisation develops the skills to attract, support, and grow talent while aligning people practices with organisational goals.</p>' +
        '<p>The curriculum connects management foundations with practical topics such as recruitment, employee relations, learning and development, compensation, and workforce analytics.</p>',
    },
    why: {
      title: 'Why Choose PGDM in Human Resource Management?',
      items: [
        'Build a career centred on people and organisational growth',
        'Develop skills in hiring, training, and employee development',
        'Prepare for an evolving and growing profession',
        'Learn to support diverse, equitable workplaces',
        'Strengthen communication and problem-solving abilities',
      ].map((t) => iconItem(t)),
    },
    careers: {
      title: 'Careers in Human Resource Management',
      intro:
        '<p>The PGDM specialisation combines management fundamentals with applied learning to prepare students for opportunities across industries.</p>',
      roles: [
        'HR Generalist',
        'Recruitment Specialist',
        'Social Media Recruiter',
        'Compensation & Benefits Specialist',
        'Training & Development Specialist',
        'Employment & Placement Specialist',
        'Human Resources Management System Analyst',
        'Internal Communication Specialist',
      ],
    },
    curriculum: {
      title: 'Human Resource Management Curriculum',
      intro:
        '<p>Alongside the common PGDM foundation, students study specialisation-focused subjects and apply their learning through projects and industry exposure.</p>',
      subjects: [
        'People Management',
        'Human Resource Management',
        'Industrial Relations & Labour Laws',
        'Compensation & Benefits',
        'Human Resource Planning',
        'Talent Management',
        'HR Analytics',
        'International HRM',
        'Inclusion & Diversity',
        'Competency Mapping',
        'Organisation Development & Change Management',
        'Training & Development',
      ],
    },
    admission: { title: 'PGDM Admission Procedure', steps: defaultAdmissionSteps },
    faq: structuredClone(academicPageFaqDefault),
  },
  {
    meta: {
      slug: 'mba-in-marketing-mumbai',
      navTitle: 'Marketing Management',
      pageTitle: 'PGDM in Marketing Management',
      heroTitle: 'PGDM in Marketing Management',
      cardIcon: { src: '/images/icons/spec-marketing.svg', alt: 'Marketing Management specialisation', width: 80, height: 80 },
    },
    hero: {
      breadcrumb: [
        { label: 'Home', href: '/' },
        { label: 'Academics', href: AICTE_PATH },
        { label: 'Marketing Management', href: '' },
      ],
    },
    tabs: { links: defaultTabs },
    glance: defaultGlance,
    overview: {
      eyebrow: 'About Program',
      title: 'PGDM in Marketing Management',
      body:
        '<p>Marketing combines creativity, customer understanding, and analysis. VSM’s PGDM specialisation develops the ability to understand buying decisions, build brands, plan campaigns, and use market information to guide business growth.</p>' +
        '<p>Students gain exposure to current marketing practices through practical assignments, case studies, and an industry-aligned curriculum in Mumbai’s active business environment.</p>',
    },
    why: {
      title: 'Why Choose PGDM in Marketing Management?',
      items: [
        'A broad range of opportunities across sectors',
        'Fast-moving work with room for creative thinking',
        'Develop communication, teamwork, and negotiation skills',
        'Gain practical industry exposure',
        'Build skills in brand, sales, and digital marketing',
      ].map((t) => iconItem(t)),
    },
    careers: {
      title: 'Careers in Marketing Management',
      intro:
        '<p>The PGDM specialisation combines management fundamentals with applied learning to prepare students for opportunities across industries.</p>',
      roles: [
        'Sales & Marketing Representative',
        'Marketing Coordinator',
        'Customer Service Representative',
        'New Product Manager',
        'Market Research Analyst',
        'Content Manager',
        'Communication Manager',
        'Sales Manager',
        'Brand Manager',
        'Promotion Manager',
        'Marketing Manager',
        'Advertising Manager',
        'Public Relations Manager',
      ],
    },
    curriculum: {
      title: 'Marketing Management Curriculum',
      intro:
        '<p>Alongside the common PGDM foundation, students study specialisation-focused subjects and apply their learning through projects and industry exposure.</p>',
      subjects: [
        'Marketing Management',
        'Consumer Behaviour',
        'Sales & Distribution Management',
        'Integrated Marketing Communication',
        'Managing Retail Business',
        'Marketing Analytics',
        'Market Research',
        'Sales Promotion',
        'Social Media & Digital Marketing',
        'New Product Creation & Brand Development',
      ],
    },
    admission: { title: 'PGDM Admission Procedure', steps: defaultAdmissionSteps },
    faq: structuredClone(academicPageFaqDefault),
  },
  {
    meta: {
      slug: 'pgdm-in-business-analytics-mumbai',
      navTitle: 'Business Analytics',
      pageTitle: 'PGDM in Business Analytics',
      heroTitle: 'PGDM In Business Analytics',
      cardIcon: { src: '/images/icons/spec-analytics.svg', alt: 'Business Analytics specialisation', width: 80, height: 80 },
    },
    hero: {
      breadcrumb: [
        { label: 'Home', href: '/' },
        { label: 'Academics', href: AICTE_PATH },
        { label: 'Business Analytics', href: '' },
      ],
    },
    tabs: { links: defaultTabs.filter(({ anchor }) => !['why-specialisation', 'career-opportunities', 'specialisation-curriculum', 'admission-procedure'].includes(anchor)) },
    glance: defaultGlance,
    overview: {
      eyebrow: '',
      title: 'PG in Business Analytics',
      body: `<h3>Overview</h3>
<p>A PGDM in Business Analytics is a cutting-edge program that combines core management principles with data analysis techniques. Students learn to interpret data, uncover patterns, and make strategic decisions.</p>
<p>Data analytics empowers organizations to leverage the vast amounts of data available to them, extract meaningful insights, and make informed decisions. It offers numerous benefits across various aspects of business operations, helping organizations drive success and achieve their goals in a data-centric world.</p>
<p>The need to incorporate these data driven programs into management across all specialisations in imperative and the students who are going to embrace this will have a huge advantage over others.</p>`,
    },
    faq: {
      title: 'FAQ’s:',
      eyebrow: '',
      description: '',
      items: [
        { question: 'What is PGDM in Business Analytics?', answer: 'PGDM in Business Analytics is a specialized postgraduate program focused on developing expertise in analyzing and interpreting data to drive strategic business decisions.' },
        { question: 'What are the career prospects after completing PGDM in Business Analytics?', answer: 'Graduates can pursue roles such as data analyst, business intelligence analyst, data scientist, analytics manager, and more across various industries.' },
        { question: 'How does PGDM in Business Analytics differ from PGDM in Data Analytics?', answer: 'While both programs focus on data analysis, PGDM in Business Analytics often incorporates business strategy and decision-making aspects, whereas PGDM in Data Analytics may have a more technical focus.' },
        { question: 'What support services are available to PGDM students during and after the program at VSM?', answer: 'Valia School of Management offers career counseling, job placement assistance, alumni networks, and continuous learning opportunities to support students’ professional growth and development.' },
      ],
      buttonText: '',
      buttonHref: '',
    },
  },
  {
    meta: {
      slug: 'operations-and-supply-chain-management-specialisation',
      navTitle: 'Operations & Supply Chain',
      pageTitle: 'PGDM in Operations & Supply Chain Management',
      heroTitle: 'PGDM in Operations & Supply Chain Management',
      cardIcon: { src: '/images/icons/spec-operations.svg', alt: 'Operations & Supply Chain specialisation', width: 80, height: 80 },
    },
    hero: {
      breadcrumb: [
        { label: 'Home', href: '/' },
        { label: 'Academics', href: AICTE_PATH },
        { label: 'Operations & Supply Chain Management', href: '' },
      ],
    },
    tabs: { links: defaultTabs.filter((tab) => !['career-opportunities', 'specialisation-curriculum', 'admission-procedure'].includes(tab.anchor)) },
    glance: defaultGlance,
    overview: {
      eyebrow: 'About Program',
      title: 'PGDM in Operations & Supply Chain Management',
      body:
        '<p>Operations and supply chain management covers the flow of goods, services, information, and resources from sourcing through delivery. Professionals in this area improve productivity, quality, cost control, and customer outcomes.</p>' +
        '<p>VSM’s industry-focused specialisation introduces logistics, procurement, quality control, project management, demand forecasting, and modern supply chain technologies. Mumbai’s manufacturing, retail, logistics, and service sectors offer a strong context for this learning.</p>',
    },
    why: {
      title: 'Why Choose PGDM in Operations & Supply Chain Management?',
      items: [
        'Learn to improve processes and operational performance',
        'Develop practical problem-solving and decision-making skills',
        'Understand logistics, procurement, and demand planning',
        'Build expertise relevant to manufacturing, retail, and services',
        'Prepare for careers in a globally connected supply network',
      ].map((t) => iconItem(t)),
    },

    faq: structuredClone(academicPageFaqDefault),
  },
];

function buildDocuments(): Record<string, SpecPageDefaults> {
  return Object.fromEntries(pages.map(({ careers, curriculum, ...page }) => [page.meta.slug, {
    ...page,
    templateSections: { sections: [] },
    ...(careers ? { careers: { ...careers, roles: careers.roles.map(text => iconItem(text)) } } : {}),
    ...(curriculum ? { curriculum: { ...curriculum, subjects: curriculum.subjects.map(text => iconItem(text)) } } : {}),
    internships: { title: 'Summer Internship 2025-27' },
    testimonials: structuredClone(homeDefaults.testimonials),
  }]));
}

function buildMasters(): Record<string, {
  hero: { items: AcademicsHeroSlide[] };
  internships: typeof homeMasterDefaults.internships;
  testimonials: typeof homeMasterDefaults.testimonials;
}> {
  const slideBase = (
    heroTitle: string
  ): AcademicsHeroSlide => ({
    image: { src: `${FIG}/academics-banner.webp`, alt: 'Valia School of Management students', width: 1918, height: 820 },
    imagePosition: '70% 100%',
    mobileImagePosition: '78% 50%',
    title: heroTitle,
    subtitle: heroTitle === 'PGDM In Business Analytics'
      ? "Navigating Today's Business World with Tomorrow's Leaders"
      : 'Navigating Today’s Business World with Tomorrow’s Leaders',
    primaryText: 'Apply Now',
    primaryHref: APPLY_PATH,
    secondaryText: 'Enquire now',
    secondaryHref: ENQUIRY_ANCHOR,
    enabled: true,
  });

  return Object.fromEntries(
    pages.map((p) => [
      p.meta.slug,
      {
        hero: {
          items: [slideBase(p.meta.heroTitle)],
        },
        internships: structuredClone(homeMasterDefaults.internships),
        testimonials: structuredClone(homeMasterDefaults.testimonials),
      },
    ])
  );
}

export const academicsSpecialisationDefaults = buildDocuments();

export const academicsSpecialisationMasterDefaults = buildMasters();

export const academicsSpecialisationIndex = pages.map((p) => ({
  slug: p.meta.slug,
  navTitle: p.meta.navTitle,
  pageTitle: p.meta.pageTitle,
}));

export type AcademicsSpecialisationSlug = (typeof pages)[number]['meta']['slug'];
