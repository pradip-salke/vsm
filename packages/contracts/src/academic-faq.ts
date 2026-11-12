/**
 * Default FAQ block for academic programme pages (AICTE, AIMA, specialisation landers).
 * Same JSON shape as `homeDefaults.faq` for `FaqSection`, but **not** shared with Home CMS at runtime.
 * Each page namespace stores its own copy under e.g. `academics.faq`, `academics-aima.faq`, `academics-specs.<slug>.faq`.
 */
export const academicPageFaqDefault = {
  title: 'FAQ About PGDM Admissions',
  eyebrow: 'Empowering Your Academic Journey: Your Questions Answered',
  description:
    'At Valia School of Management, we believe in creating a learning experience that resonates with the evolving demands of the global business environment, positioning us as one of the top PGDM college in Mumbai, renowned for our exceptional PGDM programs. Our approach is not just about imparting knowledge; it’s about shaping future leaders who are prepared for the C-Suite and beyond.',
  items: [
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
  ],
  buttonText: 'More FAQs',
  buttonHref: '/admissions/mba-pgdm-admissions-process/',
};

export type AcademicPageFaq = typeof academicPageFaqDefault;
