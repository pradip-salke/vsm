// Admissions pages (/admissions/*) — CMS defaults mirroring the current static page content.
// Each page is stored independently under `admissions.<page>.<section>` (masters: `admissions.<page>.master-<key>`).
import type { AcademicsHeroSlide } from './academics.js';

const FIG = '/images/figma';
const APPLY_PATH = '/admissions/application-form/';
const ADMISSIONS_EMAIL = 'mailto:admissions@vsmedu.in';

const pageNav = {
  title: 'Admissions pages',
  links: [
    { label: 'Admissions Process', href: '/admissions/mba-pgdm-admissions-process/' },
    { label: 'Fees Structure', href: '/admissions/pgdm-fee-structure/' },
    { label: 'Application Form', href: APPLY_PATH },
    { label: 'Refund Policy', href: '/admissions/refund-policy/' },
  ],
};

const breadcrumb = (current: string) => ({
  breadcrumb: [
    { label: 'Home', href: '/' },
    { label: 'Admissions', href: '/admissions/mba-pgdm-admissions-process/' },
    { label: current, href: '' },
  ],
});

const bannerSlide = (title: string, subtitle: string): AcademicsHeroSlide => ({
  image: { src: `${FIG}/academics-banner.webp`, alt: 'PGDM graduates celebrating at Valia School of Management', width: 1918, height: 820 },
  imagePosition: '70% 100%',
  mobileImagePosition: '78% 50%',
  title,
  subtitle,
  primaryText: 'Apply Now',
  primaryHref: APPLY_PATH,
  secondaryText: 'Enquire now',
  secondaryHref: ADMISSIONS_EMAIL,
  enabled: true,
});

export const admissionsPages = {
  'mba-pgdm-admissions-process': {
    path: '/admissions/mba-pgdm-admissions-process/',
    navTitle: 'Admissions Process',
    sections: {
      hero: breadcrumb('Admissions Process'),
      'page-nav': structuredClone(pageNav),
      eligibility: {
        title: 'Eligibility Criteria',
        items: [
          { label: 'Graduation', detail: 'A bachelor’s degree from a recognized university.' },
          { label: 'Minimum Score', detail: 'At least 50% aggregate in graduation (45% for reserved categories).' },
          { label: 'Entrance Exams', detail: 'Valid scores in CAT, MAT, XAT, ATMA, MHCET, CMAT or equivalent management entrance tests.' },
          { label: 'Final Year Students', detail: 'Those in the final year of graduation can apply provisionally.' },
        ],
      },
      steps: {
        title: 'Steps to Apply',
        items: [
          { title: 'Online Application', text: 'Complete the online application form on the VSM website.' },
          { title: 'Submit Documents', text: 'Upload necessary academic and entrance exam score documents.' },
          { title: 'Application Review', text: 'The admissions team will review your application.' },
          { title: 'Interview Round', text: 'Shortlisted candidates will be invited for a personal interview.' },
          { title: 'Admission Offer', text: 'Successful candidates will receive an admission offer letter.' },
        ],
      },
      'apply-cta': {
        title: 'Begin Your Management Journey – Apply Now',
        lead: '<p>Take the first step toward your management career. Complete the application form to get started.</p>',
        primaryText: 'Complete Application Form',
        primaryHref: APPLY_PATH,
        secondaryText: 'Contact Admissions',
        secondaryHref: ADMISSIONS_EMAIL,
      },
    },
    masters: { hero: { items: [bannerSlide('PGDM Admissions 2026 at VSM', 'Embark on a Journey of Excellence')] } },
    labels: {
      hero: 'Page Banner Breadcrumb',
      'page-nav': 'Admissions Page Links',
      eligibility: 'Eligibility Criteria',
      steps: 'Steps to Apply',
      'apply-cta': 'Apply Now Call-to-Action',
    },
    subtitles: {
      hero: 'Breadcrumb trail for the banner. Heading, image and buttons are edited in Page Banner (slider).',
      'page-nav': 'Links bar below the banner that switches between Admissions pages.',
      eligibility: 'Numbered eligibility list: a bold label and its description per row.',
      steps: 'Numbered application step cards: step title and short description.',
      'apply-cta': 'Closing block with intro text and two buttons.',
    },
  },
  'pgdm-fee-structure': {
    path: '/admissions/pgdm-fee-structure/',
    navTitle: 'Fees Structure',
    sections: {
      hero: breadcrumb('Fees Structure'),
      'page-nav': structuredClone(pageNav),
      intro: {
        title: 'PGDM Course Fees in Mumbai',
        body:
          '<p>Discover the value of a transformative education at Valia School of Management. Our PGDM fee structure is designed to be clear and inclusive, ensuring that students from diverse backgrounds can plan their educational journey with confidence. At VSM, we believe in transparency and affordability, providing you with a detailed breakdown of costs for our PGDM and PGDM Dual Specialization programs.</p>' +
          '<p>Explore our detailed PGDM fee structure below, tailored for both Indian Nationals and International Students:</p>',
      },
    },
    masters: { hero: { items: [bannerSlide('PGDM Fees Structure: Batch 2026–28', 'Your Investment in World-Class Education')] } },
    labels: {
      hero: 'Page Banner Breadcrumb',
      'page-nav': 'Admissions Page Links',
      intro: 'Course Fees Introduction',
    },
    subtitles: {
      hero: 'Breadcrumb trail for the banner. Heading, image and buttons are edited in Page Banner (slider).',
      'page-nav': 'Links bar below the banner that switches between Admissions pages.',
      intro: 'Section heading and introductory paragraphs.',
    },
  },
  'application-form': {
    path: '/admissions/application-form/',
    navTitle: 'Application Form',
    sections: {
      hero: breadcrumb('Application Form'),
      'page-nav': structuredClone(pageNav),
      'form-section': {
        title: 'PGDM Admission 2026–28 | Apply Now',
        subheading: 'Application Form',
      },
      faq: {
        title: 'FAQs',
        items: [
          {
            question: 'What is the PGDM admission process at VSM?',
            answer:
              '<p>Beginning your PGDM journey at Valia School of Management is an organized and smooth process. Follow these simple steps to secure your place in our prestigious PGDM program:</p>' +
              '<ol><li><strong>Step 1: ONLINE APPLICATION:</strong> Complete the online application form on the VSM website.</li>' +
              '<li><strong>Step 2: SUBMIT DOCUMENTS:</strong> Upload necessary academic and entrance exam score documents.</li>' +
              '<li><strong>Step 3: APPLICATION REVIEW:</strong> The admissions team will review your application.</li>' +
              '<li><strong>Step 4: INTERVIEW ROUND:</strong> Shortlisted candidates will be invited for a personal interview.</li>' +
              '<li><strong>Step 5: ADMISSION OFFER:</strong> Successful candidates will receive an admission offer letter.</li></ol>',
          },
          {
            question: 'What is PGDM eligibility at VSM?',
            answer:
              '<p>PGDM course eligibility requires a bachelor’s degree from a recognized university and a minimum of 50% valid score in a management entrance exam such as CAT, CMAT, MAT, XAT, ATMA, or MAH MBA CET.</p>',
          },
          { question: 'Is the PGDM program officially recognized under AICTE?', answer: '<p>Yes, the PGDM program is approved by AICTE.</p>' },
          {
            question: 'What are the specializations being offered in PGDM at VSM?',
            answer: '<p>The specializations offered by VSM under PGDM are Marketing, Finance, HR, Business Analytics, Operations &amp; Supply Chain Management.</p>',
          },
          {
            question: 'Is PGDM a 2 year course?',
            answer:
              '<p>Yes, the PGDM programs at VSM are two-year full-time programs, comprising four semesters (2 semesters per year). Students complete classroom learning, internships, and industry projects during this period.</p>',
          },
        ],
      },
    },
    masters: { hero: { items: [bannerSlide('PGDM Application Form – 2026', 'Begin Your Management Journey – Apply Now')] } },
    labels: {
      hero: 'Page Banner Breadcrumb',
      'page-nav': 'Admissions Page Links',
      'form-section': 'Application Form Section',
      faq: 'FAQ (Application Form Page)',
    },
    subtitles: {
      hero: 'Breadcrumb trail for the banner. Heading, image and buttons are edited in Page Banner (slider).',
      'page-nav': 'Links bar below the banner that switches between Admissions pages.',
      'form-section': 'Headings above the online application form. The form fields themselves are managed in code.',
      faq: 'FAQs for this page only. Add, edit, delete and reorder questions; answers support lists, bold text and links.',
    },
  },
  'refund-policy': {
    path: '/admissions/refund-policy/',
    navTitle: 'Refund Policy',
    sections: {
      hero: breadcrumb('Refund Policy'),
      'page-nav': structuredClone(pageNav),
      policy: {
        title: 'Cancellation of Admission, Refund of Fees and Return of Documents by Institute',
        clauses: [
          { body: '<p>Application Fee is Non – Refundable.</p>' },
          {
            body:
              '<p>The Student shall apply through an email on <a href="mailto:admissions@vsmedu.in">admissions@vsmedu.in</a> for cancellation and withdrawal of admission. The student should also submit duly signed copy of application for cancellation of admission to the Institute in-person.</p>',
          },
          { body: '<p>Upon the receiving of Student request for cancellation, his/her admission shall be treated as cancelled.</p>' },
          { body: '<p>Upon such cancellation, the Student shall lose the claim on the seat.</p>' },
          {
            body:
              '<p>The Student shall then be entitled to refund of the entire fees after deduction of Rs. 1000/- towards processing charges. All original documents submitted to the Institute will be returned.</p>',
          },
        ],
        note:
          'Notwithstanding the clause above, the student shall not be entitled to any refund of his/her fee, if the cancellation of admission request is made by the Student after the Course Commences.',
      },
      'refund-table': {
        title: 'Refund Policy: As prescribed by AICTE',
        particularHeading: 'Fees Particulars',
        deductionHeading: 'Deduction',
        refundHeading: 'Refund',
        refundRows: [
          { particular: 'Application Fee Rs. 2000/-', deduction: 'NA', refund: 'No Refund' },
          { particular: 'Before Commencement of Course (as per the date notified by AICTE)', deduction: 'Rs. 1,000/-', refund: '100% less Rs. 1,000/-' },
          { particular: 'After Commencement of Course (as per the date notified by AICTE)', deduction: '100%', refund: 'No Refund' },
        ],
      },
    },
    masters: {
      hero: { items: [bannerSlide('Refund Policy', 'Cancellation of Admission, Refund of Fees and Return of Documents by Institute')] },
    },
    labels: {
      hero: 'Page Banner Breadcrumb',
      'page-nav': 'Admissions Page Links',
      policy: 'Cancellation & Refund Clauses',
      'refund-table': 'AICTE Refund Table',
    },
    subtitles: {
      hero: 'Breadcrumb trail for the banner. Heading, image and buttons are edited in Page Banner (slider).',
      'page-nav': 'Links bar below the banner that switches between Admissions pages.',
      policy: 'Section heading, numbered policy clauses (rich text with links) and the closing note.',
      'refund-table': 'Table heading, the three column headings and each refund row.',
    },
  },
} satisfies Record<
  string,
  {
    path: string;
    navTitle: string;
    sections: Record<string, unknown>;
    masters: { hero: { items: AcademicsHeroSlide[] } };
    labels: Record<string, string>;
    subtitles: Record<string, string>;
  }
>;

export type AdmissionsPageSlug = keyof typeof admissionsPages;
export const admissionsPageSlugs = Object.keys(admissionsPages) as AdmissionsPageSlug[];
export const admissionsMasterLabels = { hero: 'Page Banner' } as const;
