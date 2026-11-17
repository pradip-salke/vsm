// About Us pages (/about-us/*) — CMS defaults mirroring the current static page content.
import { BANNER_BREADCRUMB_SUBTITLE, SEO_SUBTITLE, innerBannerSlide, type SitePageDefinition } from './site-pages.js';

const IMG = '/images/about';
const ABOUT_HOME = '/about-us/about-vsm-mba-pgdm-colleges-in-mumbai/';
const NAVIGATING = "Navigating Today's Business World with Tomorrow's Leaders";
const LEADERS = 'Leaders Who Inspire Leadership';

const aboutNav = () => ({
  title: 'About',
  links: [
    { label: 'About VSM', href: ABOUT_HOME },
    { label: 'Our Philosophy', href: '/about-us/our-philosophy/' },
    { label: 'Academic Advisory Board', href: '/about-us/academic-advisory-board/' },
    { label: 'Trustee’s Message', href: '/about-us/trustee-message/' },
    { label: 'Vice Chairman Message', href: '/about-us/vice-chairman-message/' },
    { label: 'Director Message', href: '/about-us/director-message/' },
    { label: 'Affiliation & Industry Leadership', href: '/about-us/affiliation-industry-leadership/' },
    { label: 'Infrastructure', href: '/about-us/infrastructure/' },
    { label: 'Student Residence', href: '/about-us/student-residence/' },
    { label: 'Board of Governance', href: 'https://vsmedu.com/wp-content/uploads/2026/08/DocScanner-25-Aug-2026-3-56-pm.pdf' },
  ],
});

const hero = (current: string) => ({ breadcrumb: [{ label: 'Home', href: '/' }, { label: 'About', href: ABOUT_HOME }, { label: current, href: '' }] });
const seo = (metaTitle: string, metaDescription: string) => ({ metaTitle, metaDescription });
const img = (file: string, alt: string, width = 600, height = 750) => ({ src: `${IMG}/${file}`, alt, width, height });
const profile = (name: string, file: string, role = '', details: string[] = []) => ({ name, role, details, image: img(file, name) });
const p = (...paragraphs: string[]) => paragraphs.map((text) => `<p>${text}</p>`).join('');

const commonLabels = { hero: 'Page Banner Breadcrumb', 'page-nav': 'About Pages Sidebar', seo: 'SEO Settings' };
const commonSubtitles = {
  hero: BANNER_BREADCRUMB_SUBTITLE,
  'page-nav': 'Sidebar list of About pages shown beside the content on this page.',
  seo: SEO_SUBTITLE,
};

const page = (
  path: string,
  navTitle: string,
  bannerTitle: string,
  bannerSubtitle: string,
  sections: Record<string, unknown>,
  labels: Record<string, string>,
  subtitles: Record<string, string>,
  meta: { metaTitle: string; metaDescription: string }
): SitePageDefinition => ({
  path,
  navTitle,
  sections: { hero: hero(bannerTitle), 'page-nav': aboutNav(), ...sections, seo: meta },
  masters: { hero: { items: [innerBannerSlide(bannerTitle, bannerSubtitle)] } },
  labels: { ...commonLabels, ...labels },
  subtitles: { ...commonSubtitles, ...subtitles },
});

export const aboutPages = {
  'about-vsm-mba-pgdm-colleges-in-mumbai': page(
    ABOUT_HOME,
    'About VSM',
    'About VSM',
    NAVIGATING,
    {
      intro: {
        body: p(
          'At Valia School of Management (VSM), we blend cutting-edge skills like Digital Marketing, Data Analytics, and Sustainable Finance with traditional management principles. Our programs, crafted by global industry experts, are tailored to empower leaders for the new age economy. Embracing technology in every aspect, VSM prepares students to make impactful decisions based on data and analysis. With a focus on practical learning through our extensive 6-8 month internship programs, VSM stands at the forefront of innovative management education.',
          'The Cosmopolitan Education Society, established in 1961, offers a transformative 2-year, full-time Post Graduate Diploma in Management (PGDM) program through Valia School of Management. This AICTE-approved program is designed to go beyond academic theory, providing a hands-on journey toward industry excellence. With specializations in Marketing, Finance, Human Resources, Business Analytics, and Operations And Supply Chain Management, our curriculum emphasizes practical learning through rigorous case studies and valuable guest sessions led by industry experts. This immersive approach equips students with deep management knowledge and essential skills to excel in today’s dynamic business world. Join us to experience one of the top PGDM programs and launch your journey to success.'
        ),
      },
      'vision-mission': {
        title: 'Our Vision & Mission',
        cards: [
          {
            title: 'Our Vision',
            text: 'To maintain the highest academic standards upholding the noblest ideals and moral values, to identify hidden talent, create enlightened, empowered and socially committed students and above all good human beings.',
            image: img('vision.png', '', 100, 100),
          },
          {
            title: 'Our Mission',
            text: 'To provide value-based quality education and training in an environment conducive to intellectual, social, and cultural enrichment so as to mould responsible citizens with a harmonious blend of Indian traditions and modern technology for a better tomorrow.',
            image: img('mission.png', '', 100, 100),
          },
        ],
      },
    },
    { intro: 'About VSM Introduction', 'vision-mission': 'Vision & Mission Cards' },
    { intro: 'Opening paragraphs about VSM.', 'vision-mission': 'Section heading and the Vision / Mission cards (icon, heading, text).' },
    seo('About VSM', 'Learn about Valia School of Management, its vision and mission.')
  ),
  'our-philosophy': page(
    '/about-us/our-philosophy/',
    'Our Philosophy',
    'Our Philosophy',
    'Empowering Minds, Creating Leaders: The VSM Way of Continuous Growth',
    {
      values: {
        title: 'Our Philosophy at Valia School of Management',
        cards: [
          { title: 'Continuous Learning at the Core', text: 'At VSM, learning is an endless journey. We offer a platform where students and faculty alike strive for continuous personal and professional growth.', image: img('philosophy-learning.png', '', 100, 100) },
          { title: 'Fostering Innovation and Curiosity', text: 'Innovation is our cornerstone. We encourage imaginative thinking and curiosity to tackle real-world challenges, valuing diverse perspectives and creative solutions.', image: img('philosophy-innovation.png', '', 100, 100) },
          { title: 'Empowering Community', text: 'We champion a culture of inclusivity and collaboration. Our community is a tapestry of diverse voices, all contributing to a richer, more holistic learning experience.', image: img('philosophy-community.png', '', 100, 100) },
          { title: 'Faculty Development', text: "Our faculty's growth is as important as our students'. We're committed to advancing their knowledge and skills, ensuring they remain at the forefront of management education.", image: img('philosophy-faculty.png', '', 100, 100) },
          { title: 'Mutual Growth and Support', text: 'Growth at VSM is a shared journey. We believe in uplifting each other, fostering an environment where everyone thrives together.', image: img('philosophy-growth.png', '', 100, 100) },
          { title: 'Industry Collaboration', text: 'With a network of over 500 corporate leaders, VSM offers unmatched real-world insights and experiences, preparing students for the dynamic business landscape.', image: img('philosophy-industry.png', '', 100, 100) },
        ],
      },
    },
    { values: 'Philosophy Value Cards' },
    { values: 'Section heading and value cards (icon, heading, description). Add, remove and reorder cards.' },
    seo('Our Philosophy', 'The values that shape the learning community at Valia School of Management.')
  ),
  'academic-advisory-board': page(
    '/about-us/academic-advisory-board/',
    'Academic Advisory Board',
    'Academic Advisory Board',
    NAVIGATING,
    {
      board: {
        title: 'Academic Advisory Board',
        profiles: [
          profile('Mr. Bharat H. Valia', 'board-bharat.jpg', 'President & Trustee, Cosmopolitan Education Society'),
          profile('MR. RAMESH IYER', 'board-ramesh.png', '', ['Former Vice Chairman & Managing Director, Mahindra Financial Services Limited', 'President – Financial Services Sector & Member of the Group Executive Board – Mahindra & Mahindra Limited', 'Board Leadership across Finance, Pharma, Private Equity, Chemicals, Renewable Energy & Auto Sectors.']),
          profile('VARSHA AINAPURE', 'board-varsha.jpeg', '', ['FCA, Ph.D., PDF(USA), Author, Ex-Director MKES-IMSR,', 'Fulbright International Visiting Scholar']),
          profile('MR. SHANKAR JADHAV', 'board-shankar.png', '', ['Director & CIO, Bluerock Strategic Investments', 'Sr. Partner & CIO, Singhania & Co.', 'Ex. Managing Director, BSE Investments Limited', 'Ex. Managing Director and Chief Strategy Officer, BSE (Bombay Stock Exchange)']),
          profile('DR. NEIL SEQUEIRA', 'board-neil.jpeg', '', ['COO, Thane Cancer Hospital', 'Ex. VP – HR & Admin, Kokilaben Dhirubhai Ambani Hospital', 'Ex. Director – HR, Hinduja Hospital']),
          profile('DR. SAMIR KARKHANIS', 'board-samir.jpeg', '', ['Founder & CEO – Yangpoo University Partners', 'Exclusive India Partner for Harvard Business School Online', 'Harvard Business Publishing Education']),
          profile('MS. MAMTA BAKSHI', 'board-mamta.jpeg', '', ['CEO, Godrej Living', 'Former Chief Customer Experience Officer', 'Godrej Properties Ltd']),
        ],
      },
    },
    { board: 'Advisory Board Members' },
    { board: 'Member profile cards: photo, name, designation and detail lines. Add, remove and reorder members.' },
    seo('Academic Advisory Board', 'Meet the academic and industry leaders on the VSM Academic Advisory Board.')
  ),
  'trustee-message': page(
    '/about-us/trustee-message/',
    'Trustee’s Message',
    'Message From Trustee',
    LEADERS,
    {
      messages: {
        title: 'Message From Trustee',
        items: [
          {
            name: 'Mr. Bharat Valia',
            role: 'President & Trustee, Cosmopolitan Education Society',
            image: img('trustee-bharat.jpg', 'Mr. Bharat Valia'),
            body: p(
              'At Valia School of Management (VSM), we are dedicated to nurturing the leaders of tomorrow. Our 2-year, full-time Post Graduate Diploma in Management (PGDM) program is a transformative journey designed to prepare students for success in the dynamic business world. With AICTE approval and a curriculum that integrates theoretical foundations with practical insights, we offer specializations in Marketing, Finance, Human Resources, Business Analytics, and Operations And Supply Chain Management.',
              'Through rigorous case studies and enriching guest sessions with industry experts, students gain a hands-on understanding of real-world challenges. Since our inception in 1961, the legacy of excellence in education has been our cornerstone. We are proud to carry this forward by empowering students with the knowledge and skills to innovate, lead, and create a meaningful impact in their professional and personal lives.',
              'Join us at VSM, and let’s embark on this journey to success together.',
              'At the Valia School of Management, we take immense pride in our commitment to fostering excellence in education. Our AICTE-approved Post Graduate Diploma in Management (PGDM) program is more than just an academic course; it is a gateway to leadership and innovation. Offering specializations in Marketing, Finance, Human Resources, Business Analytics, and Operations And Supply Chain Management, our program is thoughtfully designed to meet the evolving needs of today’s industries.',
              'The immersive learning experience, strengthened by case-based methodologies and expert-led guest lectures, equips students with the practical skills and deep insights required to thrive in a competitive environment. Since 1961, our vision has been to empower individuals to succeed in a fast-changing world, and we remain steadfast in this mission.',
              'We are excited to welcome aspiring leaders to join the VSM family and be part of our journey of creating future-ready professionals who will make a meaningful difference in society and the business landscape.'
            ),
          },
          { name: 'Mrs. Alka Valia', role: 'Joint Secretary, Cosmopolitan Education Society', image: img('trustee-alka.jpg', 'Mrs. Alka Valia'), body: '' },
          {
            name: 'Mr. Nilesh Mehta',
            role: 'Joint Treasurer, Cosmopolitan Education Society',
            image: img('trustee-nilesh.jpg', 'Mr. Nilesh Mehta'),
            body: p(
              'Cosmopolitan Education Society rooted in the mission of delivering value-based education in an intellectually, socially, and culturally enriching environment, the Society continues to uphold its legacy of nurturing responsible citizens through a harmonious blend of Indian traditions and modern technology.',
              'In alignment with our commitment to excellence and innovation, we are pleased to introduce Valia School of Management’s two-year full-time Post Graduate Diploma in Management (PGDM) program. This program is designed to equip future leaders with the skills and knowledge required to thrive in a dynamic global environment.',
              'We take pride in the Society’s continued role in shaping the future of education and fostering a better tomorrow. Your insights and support have always been instrumental in driving our initiatives forward.',
              'We would be thrilled to have you enrolled in the PGDM program at VSM and elevate your career to new heights.'
            ),
          },
        ],
      },
    },
    { messages: 'Trustee Messages' },
    { messages: 'One block per trustee: photo, name, designation and message text. Add, remove and reorder trustees.' },
    seo('Message From Trustee', 'Messages from the President and Trustees of Cosmopolitan Education Society.')
  ),
  'vice-chairman-message': page(
    '/about-us/vice-chairman-message/',
    'Vice Chairman Message',
    'Vice Chairman Message',
    LEADERS,
    {
      message: {
        title: 'Message From Vice Chairman',
        image: img('vice-bryan.jpeg', 'Bryan Dsouza, Vice Chairman', 600, 900),
        greeting: 'Dear Students and Parents,',
        intro: p(
          'It gives me immense pleasure to welcome you to Valia School of Management (VSM), where our focus is to develop confident, competent, and industry-ready professionals and future business leaders.',
          'At VSM, we believe that management education must go beyond classrooms. The corporate world today seeks professionals with strong knowledge, practical skills, digital competence, communication, adaptability, problem-solving abilities, and the confidence to contribute from day one.'
        ),
        bridgeIntro: 'Our endeavour is to build a strong bridge between academia and industry through:',
        bridge: ['Corporate interactions', 'Live projects', 'Internships', 'Mentorship', 'Guest sessions', 'Industrial visits', 'Experiential learning'],
        careersIntro: 'We believe that employability begins from the first day of the PGDM. Our corporate and placement initiatives aim to connect students with diverse industries and career opportunities across:',
        careers: ['Marketing & Sales', 'Finance & BFSI', 'Human Resources', 'Business Analytics', 'Operations & Supply Chain', 'Consulting', 'Digital Business', 'Entrepreneurship'],
        closing: p(
          'We will continuously focus on corporate connect, internships, live projects, career readiness, professional skills, interview preparation, and industry exposure, enabling our students to understand workplace expectations and become valuable contributors to their organisations.',
          'To our students, remember that the institution can create opportunities, but you must convert them into a career. Your attitude, discipline, communication skills, internships, networking, and willingness to learn will shape your professional journey.',
          'To our parents, your trust in VSM is a responsibility we deeply value. Together, we aim not only to help students earn a PGDM and secure their first career opportunity, but also to prepare them for long-term professional growth and leadership.',
          'I encourage every student to learn beyond the syllabus, engage with industry, build networks, take up internships and live projects, participate actively, and embrace challenges. Your PGDM is not merely a qualification; it is the foundation of your professional journey.',
          'I warmly welcome you and your family to the VSM community and wish you every success in becoming future-ready professionals, responsible leaders, and valuable contributors to the corporate world and society.'
        ),
        signature: ['With my very best wishes,', 'Bryan Dsouza', 'Vice Chairman', 'Valia School of Management'],
      },
    },
    { message: 'Vice Chairman Message' },
    { message: 'Photo, greeting, message paragraphs, the two bullet lists and the signature lines (line 2 is shown in bold).' },
    seo('Vice Chairman Message', 'A message to VSM students and families from the Vice Chairman.')
  ),
  'director-message': page(
    '/about-us/director-message/',
    'Director Message',
    "Director's Message",
    LEADERS,
    {
      message: {
        title: 'Message From Director',
        image: img('director-sandeep.jpg', 'Dr. Sandeep Sawant, Director of Valia School of Management'),
        greeting: 'Dear Students, Aspirants, and Stakeholders,',
        intro: p(
          'It is with great enthusiasm that I welcome you to the Valia School of Management (VSM) — a premier institution with a forward-looking, progressive philosophy located in the heart of Mumbai suburbs. Our vision is to nurture future leaders who can excel in an increasingly dynamic and global business environment.',
          'The world of business today is in a constant state of transformation. Emerging technologies, digital ecosystems, and shifting global paradigms continue to redefine how organizations compete and create value. Business education, therefore, must remain equally agile and forward-looking — preparing leaders not just to adapt to change, but to anticipate and shape it.',
          'At VSM, we blend tradition with transformation. Our AICTE-approved PGDM program is designed for the era of Industry 4.0, combining academic rigor with real-world relevance through projects, simulations, and deep industry immersion.'
        ),
        pillarsIntro: 'Our academic philosophy rests on four transformative pillars:',
        pillars: [
          { label: 'Design Thinking', detail: 'fostering creativity, empathy, and innovation.' },
          { label: 'Digitalization', detail: 'integrating technology, data, and analytics into decision-making.' },
          { label: 'Sustainability', detail: 'embedding responsibility and long-term thinking in every action.' },
          { label: 'Entrepreneurship', detail: 'nurturing initiative, innovation, and value creation.' },
        ],
        closing: p(
          'Students can specialize in Marketing, Finance, Human Resource Management, Business Analytics, and Operations &amp; Supply Chain Management. Supported by a distinguished faculty and strong industry partnerships, VSM strives to create T-shaped professionals — individuals with deep domain expertise and the versatility to collaborate across disciplines.',
          'At Valia School of Management, we do not merely prepare students for careers — we prepare them to build futures of impact, integrity, and innovation.'
        ),
        signature: ['Warm regards,', 'Dr. Sandeep Sawant', 'Director, Valia School of Management'],
      },
    },
    { message: 'Director Message' },
    { message: 'Photo, greeting, message paragraphs, the four pillars (bold label + description) and signature lines.' },
    seo("Director's Message", 'A message from Dr. Sandeep Sawant, Director of Valia School of Management.')
  ),
  'affiliation-industry-leadership': page(
    '/about-us/affiliation-industry-leadership/',
    'Affiliation & Industry Leadership',
    'Affiliation & Industry Leadership',
    NAVIGATING,
    {
      intro: {
        title: 'Affiliation and Industry Leadership at Valia School of Management',
        body: p(
          'Valia School of Management, offering a prestigious 2-year PGDM program, is proudly AICTE-approved, ensuring that our curriculum adheres to the highest academic standards set by the regulatory authorities. With a strong legacy of over six decades in education, we have consistently been at the forefront of academic excellence and industry leadership.',
          'Our PGDM program is designed to equip students with the essential skills and knowledge to thrive in today’s dynamic business environment. Through strategic affiliations with industry leaders, we ensure our students have access to the latest industry trends, internships, and placement opportunities.',
          'Additionally, we provide comprehensive, high-quality study material through our collaboration with Hardware Publishing, which supports an enriched learning experience. This partnership allows us to deliver cutting-edge content and resources that keep our students ahead in their academic and professional pursuits.',
          'At Valia School of Management, we continue to build strong industry ties and offer students the best of both worlds—rigorous academics and real-world exposure.'
        ),
      },
      leaders: {
        enabled: true,
        title: 'Industry Leadership',
        profiles: [
          profile('Rekha Sethi', 'aima-rekha.png', 'Director General AIMA'),
          profile('C K Ranganathan', 'aima-ranganathan.png', '', ['President AIMA', 'Chairman & Managing Director', 'CavinKare Pvt. Ltd.']),
          profile('Shrinivas V Dempo', 'aima-dempo.png', '', ['Senior Vice-President AIMA', 'Chairman', 'Dempo Group of Companies']),
          profile('Nikhil Sawhney', 'aima-sawhney.png', '', ['Vice-President AIMA', 'Vice Chairman and Managing Director', 'Triveni Turbine Limited', 'Triveni Engineering and Industries Limited']),
          profile('P Dwarkanath', 'aima-dwarkanath.png', '', ['Treasurer AIMA', 'Former Chairman', 'GSK Consumer Healthcare Ltd']),
          profile('Harsh Pati Singhania', 'aima-singhania.png', '', ['Immediate Past President AIMA', 'Director, JK Organization', 'Vice Chairman and MD, JK Paper Ltd']),
        ],
      },
      'past-presidents': {
        enabled: true,
        title: 'AIMA Past Presidents - A Decade of Exemplary Leadership',
        profiles: [
          profile('Sanjay Kirloskar', 'aima-kirloskar.png', '2019 - 2020', ['Chairman and Managing Director', 'Kirloskar Brothers Limited']),
          profile('Harshavardhan Neotia', 'aima-neotia.png', '2018 - 2019', ['Chairman', 'AmbujaNeotia Group']),
          profile('T V Mohandas Pai', 'aima-pai.png', '2017 - 2018', ['Chairman', 'Manipal Global Education Services Pvt Ltd']),
          profile('Sunil Kant Munjal', 'aima-munjal.png', '2016 - 2017', ['Chairman', 'The Hero Enterprise']),
          profile('Firdose Vandrevala', 'aima-vandrevala.png', '2015 - 2016', ['Former Executive Vice Chairman Essar Steel India Ltd']),
          profile('H. M Nerurkar', 'aima-nerurkar.png', '2014 - 2015', ['Chairman', 'TRL Krosaki Refractories Limited']),
          profile('Preetha Reddy', 'aima-reddy.png', '2013 - 2014', ['Vice Chairperson', 'Apollo Hospitals']),
          profile('D. Shivakumar', 'aima-shivakumar.png', '2012 - 2013', ['Group Executive President, Corporate Strategy & Business Development', 'Aditya Birla Management Corporation Pvt. Ltd.']),
        ],
      },
    },
    { intro: 'Affiliation Introduction', leaders: 'Industry Leadership Profiles', 'past-presidents': 'AIMA Past Presidents' },
    {
      intro: 'Section heading and introductory paragraphs.',
      leaders: 'Leader profile cards: photo, name, designation and detail lines.',
      'past-presidents': 'Past president cards: photo, name, tenure (designation field) and detail lines.',
    },
    seo('Affiliation & Industry Leadership', 'Explore VSM affiliations and the leaders of the All India Management Association.')
  ),
  infrastructure: page(
    '/about-us/infrastructure/',
    'Infrastructure',
    'Infrastructure',
    NAVIGATING,
    {
      gallery: {
        title: 'Infrastructure',
        images: [
          ['IMG-20250624-WA0008.jpg', 300, 225], ['IMG-20250624-WA0009.jpg', 300, 225], ['IMG-20250624-WA0010.jpg', 300, 225],
          ['IMG-20250624-WA0012.jpg', 300, 225], ['IMG-20250624-WA0013.jpg', 300, 225], ['IMG-20250624-WA0014.jpg', 300, 225],
          ['IMG-20250624-WA0015.jpg', 300, 225], ['IMG-20250624-WA0016.jpg', 300, 225], ['IMG-20250624-WA0017.jpg', 300, 225],
          ['IMG-20250624-WA0019.jpg', 300, 225], ['IMG-20250624-WA0005.jpg', 300, 225], ['IMG-20250624-WA0007.jpg', 300, 225],
          ['WhatsApp-Image-2025-06-24-at-16.05.43_a5a0c7f7.jpg', 300, 200], ['IMG-20250627-WA0007.jpg', 226, 300],
          ['IMG-20250627-WA0008.jpg', 300, 226], ['IMG-20250627-WA0009.jpg', 225, 300], ['IMG-20250627-WA0010.jpg', 224, 300],
        ].map(([file, width, height], index) => ({
          src: `${IMG}/infrastructure/${file}`,
          alt: `Valia School of Management infrastructure photograph ${index + 1}`,
          width: width as number,
          height: height as number,
        })),
      },
    },
    { gallery: 'Infrastructure Gallery' },
    { gallery: 'Gallery and slideshow photographs. Upload, replace, remove and reorder images.' },
    seo('Infrastructure', 'Infrastructure at Valia School of Management.')
  ),
  'student-residence': page(
    '/about-us/student-residence/',
    'Student Residence',
    'Student Residence',
    NAVIGATING,
    {
      content: {
        title: 'Student Residence',
        body:
          '<p>Student living is not your everyday life in Mumbai. It\'s your second home. VSM has tied-up with One of the Finest Student Residence providers – Stanza Living, a professionally managed accommodation for students.</p>' +
          '<p>For further details, refer to the <a href="https://vsmedu.com/wp-content/uploads/2024/09/VSM-AICTE-PGDM-Brochure.pdf" rel="noreferrer">VSM PGDM brochure (PDF)</a>.</p>',
      },
    },
    { content: 'Student Residence Content' },
    { content: 'Section heading and the residence description (supports links).' },
    seo('Student Residence', 'Student accommodation information for Valia School of Management students.')
  ),
  'anti-ragging-policy': page(
    '/anti-ragging-policy/',
    'Anti-Ragging Policy',
    'Anti-Ragging Policy',
    NAVIGATING,
    {
      policy: {
        title: 'ANTI-RAGGING POLICY',
        intro: '<p>We are committed to maintaining a safe, respectful, and inclusive environment. Ragging is strictly prohibited, and strict action will be taken against violators as per regulations. Click the link below to learn more about our anti-ragging guidelines and complaint procedures.</p>',
        linkText: 'https://www.antiragging.in/affidavit_affiliated_form.php',
        linkHref: 'https://www.antiragging.in/affidavit_affiliated_form.php',
      },
    },
    { policy: 'Anti-Ragging Policy' },
    { policy: 'Policy heading, full description and official complaint-procedure link.' },
    seo('Anti-Ragging Policy | Valia School of Management', 'Anti-ragging policy and complaint procedure at Valia School of Management.')
  ),
  committee: page(
    '/committee/',
    'Committee',
    'Committee',
    NAVIGATING,
    {
      committees: {
        groups: [
          {
            title: 'Women Grievance Redressal Committee',
            intro: '<p>The institute has a well-set Women Grievance Redressal Committee wherein the students can lodge their grievances, which are considered in the Women Grievance Redressal Committee meetings and appropriate action is taken. The committee of the institute is as follows:</p>',
            members: [
              { name: 'Dr. Shobha Menon', designation: 'Chairperson' },
              { name: 'Mrs. Jansi Varsala', designation: 'Member' },
            ],
          },
          {
            title: 'Grievance Redressal Committee',
            intro: '<p>The institute has a well set online grievance redressal committee wherein the students can lodge their grievances, which are considered in the grievance redressal committee meetings and appropriate action is taken. The grievance redressal committee of the institute is as follows:</p>',
            members: [
              { name: 'Dr. Shobha Menon', designation: 'Chairperson' },
              { name: 'Prof. Ajai Pillai', designation: 'Member' },
              { name: 'Mr. Omkar Malvade', designation: 'Member' },
            ],
          },
        ],
      },
    },
    { committees: 'Committees' },
    { committees: 'Committee names, descriptions and ordered member rows.' },
    seo('Committee | Valia School of Management', 'Women Grievance Redressal and Grievance Redressal Committees at Valia School of Management.')
  ),
  'eoa-report': page(
    '/eoa-report/',
    'EOA Report',
    'EOA Report',
    NAVIGATING,
    {
      report: {
        title: 'EOA Report 2026–27',
        intro: 'Extension of Approval (EOA)',
        description: 'View the official 2026–27 report on the VSM website.',
        linkText: 'Open EOA Report',
        linkHref: 'https://vsmedu.com/wp-content/uploads/2026/04/EOA-Report-2026-27-1.pdf',
      },
    },
    { report: 'EOA Report' },
    { report: 'Report heading, description and the official PDF link.' },
    seo('EOA Report | Valia School of Management', 'EOA Report 2026–27 for Valia School of Management.')
  ),
} satisfies Record<string, SitePageDefinition>;

export type AboutPageSlug = keyof typeof aboutPages;
export const aboutPageSlugs = Object.keys(aboutPages) as AboutPageSlug[];
