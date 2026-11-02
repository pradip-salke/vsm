import type { HeroSlide } from './types';
import type { IconListItem } from './shared';

const FIG = '/images/figma';

export const aimaHero: HeroSlide = {
  image: { src: `${FIG}/academics-banner.webp`, alt: 'Students at Valia School of Management', width: 1918, height: 820 },
  title: 'AIMA PGDM – Post Graduate Diploma',
  subtitle: "Navigating Today's Business World with Tomorrow's Leaders",
};

export const aimaBreadcrumb = [
  { label: 'Home', href: '/' },
  { label: 'Academics', href: '/our-academics/aicte-pgdm-courses-in-mumbai/' },
  { label: 'AIMA PGDM – Post Graduate Diploma' },
];

export const aimaTabs = [
  { label: 'About VSM', id: 'about-vsm' },
  { label: 'About AIMA', id: 'about-aima' },
  { label: 'About PGDM', id: 'about-pgdm' },
  { label: 'Program Structure', id: 'program-structure' },
  { label: 'Specialisations', id: 'specialisations' },
  { label: 'Course Modules', id: 'course-modules' },
  { label: 'Fees', id: 'aima-fees' },
  { label: 'Other Details', id: 'other-details' },
  { label: 'Admission Procedure', id: 'admission-procedure' },
];

export const aimaSpecialisations = [
  'Banking & Financial Management (BFM)',
  'Marketing Management (MM)',
  'Financial Management (FM)',
  'Human Resource Management (HRM)',
  'Hospitality Management (HM)',
];

export const aimaFees = [
  ['Application Fees', 'INR 2,000/-'],
  ['Admission Fees', 'INR 50,000/-'],
  ['First Year Fees', 'INR 1,75,000/-'],
  ['Second Year Fees', 'INR 1,75,000/-'],
  ['Total Course Fees', 'INR 4,00,000/-'],
];

export const aimaYearOne = [
  ['Management Functions & OB', 'Operations Management'],
  ['Business Communication', 'Human Resource Management'],
  ['Managerial Economics', 'Marketing Management'],
  ['Introduction to IT', 'Economic and Social Environment'],
  ['Financial & Management Accounting', 'Research Methodology'],
  ['Business Statistics', 'Financial Management'],
];

export const aimaYearTwo = [
  ['Banking & Financial Management', 'Retail Banking', 'Banking Financial Management', 'Risk Management in Banks', 'Corporate Finance', 'Management of Financial Services'],
  ['Marketing Management', 'Sales & Distribution Management', 'Advertising & Brand Management', 'International Marketing Management', 'Marketing of Services', 'Consumer Behaviour'],
  ['Financial Management', 'Management Control Systems', 'Security Analysis & Portfolio Management', 'International Finance', 'Corporate Finance', 'Management of Financial Services'],
  ['Human Resource Management', 'Performance Management', 'Training & Development', 'International HRM', 'Managing Change through Organizational Development', 'Managerial Leadership'],
  ['Hospitality Management', 'Hospitality Finance and Performance Management', 'Services Marketing & CRM in Digital Age', 'Talent Management in Hospitality', 'Yield and Revenue Management', 'Strategic Management in a Global Environment'],
];

const ICON = '/images/figma/';
const NEUTRAL_ICON = `${ICON}icon-neutral.svg`;
const asIconList = (items: [text: string, icon?: string, iconSize?: number][]): IconListItem[] => items.map(([text, icon = NEUTRAL_ICON, iconSize = 32]) => ({
  icon,
  iconSize,
  text,
}));

export const aimaWhyItems = asIconList([
  ['Founded in the year 1957, with active support of Government and Industry, AIMA is the apex body for management in the country.', `${ICON}why-icon-globe.svg`, 40],
  ['AIMA has pioneered the concept of executive education and developed over a period of 65 years.', `${ICON}why-icon-book.svg`, 37],
  ['Strong Industry base which provides unique opportunity to its students to interact and learn from the top notch leaders.', `${ICON}why-icon-mentor-2.svg`, 46],
  ['Opportunity to leverage world class Management development programs, Conferences, Business summits, Management conclaves and Leader speak sessions of AIMA.', `${ICON}why-icon-book.svg`, 37],
  ['Academically rigorous curriculum, designed to meet the need of the industry and adopted for a dynamic learning experience, supported by a hybrid format of live virtual and in-person classes.', `${ICON}why-icon-curriculum-2.svg`, 44],
]);

export const aimaSpecialisationItems = asIconList(aimaSpecialisations.map((text): [string] => [text]));
export const aimaProgramStructureItems = asIconList([
  ['1st Semester – 6 Papers / 2nd Semester – 6 Papers', `${ICON}why-icon-curriculum-2.svg`, 44],
  ['3rd Semester (Specialisation-wise) – 5 Papers', `${ICON}why-icon-curriculum-2.svg`, 44],
  ['4th Semester – 4 Papers + 1 Project Work', `${ICON}why-icon-curriculum-2.svg`, 44],
  ['Total 21 Papers + Project Work in 4th Semester', `${ICON}why-icon-curriculum-2.svg`, 44],
]);
export const aimaModuleFourItems = asIconList([
  ['Business Law & Corporate Governance'],
  ['International Business'],
  ['Entrepreneurial Management'],
  ['Strategic Management & Ethics'],
  ['Project Work'],
]);

export const aimaOtherDetails = [
  'Minimum Qualification – Any Graduate',
  'Batch size – 30',
  'College commencing – 15th September 2025',
  'Location Advantage – Connected to Western / Central / Harbour Line – Near DN Nagar / Andheri Metro Station',
  'Hybrid Mode – Regular Lectures',
  'Study Material provided',
  'Faculty – Experts from Industry',
  'Guest Speakers from industry – Level of CXO',
  'Workshops in AI & Data Science',
  'Placement Support – Career Planning',
  'Semester Pattern (4 Semesters)',
  'Fees – Rs. 4,00,000/- (Four Lakhs for 2 years)',
  'Easy Installment Options – Pay Easy: Semester-wise OR Monthly Installment',
];

export const aimaOtherDetailItems = asIconList([
  [aimaOtherDetails[0]],
  [aimaOtherDetails[1]],
  [aimaOtherDetails[2]],
  [aimaOtherDetails[3], `${ICON}why-icon-globe.svg`, 40],
  [aimaOtherDetails[4], `${ICON}why-icon-book.svg`, 37],
  [aimaOtherDetails[5], `${ICON}why-icon-book.svg`, 37],
  [aimaOtherDetails[6], `${ICON}why-icon-mentor-2.svg`, 46],
  [aimaOtherDetails[7], `${ICON}why-icon-mentor-2.svg`, 46],
  [aimaOtherDetails[8], `${ICON}why-icon-curriculum-2.svg`, 44],
  [aimaOtherDetails[9], `${ICON}why-icon-placement-2.svg`, 33],
  [aimaOtherDetails[10]],
  [aimaOtherDetails[11]],
  [aimaOtherDetails[12]],
]);
export const aimaExitAwardItems = asIconList([
  ['Semester 1 (6 papers): Certificate in Management', `${ICON}why-icon-curriculum-2.svg`, 44],
  ['Semester II (6 papers) – Advance Certificate in Management', `${ICON}why-icon-curriculum-2.svg`, 44],
  ['Semester III (5 papers within specialization) – Professional Certificate in Management PGDM', `${ICON}why-icon-curriculum-2.svg`, 44],
  ['Semester IV (4 papers + Project Work) – Post Graduate Diploma in Management', `${ICON}why-icon-curriculum-2.svg`, 44],
]);
