// AICTE PGDM page (/our-academics/aicte-pgdm-courses-in-mumbai/) CMS content.
// Initial values mirror the page's current static content. Persisted edits take precedence.

import { academicPageFaqDefault } from './academic-faq.js';
import { homeDefaults, homeMasterDefaults } from './home.js';

export type AcademicsImage = { src: string; alt: string; width: number; height: number };

export type AcademicsVideoItem = {
  image: AcademicsImage;
  caption?: string;
  videoLink?: string;
  href?: string;
  enabled: boolean;
};

/** Same shape as home hero slides; one active slide drives the AICTE PGDM banner. */
export type AcademicsHeroSlide = {
  image: AcademicsImage;
  imagePosition: string;
  mobileImagePosition: string;
  title: string;
  subtitle: string;
  primaryText: string;
  primaryHref: string;
  secondaryText: string;
  secondaryHref: string;
  enabled: boolean;
};

export type AcademicsProgramVideosSection = {
  title: string;
};

const FIG = '/images/figma';
const MEDIA = '/images/media';
const APPLY_PATH = '/admissions/application-form/';
const ENQUIRY_ANCHOR = '#enquire-now';
const PAGE_PATH = '/our-academics/aicte-pgdm-courses-in-mumbai/';

export const academicsDefaults = {
  /** Breadcrumb trail only; banner imagery and CTAs are edited in Page Banner (slider master). */
  hero: {
    breadcrumb: [
      { label: 'Home', href: '/' },
      { label: 'Academics', href: PAGE_PATH },
      { label: 'PGDM – Post Graduate Diploma In Management', href: '' },
    ],
  },
  tabs: {
    links: [
      { label: 'About Program', anchor: 'about-program' },
      { label: 'Program Videos', anchor: 'program-videos' },
      { label: 'Why VSM', anchor: 'why-vsm' },
      { label: 'Gallery', anchor: 'gallery' },
      { label: 'Events', anchor: 'events' },
      { label: 'Curriculum', anchor: 'curriculum' },
      { label: 'Faculties', anchor: 'faculties' },
      { label: 'Fees', anchor: 'fees' },
      { label: 'Admission Procedure', anchor: 'admission-procedure' },
    ],
  },
  glance: {
    title: 'At a Glance',
    facts: [
      { label: 'Full Time', value: '2 Years +' },
      { label: 'Fees', value: 'INR 50,000/-' },
      { label: 'Starting Campus', value: 'Mumbai, Maharashtra' },
    ],
    buttonText: 'Apply Now',
    buttonHref: APPLY_PATH,
    brochureText: 'Download Brochure',
    brochureHref: ENQUIRY_ANCHOR,
    contactText: 'Contact Us',
    contactHref: '/contact-us/',
  },
  about: {
    eyebrow: 'About Program',
    title: 'AICTE-Approved PGDM Courses In Mumbai',
    /** Rich HTML for all intro copy (replaces legacy `paragraphs` + `{link}` + linkLabel/linkHref). */
    body:
      '<p>Looking for PGDM Courses in Mumbai? Post Graduate Diploma in Management (PGDM) is a 2 Year Regular AICTE-approved PGDM programme in Mumbai with a more practical approach and Industry oriented. The curriculum of the PGDM course is designed with an aim to impart Management training programs amongst the students by following up with rigorous case studies and Value-Added Guest Sessions by the Industry Leaders to prepare the students for the Industry.</p>' +
      '<p>PGDM is a 2-year management post graduate diploma programme offered by autonomous B-Schools recognized by AICTE that focuses on providing practical knowledge of management. PGDM stands for Postgraduate Diploma in Management and is equivalent to MBA. The full time <a href="https://collegedunia.com/college/63393-valia-school-of-management-vsm-mumbai" target="_blank" rel="noopener noreferrer">PGDM program</a> offers more room for practical application and experiential based learning as compare to theoretical learning in MBA/ MMS.</p>' +
      '<p>If you are looking for PGDM in Mumbai, our institute offers comprehensive programs designed to prepare students for successful careers in management. With a focus on practical training and industry relevance, our PGDM Courses in Mumbai provide students with the skills and knowledge needed to excel in today’s competitive business environment.</p>',
  },
  'program-videos': {
    title: 'PGDM Program Video',
  },
  why: {
    title: 'Why Choose VSM',
    image: { src: `${FIG}/academics-why.webp`, alt: 'VSM students looking at the Dubai skyline', width: 1672, height: 941 },
    items: [
      { icon: `${FIG}/why-icon-globe.svg`, iconSize: 40, text: 'International immersion to Dubai' },
      { icon: `${FIG}/why-icon-art.svg`, iconSize: 42, text: 'State-of-the-art infrastructure campus in Western Mumbai Suburb' },
      { icon: `${FIG}/why-icon-mentor-2.svg`, iconSize: 46, text: 'Eminent Faculty and experienced Corporate Mentors from Academia & Industry' },
      { icon: `${FIG}/why-icon-curriculum-2.svg`, iconSize: 44, text: 'Industry Recognized curriculum' },
      { icon: `${FIG}/why-icon-book.svg`, iconSize: 37, text: 'Study from Harvard Business Publishing Reference Materials' },
      { icon: `${FIG}/why-icon-placement-2.svg`, iconSize: 33, text: '100% Internships and Placement Assistance' },
    ],
  },
  gallery: {
    title: 'Life @ VSM',
  },
  events: {
    title: 'Upcoming Events',
  },
  internships: {
    title: homeDefaults.internships.title,
  },
  testimonials: {
    title: homeDefaults.testimonials.title,
    eyebrow: homeDefaults.testimonials.eyebrow,
  },
  curriculum: {
    title: 'Academic Curriculum',
    intro:
      'The AICTE Approved PGDM course in Mumbai is designed to develop conceptual knowledge and behavioral skills across 4 Terms, spread over 24 Months duration of regular Classroom Learning.',
    years: [
      {
        year: 'Year 1+',
        columns: ['Foundation', 'Semester-I', 'Semester-II'],
        rows: [
          {
            label: '',
            cells: [
              'Learning Management (0.5)\nFinancial Accounting (1)\nBasics of Communication (0.5)\nQuantitative Skills (0.5)\nBasics of Economics (0.5)\nTechnology for Managers (0.5)\nCase Based Learning (0.5)',
              'Marketing Management I (3)\nPeople Management (3)\nFinancial Statement Analysis (3)\nManagerial Communication & Personal Effectiveness (3)\nBusiness Statistics and Analysis (3)\nDesign Thinking (3)\nOperations Management (3)',
              'Marketing Management II (3)\nHuman Resource Management (3)\nBusiness Environment (3)\nFinancial Management (3)\nLegal Aspects of Business (2)\nCross Cultural Management (2)\nIntroduction to Financial Markets (2)\nDecision Science (3)\nSustainable Business Strategy (3)\nNew Business Technology (3)\nSocial Projects (1)',
            ],
          },
          { label: 'Non-Credit Courses', cells: ['Outbound Training*', 'Critical Analytical Thinking* Current Affairs* Microsoft Excel*', 'Programming Python* Emotional Intelligence*'] },
          { label: 'Total Credits', cells: ['4', '24', '28'] },
          { label: 'Total Courses', cells: ['7', '8', '9'] },
          { label: '', cells: ['', '', 'Summer Internship (2)'] },
        ],
        totalLabel: 'Year Total Credits',
        totalValue: '57',
        note: '',
      },
      {
        year: 'Year 2+',
        columns: ['Semester III', 'Semester IV'],
        rows: [
          { label: 'Compulsory Courses', cells: ['International Business (3)\nDriving Digital Strategy (3.0)', 'Corporate Governance and Ethics (3)'] },
          {
            label: 'Finance Area',
            cells: [
              'Financial Modelling & Equity Research (3)\nSecurity Analysis & Portfolio Management (3)\nCorporate Valuation & Mergers and Acquisitions (3)\nFinancial Derivatives (3)\nFinancial Analytics (3)',
              'Digital Financial Systems (3)\nInternational Finance (3)\nManagement of Financial Services (3)\nCorporate Law (3)\nCredit Rating and Credit Analysis (3)',
            ],
          },
          {
            label: 'Marketing Area',
            cells: [
              'Consumer Behaviour (3)\nSales and Distribution Management (3)\nIntegrated Marketing Communication (3)\nManaging Retail Business (3)\nMarketing Analytics (3)',
              'Marketing by Numbers (3)\nMarket Research (3)\nSales Promotion (3)\nSocial Media & Digital Marketing (3)\nNew Product Creation & Brand Development (3)',
            ],
          },
          {
            label: 'Human Resource Area',
            cells: [
              'Industrial Relation & Labour Laws (3)\nCompensation & Benefits (3)\nHuman Resource Planning (3)\nTalent Management (3)\nHR Analytics (3)',
              'International HRM (3)\nInclusion & Diversity (3)\nCompetency Mapping (3)\nOD & Change Management (3)\nTraining & Development (3)',
            ],
          },
          {
            label: 'Business Analytics Area',
            cells: [
              'Data Science with Python (3)\nSQL for Data Analysis (3)\nBig Data Analytics (3)\nPower BI (3)\nMachine Learning (3)',
              'Data Science with R (3)\nFinancial Analytics (3)\nMarketing Analytics (3)\nHR Analytics (3)\nOperation Analytics (3)',
            ],
          },
          {
            label: 'Operations & Supply Chain Management',
            cells: [
              'Logistics Management\nWarehouse Management\nGlobal Supply Chain Management\nService Operations\nOperations Analytics',
              'Manufacturing Resource Planning & Control\nProduction Planning and Control\nPurchase and Materials Management\nLean Management\nOperations Strategy',
            ],
          },
          { label: 'Total Credits', cells: ['21', '18'] },
          { label: 'Total Courses', cells: ['7', '6'] },
          { label: '', cells: ['', 'Capstone Project 6'] },
        ],
        totalLabel: 'Year Total Credits',
        totalValue: '45',
        note: '',
      },
    ],
  },
  faculty: {
    eyebrow: 'Our Faculties',
    title: 'Meet Our Industry-Oriented PGDM Faculty',
  },
  eligibility: {
    title: 'Pgdm Course Eligibility',
    criteria: [
      {
        text: 'Any Graduate with 50% and above passing from a recognized University. (45% for SC / ST Category)',
        icon: { src: '/images/icons/graduate.svg', alt: 'PGDM eligibility', width: 68, height: 68 },
      },
      {
        text: 'Minimum 50 Percentile in CAT / MAT / CMAT / ATMA / MHCET / ZAT',
        icon: { src: '/images/icons/graduate.svg', alt: 'PGDM eligibility', width: 68, height: 68 },
      },
    ],
  },
  fees: {
    title: 'PGDM Program Fees 2026-28',
    columnLabel: 'Fee Structure',
    columnValue: 'Indian Nationals Students',
    rows: [
      { label: 'Application Form Fees (One Time)', amount: 'INR 2,000/-(One Time)' },
      { label: 'Admission Fees', amount: 'INR 50,000/-' },
      { label: '1st Year', amount: 'INR 3,00,000/-' },
      { label: '2nd Year', amount: 'INR 3,50,000/-' },
      { label: 'TOTAL FEES', amount: 'INR 7,00,000/-' },
    ],
    note: '* INR 50,000 Scholarship for Valia College Students',
  },
  admission: {
    title: 'PGDM Admission Procedure',
    steps: [
      { icon: `${FIG}/step-icon-1.svg`, iconSize: 40, text: 'Step 1: Apply and Submit your Application at www.vsmedu.com' },
      { icon: `${FIG}/step-icon-2.svg`, iconSize: 36, text: 'Step 2: Appear for Personal Interview' },
      { icon: `${FIG}/step-icon-3a.svg`, iconSize: 36, text: 'Step 3: Issuance of Admission Offer, Upon Selection' },
      { icon: `${FIG}/step-icon-4.svg`, iconSize: 34, text: 'Step 4: Acceptance of Admission Offer by Candidate and Payment of Admission Fees' },
    ],
  },
  advantage: {
    title: 'VSM Advantage',
    body: '<ul><li>In Education since 1961</li><li>Centrally located connected to Western &amp; Central Suburbs via Mumbai Metro</li><li>International Immersion to Dubai</li><li>State-of-the-art infrastructure campus in Western Mumbai Suburb</li><li>Industry Recognized curriculum</li><li>Eminent Faculty and experienced Corporate Mentors from Academia &amp; Industry</li><li>Case Study based learning that involves the students actively in the learning process</li><li>Students led corporate connect</li><li>Study from Harvard Business Publishing Reference Materials</li><li>Work on Live Real-World, Real-Time International Projects</li><li>Educational Tour</li><li>100% Internships and Placement Assistance</li><li>Tie-up with leading banks for Education Loan</li><li>Affordable Fees – Installment available</li><li>Scholarships for Valia Degree College</li></ul>',
  },
  /** FAQ at the bottom of this page (`academics.faq` in DB) — independent of Home FAQ. */
  faq: structuredClone(academicPageFaqDefault),
};

const mediaItem = (src: string, alt: string, width: number, height: number, caption = '', href = ''): AcademicsVideoItem => ({
  image: { src, alt, width, height },
  caption,
  href,
  enabled: true,
});

const eventsMediaItem = (src: string, alt: string, width: number, height: number, videoLink = '', href = ''): AcademicsVideoItem => ({
  image: { src, alt, width, height },
  videoLink,
  href,
  enabled: true,
});

export const academicsMasterDefaults = {
  hero: {
    items: [
      {
        image: { src: `${FIG}/academics-banner.webp`, alt: 'PGDM graduates celebrating at Valia School of Management', width: 1918, height: 820 },
        imagePosition: '70% 100%',
        mobileImagePosition: '78% 50%',
        title: 'PGDM – Post Graduate Diploma In Management',
        subtitle: 'Navigating Today’s Business World with Tomorrow’s Leaders',
        primaryText: 'Apply Now',
        primaryHref: APPLY_PATH,
        secondaryText: 'Enquire now',
        secondaryHref: ENQUIRY_ANCHOR,
        enabled: true,
      },
    ] as AcademicsHeroSlide[],
  },
  'program-videos': {
    items: [
      { ...mediaItem(`${MEDIA}/program-video-1.webp`, 'PGDM classroom session at Valia School of Management', 790, 454, 'PGDM classroom session at Valia School of Management'), videoLink: '' },
      { ...mediaItem(`${MEDIA}/program-video-2.webp`, 'Guest speaker at Valia School of Management', 790, 454, 'Guest speaker at Valia School of Management'), videoLink: '' },
      { ...mediaItem(`${MEDIA}/program-video-1.webp`, 'Valia School of Management PGDM program video', 790, 454, 'Valia School of Management PGDM program video'), videoLink: '' },
    ] as AcademicsVideoItem[],
  },
  gallery: {
    items: [
      { ...mediaItem(`${FIG}/life-vsm.webp`, 'Valia School of Management students outside the campus building', 768, 432), videoLink: '' },
      { ...mediaItem(`${FIG}/life-vsm.webp`, '', 768, 432), videoLink: '' },
      { ...mediaItem(`${FIG}/life-vsm.webp`, '', 768, 432), videoLink: '' },
    ] as AcademicsVideoItem[],
  },
  events: {
    items: [
      eventsMediaItem(`${MEDIA}/program-video-1.webp`, 'PGDM classroom session at Valia School of Management', 790, 454),
      eventsMediaItem(`${MEDIA}/program-video-2.webp`, 'Guest speaker at Valia School of Management', 790, 454),
      eventsMediaItem(`${FIG}/event-silvassa.webp`, 'Students at the Silvassa industrial visit', 768, 432),
    ] as AcademicsVideoItem[],
  },
  internships: homeMasterDefaults.internships,
  testimonials: homeMasterDefaults.testimonials,
};

/** Section and master names shown in the CMS, in the order they appear on the page. */
export const academicsLabels = {
  hero: 'Page Banner Breadcrumb',
  tabs: 'Section Navigation Tabs',
  glance: 'At a Glance',
  about: 'About Program',
  'program-videos': 'PGDM Program Videos',
  why: 'Why Choose VSM',
  gallery: 'Life @ VSM Gallery',
  events: 'Upcoming Events',
  internships: 'Summer Internships',
  testimonials: 'Student Testimonials',
  curriculum: 'Academic Curriculum',
  faculty: 'Faculty',
  eligibility: 'Course Eligibility',
  fees: 'Program Fees',
  admission: 'Admission Procedure',
  advantage: 'VSM Advantage',
  faq: 'FAQ (AICTE Page)',
};

/** Masters whose captions are required (shown under each slide on the page). */
export const academicsCaptionRequired: AcademicsMasterKey[] = ['program-videos'];

export type AcademicsContent = typeof academicsDefaults;
export type AcademicsMasters = typeof academicsMasterDefaults;
export type AcademicsKey = keyof AcademicsContent;
export type AcademicsMasterKey = keyof AcademicsMasters;
