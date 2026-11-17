// Teaching Faculty page (/faculty/) — CMS defaults (mirrors the current static page content).
import type { AcademicsHeroSlide, AcademicsImage } from './academics.js';
import { academicTemplateSection } from './academics.js';

const FIG = '/images/figma';
const AICTE_PATH = '/our-academics/aicte-pgdm-courses-in-mumbai/';

export type FacultyProfileItem = {
  name: string;
  expertise: string;
  image: AcademicsImage;
  experience: string;
  role: string;
  previous: string;
  organisations: string;
  academic: string;
  enabled: boolean;
};

export const facultyPageDefaults = {
  templateSections: { sections: [] as (typeof academicTemplateSection)[] },
  hero: {
    breadcrumb: [
      { label: 'Home', href: '/' },
      { label: 'Academics', href: AICTE_PATH },
      { label: 'Teaching Faculty', href: '' },
    ],
    linkText: 'Meet Our Faculty',
    linkHref: '#our-faculty',
  },
  tabs: {
    links: [
      { label: 'Our Faculty', anchor: 'our-faculty' },
      { label: 'Teaching & Industry Experience', anchor: 'faculty-experience' },
    ],
  },
  glance: {
    eyebrow: 'Academic Excellence',
    title: 'Faculty at a Glance',
    description:
      'Learn from educators and professionals with experience across management, finance, marketing, human resources, operations, and law.',
    profilesLabel: 'Profiles',
    experienceLabel: 'Experience',
    experienceValue: 'Academic + Industry',
  },
  intro: {
    eyebrow: 'Masters of Their Craft, Mentors for the Future',
    title: 'Meet Our Industry-Oriented PGDM Faculty',
    description:
      'At Valia School of Management, our faculty brings academic knowledge and practical experience to the classroom. Their industry backgrounds and teaching experience help students connect management concepts with real business situations.',
  },
  experience: {
    title: 'Teaching Meets Industry Experience',
    body:
      '<p>Our faculty brings perspectives from business, finance, marketing, human resources, operations, law, and higher education. This mix supports case-based teaching and helps students understand how management decisions work in practice.</p>',
  },
};

const profile = (
  name: string,
  src: string,
  expertise: string,
  experience: string,
  role: string,
  previous: string,
  organisations: string,
  academic: string
): FacultyProfileItem => ({
  name,
  expertise,
  image: { src, alt: `Portrait of ${name}`, width: 600, height: 750 },
  experience,
  role,
  previous,
  organisations,
  academic,
  enabled: true,
});

export const facultyMasterDefaults = {
  hero: {
    items: [
      {
        image: { src: `${FIG}/academics-banner.webp`, alt: 'PGDM graduates celebrating at Valia School of Management', width: 1918, height: 820 },
        imagePosition: '70% 100%',
        mobileImagePosition: '78% 50%',
        title: 'Teaching Faculty',
        subtitle: 'Mentors Crafting Tomorrow’s Leaders',
        primaryText: '',
        primaryHref: '',
        secondaryText: '',
        secondaryHref: '',
        enabled: true,
      },
    ] as AcademicsHeroSlide[],
  },
  profiles: {
    items: [
      profile(
        'Prof. Nirav Vijay Tawadia',
        'https://vsmedu.com/wp-content/uploads/2025/11/Picture1.jpg',
        'Management, Marketing & Human Resources',
        '15 years (5 years industry + 10 years teaching)',
        'Assistant Professor – Management, Marketing & HR',
        'First Advantage Pvt. Ltd.',
        'Liberty Videocon General Insurance, St. John Institute of Management and Research, Ghanshyamdas Saraf College, Vivek College, D.T.S.S. College, University of Mumbai (IDOL)',
        'Prahladrai Dalmia Lions College of Commerce & Economics; university paper setter, viva examiner, and examination committee member.'
      ),
      profile(
        'Dr. Arloph John Vieira',
        'https://vsmedu.com/wp-content/uploads/2025/01/Photo-Dr-Arloph-John-Vieira.jpeg',
        'Operations & Supply Chain',
        '35 years industry + 5 years teaching',
        'Senior Vice President, Bajaj Healthcare Ltd',
        'Cipla',
        'Alembic, Shalina Labs, Glenmark Pharma, Kopran Ltd',
        'Director and Professor at Swayam Siddhi Management College, V.N. Bedekar College, K.J. Somaiya, and ITM.'
      ),
      profile(
        'Prof. Ajai Pillai',
        'https://vsmedu.com/wp-content/uploads/2025/01/Photo-Ajai-Pillai.jpeg',
        'Marketing & General Management',
        '38 years',
        'Senior Vice President, GFG Alliance (UK & France)',
        'Thyssenkrupp India',
        'Deritend Ltd, Batliboi Ltd, Toyota, L&T Ltd',
        'Visiting faculty at MKES-IMSR, DGSIMS, and AIMS.'
      ),
      profile(
        'Prof. Purv Shah',
        'https://vsmedu.com/wp-content/uploads/2025/01/prof.-purv-shah.jpg',
        'Finance',
        '19 years',
        'Founding Mentor, BSE Brokers Forum',
        'Jamnadas Virji Advisory Pvt. Ltd',
        'Department of IT, MHRD NSDC, NDA, Ministry of Finance (Nepal)',
        'St. Xavier’s, Symbiosis, GLC, Chitkara University, Aditya Birla World School, JBIMS, SIMSREE, and SPJIMR; also a media commentator.'
      ),
      profile(
        'Prof. Rushi Upadhyaya',
        'https://vsmedu.com/wp-content/uploads/2025/06/Rushi-Upadhyaya.jpeg',
        'Legal: Media & Entertainment and Corporate',
        '15+ years',
        'Head of Legal & Business Affairs, Standards & Practices, Maddock Films Pvt. Ltd.',
        'Reliance Industries Limited – JioStudios',
        'Sony Music Entertainment, Reliance Retail, Sony Pictures Networks, Shemaroo Entertainment',
        'Guest lecturer at Kirit P. Mehta (NMIMS).'
      ),
      profile(
        'Prof. Navneet Sangha',
        'https://vsmedu.com/wp-content/uploads/2025/11/Picture2.png',
        'Finance',
        '15+ years',
        'Academic Co-ordinator, B.Com Co-ordinator, Faculty',
        'N.L. Dalmia College, Mira Road',
        'St. Xavier’s College (Empowered Autonomous Institute), Mumbai; Royal College of Arts, Science & Commerce, Mira Road',
        'Faculty at St. Xavier’s College, Mumbai.'
      ),
      profile(
        'Dr. Shishir Vahia',
        'https://vsmedu.com/wp-content/uploads/2025/03/simir.jpg',
        'AI & Marketing',
        '17 years',
        'AVP Marketing & Industrial Relations, Sage IT Inc. USA',
        'Hexaware Technologies Ltd',
        'Start-ups, Ogilvy, Tata Power, PCS Tech, AurionPro Ltd',
        'Growth consultant for start-ups and global IT organisations.'
      ),
      profile(
        'Prof. Ami Upadhyaya',
        'https://vsmedu.com/wp-content/uploads/2025/06/Ami-Upadhyaya.jpeg',
        'Human Resource & People Connect',
        '18 years',
        'Founder, HRpreneurs',
        'Sethia Infrastructure Pvt. Ltd; Avighna India Ltd',
        'HIH Realty Pvt. Ltd, PXL Soft (Monarch Group of Technologies)',
        'Chetana’s R.K. Institute of Management and Research; Atharva Institute of Management Studies, MKES.'
      ),
    ] as FacultyProfileItem[],
  },
};

export const facultyPageLabels: Record<keyof typeof facultyPageDefaults, string> = {
  templateSections: 'Custom list sections',
  hero: 'Page Banner Breadcrumb & Link',
  tabs: 'Section Navigation Tabs',
  glance: 'Faculty at a Glance (sidebar)',
  intro: 'Meet Our Faculty (intro)',
  experience: 'Teaching Meets Industry Experience',
};

export const facultyMasterLabels: Record<keyof typeof facultyMasterDefaults, string> = {
  hero: 'Faculty – Page Banner',
  profiles: 'Faculty – Faculty Profiles',
};

export type FacultyPageContent = typeof facultyPageDefaults;
export type FacultyPageMasters = typeof facultyMasterDefaults;
export type FacultyPageKey = keyof FacultyPageContent;
export type FacultyMasterKey = keyof FacultyPageMasters;
