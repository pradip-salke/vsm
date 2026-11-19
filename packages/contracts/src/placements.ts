// Placements pages (/placements/*) — CMS defaults mirroring the current static page content.
// Each page is stored independently under `placements.<page>.<section>` (masters: `placements.<page>.master-<key>`).
import type { AcademicsHeroSlide } from './academics.js';

const FIG = '/images/figma';
const APPLY_PATH = '/admissions/application-form/';
const ADMISSIONS_EMAIL = 'mailto:admissions@vsmedu.in';
const HERO_SUBTITLE = 'Navigating Today’s Business World with Tomorrow’s Leaders';
const EYEBROW = 'Placement';

export type PlacementImageItem = { src: string; alt: string; width: number; height: number; enabled: boolean };

const pageNav = () => ({
  title: 'Placement pages',
  links: [
    { label: 'Our Recruiters', href: '/placements/our-recruiters/' },
    { label: 'Placement Records', href: '/placements/placement-records/' },
    { label: 'Recruitment Enquiry', href: '/connect-with-us/' },
  ],
});

const batchNav = () => ({
  title: 'Placement batch records',
  links: [
    { label: 'PGDM 2022–24 Batch', href: '/placements/placement-records/pgdm-2022-24-batch/' },
    { label: 'PGDM 2021–23 Batch', href: '/placements/placement-records/pgdm-2021-23-batch/' },
  ],
});

const breadcrumb = (current: string) => ({
  breadcrumb: [
    { label: 'Home', href: '/' },
    { label: 'Placements', href: '/placements/' },
    { label: current, href: '' },
  ],
});

const bannerSlide = (title: string): AcademicsHeroSlide => ({
  image: { src: `${FIG}/academics-banner.webp`, alt: 'PGDM graduates celebrating at Valia School of Management', width: 1918, height: 820 },
  imagePosition: '70% 100%',
  mobileImagePosition: '78% 50%',
  title,
  subtitle: HERO_SUBTITLE,
  primaryText: 'Apply Now',
  primaryHref: APPLY_PATH,
  secondaryText: 'Enquire now',
  secondaryHref: ADMISSIONS_EMAIL,
  enabled: true,
});

const html = (paragraphs: string[]) => paragraphs.map((p) => `<p>${p}</p>`).join('');

const placementIntro = html([
  'Placements is not a one-day process and we provide every student a platform with the best available resources in terms of learning, industry interaction, internships with actual hands-on learning to get a clear understanding of expectations which makes our students “Industry Ready” to help them become confident and ensure success.',
  'We continuously keep interacting with companies to ensure they seek highly motivated, passionate and eager to learn professionals. We endeavor to add new companies to our list of already existing ones throughout the year.',
  'The placement team has a wide spectrum of industries to access the needs and plays a dual role of mentors to our students and research insight to academic teams respectively to ensure students have an insight into the latest trends in the markets and is ready to adapt rapidly to the expectations of the organizations.',
]);

const batchIntro = html([
  'VSM strives to ensure every student enrolled with us understands the importance of placements and what it takes to help companies that visit our campus provide opportunities to excel.',
  'Placements is not a one-day process. We provide every student a platform with learning, industry interaction and internships with hands-on experience, helping them understand expectations, become industry ready and build confidence for success.',
]);

const stats = (rows: [string, string][]) => rows.map(([value, label]) => ({ value, label }));

const batch2022Highlights = stats([
  ['100%', 'Internship Placement Percentage'], ['90', 'Number of Companies Participated'],
  ['2–4 Months', 'Maximum Internship Period'], ['₹15K / month', 'Average Stipend Offered'],
  ['₹35K / month', 'Highest Stipend Offered'], ['08', 'Number of PPOs Received'],
]);

const altFromFile = (file: string) => file.replace(/[_-]/g, ' ').replace(/\.[^.]+$/, '');
const record = (src: string, alt: string): PlacementImageItem => ({ src, alt, width: 724, height: 1024, enabled: true });

const currentRecordItems = ['s1-724x1024.jpeg', 's2-724x1024.jpeg', 's3-724x1024.jpeg'].map((file, index) =>
  record(`https://vsmedu.com/wp-content/uploads/2026/06/${file}`, `Summer internship placement record ${index + 1}, PGDM batch 2025–27`)
);

const batch2022PlacementItems = [
  'AAKANSHA-RAJESH-SHARMA_Post_V02.jpg', 'AKASHKUMAR-NAYAK_Post_V02.jpg', 'MANSI-MANISH-SHINDE_Post_V02.jpg',
  'NANDESH-ANIL-RINGE_Post.jpg', 'PRASHANT-SHASHIMOHAN-JHA_Post_V02.jpg', 'ROHAN-NAIR_Post.jpg',
  'SABEENA-ANSARI_Post_V02.jpg', 'SHUBHAM-MANDEWARIYA_Post.jpg', 'SIDDHA-DINKAR-PERVI_Post_V02.jpg',
  'Samruddhi-Kanade.jpg', 'Siddha-Pervi.jpg', 'YASHASHREE-WAGLE_Post_V02.jpg', 'VANSAJ-GUPTA_Post.jpg',
].map((file) => record(`https://vsmedu.com/wp-content/uploads/2025/03/${file}`, altFromFile(file)));

const batch2022InternshipItems = [
  'Internship_Prashant-Chavan.jpg', 'Internship_Nandesh-Ringe.jpg', 'Internship_Kalpesh-Suthar.jpg',
  'Internship_Binit-Kushwaha.jpg', 'Final-Placement_Sudha-Konar.jpg', 'Internship_Prashant-Jha.jpg',
].map((file) => record(`https://vsmedu.com/wp-content/uploads/2024/04/${file}`, altFromFile(file)));


const HERO_LABEL = 'Page Banner Breadcrumb';
const HERO_SUBTITLE_TEXT = 'Breadcrumb trail for the banner. Heading, image and buttons are edited in Page Banner (slider).';
const NAV_LABEL = 'Placement Page Links';
const NAV_SUBTITLE = 'Links bar below the banner that switches between Placements pages.';
const BATCH_NAV_LABEL = 'Batch Record Links';
const BATCH_NAV_SUBTITLE = 'Batch buttons shown on Placement Records pages.';

export const placementsPages = {
  placements: {
    path: '/placements/',
    navTitle: 'Placements Overview',
    sections: {
      hero: breadcrumb('Placements'),
      'page-nav': pageNav(),
      intro: { eyebrow: EYEBROW, title: 'Achieve Your Career Goals with VSM’s PGDM Placements', body: placementIntro },
      cards: {
        items: [
          { title: 'Our Recruiters', text: 'Meet organizations that recruit VSM students across industries.', linkText: 'Explore Our Recruiters', href: '/placements/our-recruiters/' },
          { title: 'Placement Records', text: 'Review recent internship records and batch-wise placement outcomes.', linkText: 'Explore Placement Records', href: '/placements/placement-records/' },
          { title: 'Connect With Us', text: 'Contact our team to discuss student engagement, internships and recruitment opportunities.', linkText: 'Connect with VSM', href: '/connect-with-us/' },
        ],
      },
      highlights: {
        eyebrow: EYEBROW,
        title: 'PGDM 2022–24 Batch · Internship Highlights',
        items: structuredClone(batch2022Highlights),
        linkText: 'View placement records →',
        linkHref: '/placements/placement-records/',
      },
    },
    masters: { hero: { items: [bannerSlide('Placements')] } },
    masterLabels: { hero: 'Page Banner' },
    masterSections: {},
    labels: {
      hero: HERO_LABEL,
      'page-nav': NAV_LABEL,
      intro: 'Placements Introduction',
      cards: 'Placement Page Cards',
      highlights: 'Internship Highlights',
    },
    subtitles: {
      hero: HERO_SUBTITLE_TEXT,
      'page-nav': NAV_SUBTITLE,
      intro: 'Section eyebrow, heading and introductory paragraphs.',
      cards: 'Cards linking to each Placements page: heading, text, link text and link.',
      highlights: 'Statistic tiles (value + label) and the link to placement records.',
    },
  },
  'our-recruiters': {
    path: '/placements/our-recruiters/',
    navTitle: 'Our Recruiters',
    sections: {
      hero: breadcrumb('Our Recruiters'),
      'page-nav': pageNav(),
      intro: { eyebrow: EYEBROW, title: 'Industry Connections That Help Students Grow', body: placementIntro },
      recruiters: { title: 'Our Recruiters' },
    },
    masters: { hero: { items: [bannerSlide('Our Recruiters')] } },
    masterLabels: { hero: 'Page Banner' },
    masterSections: {},
    labels: {
      hero: HERO_LABEL,
      'page-nav': NAV_LABEL,
      intro: 'Recruiters Introduction',
      recruiters: 'Recruiter Logos Heading',
    },
    subtitles: {
      hero: HERO_SUBTITLE_TEXT,
      'page-nav': NAV_SUBTITLE,
      intro: 'Section eyebrow, heading and introductory paragraphs.',
      recruiters: 'Heading above the logo grid. Logo images are managed in Masters → Recruiters.',
    },
  },
  'placement-records': {
    path: '/placements/placement-records/',
    navTitle: 'Placement Records',
    sections: {
      hero: breadcrumb('Placement Records'),
      'page-nav': pageNav(),
      'batch-nav': batchNav(),
      records: { eyebrow: EYEBROW, title: 'Batch Wise Placement Records', subheading: 'Summer Internship 2025–27' },
    },
    masters: { hero: { items: [bannerSlide('Placement Records')] }, records: { items: currentRecordItems } },
    masterLabels: { hero: 'Page Banner', records: 'Internship Record Images' },
    masterSections: { records: 'records' },
    labels: {
      hero: HERO_LABEL,
      'page-nav': NAV_LABEL,
      'batch-nav': BATCH_NAV_LABEL,
      records: 'Batch Wise Records Heading',
    },
    subtitles: {
      hero: HERO_SUBTITLE_TEXT,
      'page-nav': NAV_SUBTITLE,
      'batch-nav': BATCH_NAV_SUBTITLE,
      records: 'Section eyebrow, heading and sub-heading above the record images. Images are managed in Internship Record Images.',
    },
  },
  'pgdm-2022-24-batch': {
    path: '/placements/placement-records/pgdm-2022-24-batch/',
    navTitle: 'PGDM 2022–24 Batch',
    sections: {
      hero: breadcrumb('PGDM 2022–24 Batch'),
      'page-nav': pageNav(),
      'batch-nav': batchNav(),
      intro: { eyebrow: EYEBROW, title: 'Placements Details of PGDM 2022–24 Batch', body: batchIntro },
      highlights: { title: 'Key Highlights · Final Placement: In Progress', items: structuredClone(batch2022Highlights) },
      'placement-records': { title: 'Placements Records' },
      'internship-records': { title: 'Internship Records' },
    },
    masters: {
      hero: { items: [bannerSlide('PGDM 2022–24 Batch')] },
      placements: { items: batch2022PlacementItems },
      internships: { items: batch2022InternshipItems },
    },
    masterLabels: { hero: 'Page Banner', placements: 'Placement Record Images', internships: 'Internship Record Images' },
    masterSections: { placements: 'placement-records', internships: 'internship-records' },
    labels: {
      hero: HERO_LABEL,
      'page-nav': NAV_LABEL,
      'batch-nav': BATCH_NAV_LABEL,
      intro: 'Batch Introduction',
      highlights: 'Key Highlights',
      'placement-records': 'Placement Records Carousel Heading',
      'internship-records': 'Internship Records Carousel Heading',
    },
    subtitles: {
      hero: HERO_SUBTITLE_TEXT,
      'page-nav': NAV_SUBTITLE,
      'batch-nav': BATCH_NAV_SUBTITLE,
      intro: 'Section eyebrow, heading and introductory paragraphs.',
      highlights: 'Sub-heading and statistic tiles (value + label).',
      'placement-records': 'Heading above the placement records carousel. Images are managed in Placement Record Images.',
      'internship-records': 'Heading above the internship records carousel. Images are managed in Internship Record Images.',
    },
  },
  'pgdm-2021-23-batch': {
    path: '/placements/placement-records/pgdm-2021-23-batch/',
    navTitle: 'PGDM 2021–23 Batch',
    sections: {
      hero: breadcrumb('PGDM 2021–23 Batch'),
      'page-nav': pageNav(),
      'batch-nav': batchNav(),
      intro: { eyebrow: EYEBROW, title: 'Placements Details of PGDM 2021–23 Batch', body: batchIntro },
      highlights: {
        title: 'Key Highlights',
        items: stats([
          ['58', 'Total Participants in the batch'], ['84', 'Number of Companies Participated'],
          ['55', 'Total Number of Students Placed'], ['95%', 'Placement Percentage'],
          ['₹7–8.5 LPA', 'Average Salary Range Offered'], ['₹9–11.5 LPA', 'Highest Salary Range Offered'],
        ]),
      },
      'specialisation-table': {
        title: 'Specialization-wise Placement Record',
        specialisationHeading: 'Specialization',
        percentageHeading: 'Placed Students %',
        countHeading: 'No. of Students',
        rows: ([
          ['Marketing', '23%', '16'], ['BFSI', '30%', '9'], ['HR', '17%', '11'],
          ['Operations', '15%', '9'], ['Business Analytics', '15%', '7'],
        ] as [string, string, string][]).map(([specialisation, percentage, count]) => ({ specialisation, percentage, count })),
      },
      'salary-table': {
        title: 'Average & Highest Salary Range Offered Specialization-wise',
        streamHeading: 'Stream',
        averageHeading: 'Average Salary · PGDM Batch 2021–23',
        highestHeading: 'Highest Salary · PGDM Batch 2021–23',
        rows: ([
          ['Marketing', '₹7.5 LPA', '₹12.0 LPA'], ['BFSI', '₹8.0 LPA', '₹14.0 LPA'],
          ['HR', '₹7.5 LPA', '₹11.0 LPA'], ['Operations', '₹7.0 LPA', '₹9.0 LPA'],
          ['Business Analytics', '₹7.0 LPA', '₹15.0 LPA'],
        ] as [string, string, string][]).map(([stream, average, highest]) => ({ stream, average, highest })),
      },
    },
    masters: { hero: { items: [bannerSlide('PGDM 2021–23 Batch')] } },
    masterLabels: { hero: 'Page Banner' },
    masterSections: {},
    labels: {
      hero: HERO_LABEL,
      'page-nav': NAV_LABEL,
      'batch-nav': BATCH_NAV_LABEL,
      intro: 'Batch Introduction',
      highlights: 'Key Highlights',
      'specialisation-table': 'Specialization-wise Placement Table',
      'salary-table': 'Salary Range Table',
    },
    subtitles: {
      hero: HERO_SUBTITLE_TEXT,
      'page-nav': NAV_SUBTITLE,
      'batch-nav': BATCH_NAV_SUBTITLE,
      intro: 'Section eyebrow, heading and introductory paragraphs.',
      highlights: 'Sub-heading and statistic tiles (value + label).',
      'specialisation-table': 'Table heading, column headings and one row per specialization.',
      'salary-table': 'Table heading, column headings and one row per stream.',
    },
  },
  'connect-with-us': {
    path: '/connect-with-us/',
    navTitle: 'Recruitment Enquiry',
    sections: {
      hero: breadcrumb('Recruitment Enquiry'),
      'page-nav': pageNav(),
      contact: {
        eyebrow: EYEBROW,
        title: "We're Here to Answer Your Queries",
        body: "At Valia School of Management, we're always open to your questions, suggestions, and feedback. Whether you're a prospective student, a parent, or just curious about our programs, our team is here to provide you with the information you need. Reach out to us within our working hours, and we'll be more than happy to assist you.",
        emailLabel: 'Email address:',
        emails: ['info@vsmedu.in', 'placement@vsmedu.in'],
        phoneLabel: 'Contact number:',
        phones: ['+91 73043 43478', '+91 73043 43460'],
      },
    },
    masters: { hero: { items: [bannerSlide('Recruitment Enquiry')] } },
    masterLabels: { hero: 'Page Banner' },
    masterSections: {},
    labels: {
      hero: HERO_LABEL,
      'page-nav': NAV_LABEL,
      contact: 'Contact Information',
    },
    subtitles: {
      hero: HERO_SUBTITLE_TEXT,
      'page-nav': NAV_SUBTITLE,
      contact: 'Contact eyebrow, heading, introduction, labels, email addresses and phone numbers.',
    },
  },
} satisfies Record<
  string,
  {
    path: string;
    navTitle: string;
    sections: Record<string, unknown>;
    masters: { hero: { items: AcademicsHeroSlide[] } } & Record<string, { items: unknown[] }>;
    masterLabels: Record<string, string>;
    masterSections: Record<string, string>;
    labels: Record<string, string>;
    subtitles: Record<string, string>;
  }
>;

export type PlacementsPageSlug = keyof typeof placementsPages;
export const placementsPageSlugs = Object.keys(placementsPages) as PlacementsPageSlug[];

/** Master keys (including `hero`) for one Placements page, in display order. */
export function placementsMasterKeys(slug: PlacementsPageSlug): string[] {
  return Object.keys(placementsPages[slug].masters);
}
