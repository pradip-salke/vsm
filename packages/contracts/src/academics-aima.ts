// AIMA PGDM page (/our-academics/aima-pgdm/) — CMS defaults (mirrors static content; site may stay static).
import { academicPageFaqDefault } from './academic-faq.js';
import type { AcademicsHeroSlide, AcademicsImage } from './academics.js';
import { academicTemplateSection } from './academics.js';
import { homeDefaults, homeMasterDefaults } from './home.js';

const FIG = '/images/figma';
const ICON = '/images/figma/';
const NEUTRAL_ICON = `${FIG}/icon-neutral.svg`;

const APPLY_PATH = '/admissions/application-form/';
const ENQUIRY_ANCHOR = '#enquire-now';
const AICTE_PATH = '/our-academics/aicte-pgdm-courses-in-mumbai/';

export type AimaIconTextItem = { icon: string; iconSize: number; text: string };

const iconItem = (text: string, icon = NEUTRAL_ICON, iconSize = 32): AimaIconTextItem => ({
  icon,
  iconSize,
  text,
});

/** Two-column Module 1 / Module 2 rows (Year 1). */
export type AimaCoursePairRow = { left: string; right: string };

/** Year 2 specialisation table row: label + five paper cells. */
export type AimaSpecRow = { label: string; paper1: string; paper2: string; paper3: string; paper4: string; paper5: string };

export const aimaDefaults = {
  templateSections: { sections: [] as (typeof academicTemplateSection)[] },
  hero: {
    breadcrumb: [
      { label: 'Home', href: '/' },
      { label: 'Academics', href: AICTE_PATH },
      { label: 'AIMA PGDM – Post Graduate Diploma', href: '' },
    ],
  },
  tabs: {
    links: [
      { label: 'About VSM', anchor: 'about-vsm' },
      { label: 'About AIMA', anchor: 'about-aima' },
      { label: 'About PGDM', anchor: 'about-pgdm' },
      { label: 'Program Structure', anchor: 'program-structure' },
      { label: 'Specialisations', anchor: 'specialisations' },
      { label: 'Course Modules', anchor: 'course-modules' },
      { label: 'Fees', anchor: 'aima-fees' },
      { label: 'Other Details', anchor: 'other-details' },
    ],
  },
  glance: {
    title: 'At a Glance',
    facts: [
      { label: 'Duration', value: '2 Years' },
      { label: 'Study Mode', value: 'Blended' },
      { label: 'Total Fees', value: 'INR 4 Lakhs' },
    ],
    buttonText: 'Apply Now',
    buttonHref: APPLY_PATH,
    brochureText: 'Download Brochure',
    brochureHref: ENQUIRY_ANCHOR,
    contactText: 'Contact Us',
    contactHref: '/contact-us/',
  },
  'about-vsm': {
    eyebrow: 'About Program',
    title: 'About Valia School of Management',
    body:
      '<p>The Cosmopolitan Education Society, established in 1961, through VSM offers a transformative 2-year PGDM program as an AIMA – Centre for Management Education. This AICTE-approved program is designed to go beyond academic theory, providing a hands-on journey toward industry excellence.</p>' +
      '<p>Our curriculum emphasizes practical learning through rigorous case studies and valuable guest sessions led by industry experts. This immersive approach equips students with deep management knowledge and essential skills to excel in today’s dynamic business world.</p>' +
      '<p>Join us to experience one of the top AIMA-PGDM programs and launch your journey to success.</p>',
    specialisations: [
      iconItem('Banking & Financial Management (BFM)'),
      iconItem('Marketing Management (MM)'),
      iconItem('Financial Management (FM)'),
      iconItem('Human Resource Management (HRM)'),
      iconItem('Hospitality Management (HM)'),
    ],
  },
  'about-aima': {
    title: 'About AIMA',
    body:
      '<p>The All India Management Association (AIMA) is the Voice of India’s Leaders and Managers, and the apex body of the management profession in India. AIMA is a not for profit, nonlobbying organization.</p>',
    subsectionTitle: 'Why AIMA- Centre for Management Education?',
    items: [
      iconItem(
        'Founded in the year 1957, with active support of Government and Industry, AIMA is the apex body for management in the country.',
        `${ICON}why-icon-globe.svg`,
        40
      ),
      iconItem('AIMA has pioneered the concept of executive education and developed over a period of 65 years.', `${ICON}why-icon-book.svg`, 37),
      iconItem(
        'Strong Industry base which provides unique opportunity to its students to interact and learn from the top notch leaders.',
        `${ICON}why-icon-mentor-2.svg`,
        46
      ),
      iconItem(
        'Opportunity to leverage world class Management development programs, Conferences, Business summits, Management conclaves and Leader speak sessions of AIMA.',
        `${ICON}why-icon-book.svg`,
        37
      ),
      iconItem(
        'Academically rigorous curriculum, designed to meet the need of the industry and adopted for a dynamic learning experience, supported by a hybrid format of live virtual and in-person classes.',
        `${ICON}why-icon-curriculum-2.svg`,
        44
      ),
    ],
  },
  'about-pgdm': {
    title: 'About PGDM',
    body:
      '<p>PGDM – Post Graduate Diploma in Management is a two year programme approved by AICTE divided into 4 modules, with both traditional and new age specializations in HR, Marketing, Finance, Operations, IT, International business, Financial Research and valuation modelling, Digital Marketing, Business Analytics, Supply chain management and public procurement.</p>' +
      '<p>One of the most prestigious programme offered in blended mode. AIMA-PGDM is designed with the objective of nurturing the competencies of working professional and fresh graduates aspiring to work. The curriculum is aligned to cover all the management specializations in the most-flexi learning and interactive way as per the industry needs. This programme allows students to balance the work life challenges and professional management commitments.</p>',
  },
  'program-structure': {
    title: 'PGDM Program Structure',
    note: '4 Modules / Six Months each',
    items: [
      iconItem('1st Semester – 6 Papers / 2nd Semester – 6 Papers', `${ICON}why-icon-curriculum-2.svg`, 44),
      iconItem('3rd Semester (Specialisation-wise) – 5 Papers', `${ICON}why-icon-curriculum-2.svg`, 44),
      iconItem('4th Semester – 4 Papers + 1 Project Work', `${ICON}why-icon-curriculum-2.svg`, 44),
      iconItem('Total 21 Papers + Project Work in 4th Semester', `${ICON}why-icon-curriculum-2.svg`, 44),
    ],
  },
  specialisations: {
    title: 'Specialisations',
    items: [
      iconItem('Banking & Financial Management (BFM)'),
      iconItem('Marketing Management (MM)'),
      iconItem('Financial Management (FM)'),
      iconItem('Human Resource Management (HRM)'),
      iconItem('Hospitality Management (HM)'),
    ],
  },
  'course-modules': {
    year1Module1Heading: 'Module 1 – Common for all Specialisations (Exit – Certificate in Management).',
    year1Module2Heading: 'Module 2 – Common for all Specialisations (Exit – Advance Certificate in Management).',
    year1Rows: [
      { left: 'Management Functions & OB', right: 'Operations Management' },
      { left: 'Business Communication', right: 'Human Resource Management' },
      { left: 'Managerial Economics', right: 'Marketing Management' },
      { left: 'Introduction to IT', right: 'Economic and Social Environment' },
      { left: 'Financial & Management Accounting', right: 'Research Methodology' },
      { left: 'Business Statistics', right: 'Financial Management' },
    ] as AimaCoursePairRow[],
    year2Intro: 'Module 3 Specialisation-wise (Exit – Professional Certificate in Management PGDM).',
    year2Rows: [
      {
        label: 'Banking & Financial Management',
        paper1: 'Retail Banking',
        paper2: 'Banking Financial Management',
        paper3: 'Risk Management in Banks',
        paper4: 'Corporate Finance',
        paper5: 'Management of Financial Services',
      },
      {
        label: 'Marketing Management',
        paper1: 'Sales & Distribution Management',
        paper2: 'Advertising & Brand Management',
        paper3: 'International Marketing Management',
        paper4: 'Marketing of Services',
        paper5: 'Consumer Behaviour',
      },
      {
        label: 'Financial Management',
        paper1: 'Management Control Systems',
        paper2: 'Security Analysis & Portfolio Management',
        paper3: 'International Finance',
        paper4: 'Corporate Finance',
        paper5: 'Management of Financial Services',
      },
      {
        label: 'Human Resource Management',
        paper1: 'Performance Management',
        paper2: 'Training & Development',
        paper3: 'International HRM',
        paper4: 'Managing Change through Organizational Development',
        paper5: 'Managerial Leadership',
      },
      {
        label: 'Hospitality Management',
        paper1: 'Hospitality Finance and Performance Management',
        paper2: 'Services Marketing & CRM in Digital Age',
        paper3: 'Talent Management in Hospitality',
        paper4: 'Yield and Revenue Management',
        paper5: 'Strategic Management in a Global Environment',
      },
    ] as AimaSpecRow[],
    moduleFourTitle: 'Module 4 – Common for all Specialisations (Post Graduate Diploma in Management PGDM)',
    moduleFourItems: [
      iconItem('Business Law & Corporate Governance'),
      iconItem('International Business'),
      iconItem('Entrepreneurial Management'),
      iconItem('Strategic Management & Ethics'),
      iconItem('Project Work'),
    ],
  },
  fees: {
    title: 'AIMA PGDM Course Fees',
    columnLabel: 'Fee Particulars',
    columnValue: 'Fee',
    rows: [
      { label: 'Application Fees', amount: 'INR 2,000/-' },
      { label: 'Admission Fees', amount: 'INR 50,000/-' },
      { label: 'First Year Fees', amount: 'INR 1,75,000/-' },
      { label: 'Second Year Fees', amount: 'INR 1,75,000/-' },
      { label: 'Total Course Fees', amount: 'INR 4,00,000/-' },
    ],
    note: '',
  },
  'other-details': {
    title: 'Other Details',
    details: [
      iconItem('Minimum Qualification – Any Graduate'),
      iconItem('Batch size – 30'),
      iconItem('College commencing – 15th September 2025'),
      iconItem(
        'Location Advantage – Connected to Western / Central / Harbour Line – Near DN Nagar / Andheri Metro Station',
        `${ICON}why-icon-globe.svg`,
        40
      ),
      iconItem('Hybrid Mode – Regular Lectures', `${ICON}why-icon-book.svg`, 37),
      iconItem('Study Material provided', `${ICON}why-icon-book.svg`, 37),
      iconItem('Faculty – Experts from Industry', `${ICON}why-icon-mentor-2.svg`, 46),
      iconItem('Guest Speakers from industry – Level of CXO', `${ICON}why-icon-mentor-2.svg`, 46),
      iconItem('Workshops in AI & Data Science', `${ICON}why-icon-curriculum-2.svg`, 44),
      iconItem('Placement Support – Career Planning', `${ICON}why-icon-placement-2.svg`, 33),
      iconItem('Semester Pattern (4 Semesters)'),
      iconItem('Fees – Rs. 4,00,000/- (Four Lakhs for 2 years)'),
      iconItem('Easy Installment Options – Pay Easy: Semester-wise OR Monthly Installment'),
    ],
  },
  faq: structuredClone(academicPageFaqDefault),
  internships: { title: 'Summer Internship 2025-27' },
  testimonials: structuredClone(homeDefaults.testimonials),
};

export const aimaMasterDefaults = {
  internships: structuredClone(homeMasterDefaults.internships),
  testimonials: structuredClone(homeMasterDefaults.testimonials),
  hero: {
    items: [
      {
        image: { src: `${FIG}/academics-banner.webp`, alt: 'Students at Valia School of Management', width: 1918, height: 820 },
        imagePosition: '70% 100%',
        mobileImagePosition: '78% 50%',
        title: 'AIMA PGDM – Post Graduate Diploma',
        subtitle: "Navigating Today's Business World with Tomorrow's Leaders",
        primaryText: 'Apply Now',
        primaryHref: APPLY_PATH,
        secondaryText: 'Enquire now',
        secondaryHref: ENQUIRY_ANCHOR,
        enabled: true,
      },
    ] as AcademicsHeroSlide[],
  },
};

export const aimaLabels: Record<keyof typeof aimaDefaults, string> = {
  templateSections: 'Custom content sections',
  hero: 'Page Banner Breadcrumb',
  tabs: 'Section Navigation Tabs',
  glance: 'At a Glance (sidebar)',
  'about-vsm': 'About VSM',
  'about-aima': 'About AIMA',
  'about-pgdm': 'About PGDM',
  'program-structure': 'Program Structure',
  specialisations: 'Specialisations list',
  'course-modules': 'Course Modules (Year 1 & 2 tables)',
  fees: 'Course Fees Table',
  'other-details': 'Other Details',
  internships: 'Summer Internship',
  testimonials: 'Student Testimonials',
  faq: 'FAQ (AIMA Page)',
};

export const aimaMasterLabels: Record<keyof typeof aimaMasterDefaults, string> = {
  hero: 'AIMA PGDM – Page Banner',
  internships: 'AIMA PGDM – Summer Internships',
  testimonials: 'AIMA PGDM – Student Testimonials',
};

export type AimaContent = typeof aimaDefaults;
export type AimaMasters = typeof aimaMasterDefaults;
export type AimaKey = keyof AimaContent;
export type AimaMasterKey = keyof AimaMasters;
