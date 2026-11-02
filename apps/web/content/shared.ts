/*
 * Static content for sections shared by the Home and Academics pages.
 * Text comes from the Figma frames; where Figma repeats placeholder items
 * (FAQs, testimonials, faculty details) the live vsmedu.com copy is used.
 * Replace with CMS data once the public content API is populated.
 */
import { ACADEMICS_PGDM_PATH, specialisationLinks } from './site';
import type { ImageAsset } from './types';

export type { ImageAsset } from './types';

const FIG = '/images/figma';
const MEDIA = '/images/media';
const ICONS = '/images/icons';

export type FacultyMember = {
  name: string;
  role: string;
  shortRole?: string;
  image: ImageAsset;
  details: { label: string; value: string }[];
};

export const faculty: FacultyMember[] = [
  {
    name: 'Prof. Ami Upadhyaya',
    role: 'Human Resources & People Connect',
    shortRole: 'Human Resources',
    image: { src: `${FIG}/faculty-ami.webp`, alt: 'Portrait of Prof. Ami Upadhyaya', width: 1070, height: 1470 },
    details: [
      { label: 'Specialisation', value: 'Human Resource & People Connect' },
      { label: 'Total Industry / Teaching Experience', value: '18 years' },
      { label: 'Last Company Name', value: 'Sethia Infrastructure Pvt. Ltd.' },
      { label: 'Position Held', value: 'HRpreneurs (Founder)' },
      { label: 'Previous Company', value: 'Avighna India Ltd.' },
      {
        label: 'Other Companies worked with',
        value: 'HIH Realty Pvt. Ltd., PXL Soft (A Division of Monarch Group of Technologies) etc.',
      },
      { label: 'Previous Academic Assignments', value: 'Chetana’s R.K. Institute of Management and Research' },
      { label: 'Current Academic Assignments', value: 'Atharv Institute of Management Studies, MKES' },
    ],
  },
  {
    name: 'Prof. Rushi Upadhyaya',
    role: 'Legal Studies & Environmental',
    image: { src: `${FIG}/faculty-rushi.webp`, alt: 'Portrait of Prof. Rushi Upadhyaya', width: 1086, height: 1448 },
    details: [
      { label: 'Specialisation', value: 'Legal (Media & Entertainment and Corporate)' },
      { label: 'Total Industry / Teaching Experience', value: '15+ years' },
      { label: 'Last Company Name', value: 'Maddock Films Pvt. Ltd.' },
      { label: 'Position Held', value: 'Head – Legal & Business Affairs, & Standards & Practices' },
      { label: 'Previous Company', value: 'Reliance Industries Limited – JioStudios' },
      {
        label: 'Other Companies worked with',
        value: 'Sony Music, Reliance Retail (Consultant), Sony Pictures Networks, Shemaroo',
      },
      { label: 'Academic Assignments', value: 'Guest lecture at Kirit P Mehta (NMIMS)' },
    ],
  },
  {
    name: 'Dr. Shishir Sinha',
    role: 'AI & Marketing',
    image: { src: `${FIG}/faculty-shishir.webp`, alt: 'Portrait of Dr. Shishir Sinha', width: 1136, height: 1385 },
    details: [
      { label: 'Specialisation', value: 'AI & Marketing' },
      { label: 'Total Industry / Teaching Experience', value: '17 years' },
      { label: 'Last Company Name', value: 'Sage IT Inc. USA' },
      { label: 'Position Held', value: 'AVP Marketing & Industrial Relations' },
      { label: 'Previous Company', value: 'Hexaware Technologies' },
      { label: 'Other Companies worked with', value: 'Start-ups, Ogilvy, Tata Power, PCS Tech, AurionPro' },
      { label: 'Academic Assignments', value: 'Growth Consultant for start-ups and global IT organizations' },
    ],
  },
  {
    name: 'Prof. Navneet Sangha',
    role: 'Finance',
    image: { src: `${FIG}/faculty-navneet.webp`, alt: 'Portrait of Prof. Navneet Sangha', width: 1307, height: 1203 },
    details: [
      { label: 'Specialisation', value: 'Finance' },
      { label: 'Total Industry / Teaching Experience', value: '15+ years' },
      { label: 'Last Company Name', value: 'N.L. Dalmia College, Mira Road' },
      { label: 'Position Held', value: 'Academic Co-ordinator, B.Com Co-ordinator, Faculty' },
      {
        label: 'Other Institutes worked with',
        value: 'St. Xavier’s College (Empowered Autonomous Institute) Mumbai, Royal College Mira Road',
      },
      { label: 'Academic Assignments', value: 'Faculty at St. Xavier’s College, Mumbai' },
    ],
  },
];

export const facultyIntro =
  'At Valia School of Management, our esteemed faculty brings a wealth of knowledge and practical experience, shaping the leaders of tomorrow. With backgrounds spanning various industries and specialties, they offer a rich tapestry of insights, ensuring our students are not just learning the latest theories but also understanding their real-world applications.';

/**
 * Icon glyphs are single-colour SVGs rendered through CSS masks so the active
 * row can swap colours. `iconSize` is the glyph box in Figma px (badge = 77px);
 * `layers` places multi-part glyphs inside that box.
 */
export type IconListItem = {
  icon: string;
  iconSize: number;
  text: string;
  layers?: { src: string; x: number; y: number; size: number }[];
};

export const whyChooseItems: IconListItem[] = [
  { icon: `${FIG}/why-icon-globe.svg`, iconSize: 40, text: 'International immersion to Dubai' },
  { icon: `${FIG}/why-icon-art.svg`, iconSize: 42, text: 'State-of-the-art infrastructure campus in Western Mumbai Suburb' },
  {
    icon: `${FIG}/why-icon-mentor-2.svg`,
    iconSize: 46,
    text: 'Eminent Faculty and experienced Corporate Mentors from Academia & Industry',
  },
  { icon: `${FIG}/why-icon-curriculum-2.svg`, iconSize: 44, text: 'Industry Recognized curriculum' },
  { icon: `${FIG}/why-icon-book.svg`, iconSize: 37, text: 'Study from Harvard Business Publishing Reference Materials' },
  { icon: `${FIG}/why-icon-placement-2.svg`, iconSize: 33, text: '100% Internships and Placement Assistance' },
];

export const whyChooseIntro =
  'At Valia School of Management, we believe in creating a learning experience that resonates with the evolving demands of the global business environment, positioning us as one of the top PGDM college in Mumbai, renowned for our exceptional PGDM programs. Our approach is not just about imparting knowledge; it’s about shaping future leaders who are prepared for the C-Suite and beyond.';

export type Specialisation = { title: string; description: string; icon: string; href: string };

const specHref = (label: string) => specialisationLinks.find((link) => link.label === label)?.href ?? ACADEMICS_PGDM_PATH;

export const specialisations: Specialisation[] = [
  {
    title: 'Financial',
    description: 'Explore corporate finance strategies. Develop skills in investment management and financial decision-making.',
    icon: `${ICONS}/spec-financial.svg`,
    href: specHref('Finance'),
  },
  {
    title: 'Human Resource',
    description: 'Gain the human resource management and talent management expertise needed to lead people and organisations.',
    icon: `${ICONS}/spec-hr.svg`,
    href: specHref('Human Resources'),
  },
  {
    title: 'Business Analytics',
    description: 'Drive business decisions through data. Build skills in analytics, visualisation and business intelligence.',
    icon: `${ICONS}/spec-analytics.svg`,
    href: specHref('Business Analytics'),
  },
  {
    title: 'Marketing',
    description:
      'Understand markets and consumer behaviour. Lead brand management strategies, marketing campaigns and customer engagement.',
    icon: `${ICONS}/spec-marketing.svg`,
    href: specHref('Marketing'),
  },
  {
    title: 'Operations & Supply Chain Management',
    description: 'Optimise business processes for efficiency. Learn supply chain management, logistics and operations strategies.',
    icon: `${ICONS}/spec-operations.svg`,
    href: specHref('Operations & Supply Chain Management'),
  },
];

export const recruiters: ImageAsset[] = [
  { src: `${FIG}/recruiter-dcb.webp`, alt: 'DCB Bank', width: 436, height: 180 },
  { src: `${FIG}/recruiter-12.webp`, alt: 'Cielo Systems', width: 201, height: 90 },
  { src: `${FIG}/recruiter-cargosol.webp`, alt: 'Cargosol', width: 442, height: 150 },
  { src: `${FIG}/recruiter-clubmahindra.webp`, alt: 'Club Mahindra', width: 474, height: 172 },
  { src: `${FIG}/recruiter-aircon.webp`, alt: 'Airconditioning', width: 390, height: 214 },
];

export const internships: ImageAsset[] = [1, 2, 3].map((n) => ({
  src: `${MEDIA}/internship-${n}.webp`,
  alt: 'Valia School of Management: Batch 2025-27 students achieve 100% Summer Internship',
  width: 549,
  height: 620,
}));

export type Testimonial = { name: string; batch: string; quote: string; image?: ImageAsset; avatar?: ImageAsset };

const aaravImage: ImageAsset = {
  src: `${FIG}/testimonial-aarav.webp`,
  alt: 'Aarav Gupta sharing his experience at Valia School of Management',
  width: 1746,
  height: 792,
};

export const testimonials: Testimonial[] = [
  {
    name: 'Aarav Gupta',
    batch: 'PGDM: 2025–27',
    quote:
      'Valia School of Management has truly expanded my horizons. The faculty’s guidance makes complex concepts easy to grasp. Interactive sessions and industry projects enhanced my practical skills. The campus atmosphere is motivating and encourages growth. I have gained confidence through real-world learning experiences. Valia fosters not just education, but leadership and creativity. Being part of this dynamic community is inspiring every day. Proud to be growing personally and professionally at Valia.',
    image: aaravImage,
    avatar: aaravImage,
  },
  {
    name: 'Keyuri Trivedi',
    batch: 'PGDM: 2025–27',
    quote:
      'As a B.Tech graduate, choosing Valia School of Management for my PGDM has been a turning point in my academic and professional journey. The faculty combines academic depth with real industry experience, making every class practical, insightful, and engaging. Valia has truly helped me transform my engineering foundation into holistic managerial competence.',
  },
  {
    name: 'Netra Chiplunkar',
    batch: 'PGDM: 2025–27',
    quote:
      'Valia School of Management has provided me with strong guidance, practical learning, and constant encouragement. The experience here has shaped my confidence and skills in the best way. The institute has provided a motivating environment that has guided me throughout my journey. Truly thankful for this opportunity.',
  },
  {
    name: 'Pallavi Vishwakarma',
    batch: 'PGDM: 2025–27',
    quote:
      'Valia School of Management has been a catalyst for my growth. Supportive faculty help bridge theory with real-world practice. Collaborative learning and projects boost my problem-solving skills. Guest lectures add valuable insights beyond the classroom. Grateful to be part of Valia’s vibrant learning community.',
  },
  {
    name: 'Afreen Choudhary',
    batch: 'PGDM: 2025–27',
    quote:
      'As a student at Valia School of Management, I’ve had a fantastic experience so far. The faculty’s industry expertise and guidance have been invaluable, and the emphasis on practical learning. The campus facilities are excellent. Overall, Valia offers a well-rounded education and environment that fosters growth and development.',
  },
  {
    name: 'Vignesh Nandu',
    batch: 'PGDM: 2025–27',
    quote:
      'Valia School of Management has transformed my approach to learning and personal growth. Mentors here don’t just teach—they inspire us to push our boundaries and engage with real-world business scenarios. At Valia, I’m building not only my career but also my character, alongside peers who share my drive for excellence.',
  },
];

/** Shown in the testimonial media frame when a student has no video still yet. */
export const testimonialFallbackImage: ImageAsset = {
  src: `${FIG}/pgdm-video-poster.webp`,
  alt: '',
  width: 1895,
  height: 1559,
};

export type EventCard = { title: string; href: string; image: ImageAsset };

export const events: EventCard[] = [
  {
    title: 'Silvassa Industrial Visit',
    href: '/gallery/silvasa-industrial-visit/',
    image: { src: `${FIG}/event-silvassa.webp`, alt: 'Students at the Silvassa industrial visit', width: 768, height: 432 },
  },
  {
    title: 'Outbound Activity',
    href: '/gallery/outbound-activity/',
    image: { src: `${FIG}/event-outbound.webp`, alt: 'Students during the outbound activity', width: 768, height: 432 },
  },
  {
    title: 'Inauguration',
    href: '/gallery/inauguration-2025/',
    image: { src: `${FIG}/event-inauguration.webp`, alt: 'Lamp lighting at the PGDM inauguration', width: 768, height: 432 },
  },
];

export const lifeAtVsm: ImageAsset[] = [1, 2, 3].map((n) => ({
  src: `${FIG}/life-vsm.webp`,
  alt: n === 1 ? 'Valia School of Management students outside the campus building' : '',
  width: 768,
  height: 432,
}));

export const programVideos: ImageAsset[] = [
  { src: `${MEDIA}/program-video-1.webp`, alt: 'PGDM classroom session at Valia School of Management', width: 790, height: 454 },
  { src: `${MEDIA}/program-video-2.webp`, alt: 'Guest speaker at Valia School of Management', width: 790, height: 454 },
  { src: `${MEDIA}/program-video-1.webp`, alt: '', width: 790, height: 454 },
];

export type Faq = { question: string; answer: string };

export const faqs: Faq[] = [
  {
    question: 'What job roles can I get after PGDM?',
    answer:
      'PGDM graduates can pursue various roles in sectors like finance, marketing, HR, and more. VSM’s placement partners include Ninety Nine Years, Axis Bank, AU Small Finance Bank, and over 200+ corporate networks.',
  },
  {
    question: 'What is the difference between MBA and PGDM?',
    answer:
      'PGDM, an AICTE-approved diploma, offers a dynamic curriculum designed by the institute with industry experts, updated annually. MBA, a university-approved degree, follows a less frequently revised curriculum set by the university.',
  },
  {
    question: 'How to choose a PGDM specialisation?',
    answer:
      'Set a clear career goal, understand the roles and salaries you desire, and explore VSM’s 5 specialisations designed to enhance your career journey.',
  },
  {
    question: 'What is the eligibility criteria for PGDM?',
    answer:
      'Eligibility includes a minimum of 50% aggregate in graduation, along with entrance exam scores like CAT, MAT, XAT, ATMA, MHCET, etc.',
  },
  {
    question: 'How much is the PGDM fee and duration at Valia School of Management Mumbai?',
    answer:
      'The total fee for the AICTE-approved 2-year PGDM program at Valia School of Management (VSM), Mumbai is ₹6.5 lakh. The program fee includes industry-focused learning, corporate internships, placement assistance, and value-added learning through guest sessions and Harvard Business Publishing reference materials.',
  },
  {
    question: 'Does Valia School of Management provide placements?',
    answer:
      'Yes. VSM provides 100% placement assistance to students enrolled in its AICTE-approved 2-year PGDM program. Students also complete a 3+ month corporate internship and benefit from a network of 200+ recruiting companies.',
  },
  {
    question: 'Is PGDM course worth it?',
    answer:
      'Yes. A PGDM course is worth it if you want practical management skills, industry exposure, and better career opportunities. An AICTE-approved PGDM program with internships and placement assistance can help graduates become job-ready.',
  },
  {
    question: 'Which entrance exams are accepted for PGDM admission at Valia School of Management?',
    answer:
      'Valia School of Management (VSM), Mumbai accepts CAT, XAT, CMAT, GMAT, MAT, ATMA, and MAH MBA CET scores for admission to its AICTE-approved PGDM program.',
  },
];

export const faqIntro = whyChooseIntro;

export const enquiryCities = ['Mumbai', 'Thane', 'Navi Mumbai', 'Pune', 'Nashik', 'Other'];
