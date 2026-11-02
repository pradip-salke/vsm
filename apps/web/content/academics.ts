/*
 * AICTE PGDM page content. Figma leaves the Year 1 "Foundation" column blank
 * and only draws Year 1, so both years use the live vsmedu.com curriculum.
 */
import { events, lifeAtVsm, programVideos, whyChooseItems, type IconListItem } from './shared';
import type { HeroSlide, ImageAsset, MediaItem } from './types';

const FIG = '/images/figma';

export const academicsHero: HeroSlide = {
  image: { src: `${FIG}/academics-banner.webp`, alt: 'PGDM graduates celebrating at Valia School of Management', width: 1918, height: 820 },
  title: 'PGDM – Post Graduate Diploma In Management',
  subtitle: 'Navigating Today’s Business World with Tomorrow’s Leaders',
};

export const academicsBreadcrumb = [
  { label: 'Home', href: '/' },
  { label: 'Academics', href: '/our-academics/aicte-pgdm-courses-in-mumbai/' },
  { label: 'PGDM – Post Graduate Diploma In Management' },
];

export const academicsTabs = [
  { label: 'About Program', id: 'about-program' },
  { label: 'Program Videos', id: 'program-videos' },
  { label: 'Why VSM', id: 'why-vsm' },
  { label: 'Gallery', id: 'gallery' },
  { label: 'Events', id: 'events' },
  { label: 'Curriculum', id: 'curriculum' },
  { label: 'Faculties', id: 'faculties' },
  { label: 'Fees', id: 'fees' },
  { label: 'Admission Procedure', id: 'admission-procedure' },
];

export const atAGlance = [
  { label: 'Full Time', value: '2 Years +' },
  { label: 'Fees', value: 'INR 50,000/-' },
  { label: 'Starting Campus', value: 'Mumbai, Maharashtra' },
];

export const aboutProgram = {
  title: 'AICTE-Approved PGDM Courses In Mumbai',
  paragraphs: [
    'Looking for PGDM Courses in Mumbai? Post Graduate Diploma in Management (PGDM) is a 2 Year Regular AICTE-approved PGDM programme in Mumbai with a more practical approach and Industry oriented. The curriculum of the PGDM course is designed with an aim to impart Management training programs amongst the students by following up with rigorous case studies and Value-Added Guest Sessions by the Industry Leaders to prepare the students for the Industry.',
    'PGDM is a 2-year management post graduate diploma programme offered by autonomous B-Schools recognized by AICTE that focuses on providing practical knowledge of management. PGDM stands for Postgraduate Diploma in Management and is equivalent to MBA. The full time {link} offers more room for practical application and experiential based learning as compare to theoretical learning in MBA/ MMS.',
    'If you are looking for PGDM in Mumbai, our institute offers comprehensive programs designed to prepare students for successful careers in management. With a focus on practical training and industry relevance, our PGDM Courses in Mumbai provide students with the skills and knowledge needed to excel in today’s competitive business environment.',
  ],
  link: { label: 'PGDM program', href: 'https://collegedunia.com/college/63393-valia-school-of-management-vsm-mumbai' },
};

export const academicsWhyImage: ImageAsset = {
  src: `${FIG}/academics-why.webp`,
  alt: 'VSM students looking at the Dubai skyline',
  width: 1672,
  height: 941,
};

export const academicsAdvantages: IconListItem[] = whyChooseItems;

export const academicsVideos: MediaItem[] = programVideos.map((image) => ({ image }));
export const academicsGallery: MediaItem[] = lifeAtVsm.map((image) => ({ image }));
export const academicsEvents: MediaItem[] = [
  ...programVideos.slice(0, 2).map((image) => ({ image })),
  { image: events[0].image },
];

export type CurriculumCell = string | string[];
export type CurriculumTable = {
  year: string;
  columns: string[];
  rows: { label: string; cells: CurriculumCell[] }[];
  total: { label: string; value: string };
  note?: string;
};

export const curriculumIntro =
  'The AICTE Approved PGDM course in Mumbai is designed to develop conceptual knowledge and behavioral skills across 4 Terms, spread over 24 Months duration of regular Classroom Learning.';

export const curriculum: CurriculumTable[] = [
  {
    year: 'Year 1+',
    columns: ['Foundation', 'Semester-I', 'Semester-II'],
    rows: [
      {
        label: '',
        cells: [
          [
            'Learning Management (0.5)',
            'Financial Accounting (1)',
            'Basics of Communication (0.5)',
            'Quantitative Skills (0.5)',
            'Basics of Economics (0.5)',
            'Technology for Managers (0.5)',
            'Case Based Learning (0.5)',
          ],
          [
            'Marketing Management I (3)',
            'People Management (3)',
            'Financial Statement Analysis (3)',
            'Managerial Communication & Personal Effectiveness (3)',
            'Business Statistics and Analysis (3)',
            'Design Thinking (3)',
            'Operations Management (3)',
          ],
          [
            'Marketing Management II (3)',
            'Human Resource Management (3)',
            'Business Environment (3)',
            'Financial Management (3)',
            'Legal Aspects of Business (2)',
            'Cross Cultural Management (2)',
            'Introduction to Financial Markets (2)',
            'Decision Science (3)',
            'Sustainable Business Strategy (3)',
            'New Business Technology (3)',
            'Social Projects (1)',
          ],
        ],
      },
      {
        label: 'Non-Credit Courses',
        cells: ['Outbound Training*', 'Critical Analytical Thinking* Current Affairs* Microsoft Excel*', 'Programming Python* Emotional Intelligence*'],
      },
      { label: 'Total Credits', cells: ['4', '24', '28'] },
      { label: 'Total Courses', cells: ['7', '8', '9'] },
      { label: '', cells: ['', '', 'Summer Internship (2)'] },
    ],
    total: { label: 'Year Total Credits', value: '57' },
    note: 'Non-Credit Compulsory Courses: Outbound Training, Critical Analytical Thinking, Emotional Intelligence, Programming Python and Negotiation Skills.',
  },
  {
    year: 'Year 2+',
    columns: ['Semester III', 'Semester IV'],
    rows: [
      {
        label: 'Compulsory Courses',
        cells: [['International Business (3)', 'Driving Digital Strategy (3.0)'], ['Corporate Governance and Ethics (3)']],
      },
      {
        label: 'Finance Area',
        cells: [
          [
            'Financial Modelling & Equity Research (3)',
            'Security Analysis & Portfolio Management (3)',
            'Corporate Valuation & Mergers and Acquisitions (3)',
            'Financial Derivatives (3)',
            'Financial Analytics (3)',
          ],
          [
            'Digital Financial Systems (3)',
            'International Finance (3)',
            'Management of Financial Services (3)',
            'Corporate Law (3)',
            'Credit Rating and Credit Analysis (3)',
          ],
        ],
      },
      {
        label: 'Marketing Area',
        cells: [
          [
            'Consumer Behaviour (3)',
            'Sales and Distribution Management (3)',
            'Integrated Marketing Communication (3)',
            'Managing Retail Business (3)',
            'Marketing Analytics (3)',
          ],
          [
            'Marketing by Numbers (3)',
            'Market Research (3)',
            'Sales Promotion (3)',
            'Social Media & Digital Marketing (3)',
            'New Product Creation & Brand Development (3)',
          ],
        ],
      },
      {
        label: 'Human Resource Area',
        cells: [
          [
            'Industrial Relation & Labour Laws (3)',
            'Compensation & Benefits (3)',
            'Human Resource Planning (3)',
            'Talent Management (3)',
            'HR Analytics (3)',
          ],
          ['International HRM (3)', 'Inclusion & Diversity (3)', 'Competency Mapping (3)', 'OD & Change Management (3)', 'Training & Development (3)'],
        ],
      },
      {
        label: 'Business Analytics Area',
        cells: [
          ['Data Science with Python (3)', 'SQL for Data Analysis (3)', 'Big Data Analytics (3)', 'Power BI (3)', 'Machine Learning (3)'],
          ['Data Science with R (3)', 'Financial Analytics (3)', 'Marketing Analytics (3)', 'HR Analytics (3)', 'Operation Analytics (3)'],
        ],
      },
      {
        label: 'Operations & Supply Chain Management',
        cells: [
          ['Logistics Management', 'Warehouse Management', 'Global Supply Chain Management', 'Service Operations', 'Operations Analytics'],
          [
            'Manufacturing Resource Planning & Control',
            'Production Planning and Control',
            'Purchase and Materials Management',
            'Lean Management',
            'Operations Strategy',
          ],
        ],
      },
      { label: 'Total Credits', cells: ['21', '18'] },
      { label: 'Total Courses', cells: ['7', '6'] },
      { label: '', cells: ['', 'Capstone Project 6'] },
    ],
    total: { label: 'Year Total Credits', value: '45' },
  },
];

export const eligibility = [
  'Any Graduate with 50% and above passing from a recognized University. (45% for SC / ST Category)',
  'Minimum 50 Percentile in CAT / MAT / CMAT / ATMA / MHCET / ZAT',
];

export const fees = {
  title: 'PGDM Program Fees 2026-28',
  columns: ['Fee Structure', 'Indian Nationals Students'],
  rows: [
    ['Application Form Fees (One Time)', 'INR 2,000/-(One Time)'],
    ['Admission Fees', 'INR 50,000/-'],
    ['1st Year', 'INR 3,00,000/-'],
    ['2nd Year', 'INR 3,50,000/-'],
    ['TOTAL FEES', 'INR 7,00,000/-'],
  ],
  note: '* INR 50,000 Scholarship for Valia College Students',
};

export const admissionSteps: IconListItem[] = [
  { icon: `${FIG}/step-icon-1.svg`, iconSize: 40, text: 'Step 1: Apply and Submit your Application at www.vsmedu.com' },
  { icon: `${FIG}/step-icon-2.svg`, iconSize: 36, text: 'Step 2: Appear for Personal Interview' },
  {
    icon: `${FIG}/step-icon-3a.svg`,
    iconSize: 36,
    text: 'Step 3: Issuance of Admission Offer, Upon Selection',
    layers: [
      { src: `${FIG}/step-icon-3a.svg`, x: 0, y: 0, size: 36 },
      { src: `${FIG}/step-icon-3b.svg`, x: 20.42, y: 21.8, size: 3.46 },
      { src: `${FIG}/step-icon-3c.svg`, x: 12.12, y: 10.73, size: 3.46 },
    ],
  },
  { icon: `${FIG}/step-icon-4.svg`, iconSize: 34, text: 'Step 4: Acceptance of Admission Offer by Candidate and Payment of Admission Fees' },
];
