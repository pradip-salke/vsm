export type AboutProfile = { name: string; role?: string; details?: string[]; image?: string };

export const aboutPageList = [
  { label: 'About VSM', href: '/about-us/about-vsm-mba-pgdm-colleges-in-mumbai/', title: 'About VSM', subtitle: "Navigating Today's Business World with Tomorrow's Leaders" },
  { label: 'Our Philosophy', href: '/about-us/our-philosophy/', title: 'Our Philosophy', subtitle: 'Empowering Minds, Creating Leaders: The VSM Way of Continuous Growth' },
  { label: 'Academic Advisory Board', href: '/about-us/academic-advisory-board/', title: 'Academic Advisory Board', subtitle: "Navigating Today's Business World with Tomorrow's Leaders" },
  { label: 'Trustee’s Message', href: '/about-us/trustee-message/', title: 'Message From Trustee', subtitle: 'Leaders Who Inspire Leadership' },
  { label: 'Vice Chairman Message', href: '/about-us/vice-chairman-message/', title: 'Vice Chairman Message', subtitle: 'Leaders Who Inspire Leadership' },
  { label: 'Director Message', href: '/about-us/director-message/', title: "Director's Message", subtitle: 'Leaders Who Inspire Leadership' },
  { label: 'Affiliation & Industry Leadership', href: '/about-us/affiliation-industry-leadership/', title: 'Affiliation & Industry Leadership', subtitle: "Navigating Today's Business World with Tomorrow's Leaders" },
  { label: 'Infrastructure', href: '/about-us/infrastructure/', title: 'Infrastructure', subtitle: "Navigating Today's Business World with Tomorrow's Leaders" },
  { label: 'Student Residence', href: '/about-us/student-residence/', title: 'Student Residence', subtitle: "Navigating Today's Business World with Tomorrow's Leaders" },
  { label: 'Board of Governance', href: 'https://vsmedu.com/wp-content/uploads/2026/08/DocScanner-25-Aug-2026-3-56-pm.pdf', title: 'Board of Governance', subtitle: "Navigating Today's Business World with Tomorrow's Leaders" },
] as const;

export const boardMembers: AboutProfile[] = [
  { name: 'Mr. Bharat H. Valia', role: 'President & Trustee, Cosmopolitan Education Society', image: 'board-bharat.jpg' },
  { name: 'MR. RAMESH IYER', details: ['Former Vice Chairman & Managing Director, Mahindra Financial Services Limited', 'President – Financial Services Sector & Member of the Group Executive Board – Mahindra & Mahindra Limited', 'Board Leadership across Finance, Pharma, Private Equity, Chemicals, Renewable Energy & Auto Sectors.'], image: 'board-ramesh.png' },
  { name: 'VARSHA AINAPURE', details: ['FCA, Ph.D., PDF(USA), Author, Ex-Director MKES-IMSR,', 'Fulbright International Visiting Scholar'], image: 'board-varsha.jpeg' },
  { name: 'MR. SHANKAR JADHAV', details: ['Director & CIO, Bluerock Strategic Investments', 'Sr. Partner & CIO, Singhania & Co.', 'Ex. Managing Director, BSE Investments Limited', 'Ex. Managing Director and Chief Strategy Officer, BSE (Bombay Stock Exchange)'], image: 'board-shankar.png' },
  { name: 'DR. NEIL SEQUEIRA', details: ['COO, Thane Cancer Hospital', 'Ex. VP – HR & Admin, Kokilaben Dhirubhai Ambani Hospital', 'Ex. Director – HR, Hinduja Hospital'], image: 'board-neil.jpeg' },
  { name: 'DR. SAMIR KARKHANIS', details: ['Founder & CEO – Yangpoo University Partners', 'Exclusive India Partner for Harvard Business School Online', 'Harvard Business Publishing Education'], image: 'board-samir.jpeg' },
  { name: 'MS. MAMTA BAKSHI', details: ['CEO, Godrej Living', 'Former Chief Customer Experience Officer', 'Godrej Properties Ltd'], image: 'board-mamta.jpeg' },
];

export const philosophyValues = [
  { title: 'Continuous Learning at the Core', text: 'At VSM, learning is an endless journey. We offer a platform where students and faculty alike strive for continuous personal and professional growth.', image: 'philosophy-learning.png' },
  { title: 'Fostering Innovation and Curiosity', text: 'Innovation is our cornerstone. We encourage imaginative thinking and curiosity to tackle real-world challenges, valuing diverse perspectives and creative solutions.', image: 'philosophy-innovation.png' },
  { title: 'Empowering Community', text: 'We champion a culture of inclusivity and collaboration. Our community is a tapestry of diverse voices, all contributing to a richer, more holistic learning experience.', image: 'philosophy-community.png' },
  { title: 'Faculty Development', text: "Our faculty's growth is as important as our students'. We're committed to advancing their knowledge and skills, ensuring they remain at the forefront of management education.", image: 'philosophy-faculty.png' },
  { title: 'Mutual Growth and Support', text: 'Growth at VSM is a shared journey. We believe in uplifting each other, fostering an environment where everyone thrives together.', image: 'philosophy-growth.png' },
  { title: 'Industry Collaboration', text: 'With a network of over 500 corporate leaders, VSM offers unmatched real-world insights and experiences, preparing students for the dynamic business landscape.', image: 'philosophy-industry.png' },
];

export const aboutVsm = {
  paragraphs: [
    'At Valia School of Management (VSM), we blend cutting-edge skills like Digital Marketing, Data Analytics, and Sustainable Finance with traditional management principles. Our programs, crafted by global industry experts, are tailored to empower leaders for the new age economy. Embracing technology in every aspect, VSM prepares students to make impactful decisions based on data and analysis. With a focus on practical learning through our extensive 6-8 month internship programs, VSM stands at the forefront of innovative management education.',
    'The Cosmopolitan Education Society, established in 1961, offers a transformative 2-year, full-time Post Graduate Diploma in Management (PGDM) program through Valia School of Management. This AICTE-approved program is designed to go beyond academic theory, providing a hands-on journey toward industry excellence. With specializations in Marketing, Finance, Human Resources, Business Analytics, and Operations And Supply Chain Management, our curriculum emphasizes practical learning through rigorous case studies and valuable guest sessions led by industry experts. This immersive approach equips students with deep management knowledge and essential skills to excel in today’s dynamic business world. Join us to experience one of the top PGDM programs and launch your journey to success.',
  ],
  vision: 'To maintain the highest academic standards upholding the noblest ideals and moral values, to identify hidden talent, create enlightened, empowered and socially committed students and above all good human beings.',
  mission: 'To provide value-based quality education and training in an environment conducive to intellectual, social, and cultural enrichment so as to mould responsible citizens with a harmonious blend of Indian traditions and modern technology for a better tomorrow.',
};

export const trusteeMessages = [
  { name: 'Mr. Bharat Valia', role: 'President & Trustee, Cosmopolitan Education Society', image: 'trustee-bharat.jpg', paragraphs: [
    'At Valia School of Management (VSM), we are dedicated to nurturing the leaders of tomorrow. Our 2-year, full-time Post Graduate Diploma in Management (PGDM) program is a transformative journey designed to prepare students for success in the dynamic business world. With AICTE approval and a curriculum that integrates theoretical foundations with practical insights, we offer specializations in Marketing, Finance, Human Resources, Business Analytics, and Operations And Supply Chain Management.',
    'Through rigorous case studies and enriching guest sessions with industry experts, students gain a hands-on understanding of real-world challenges. Since our inception in 1961, the legacy of excellence in education has been our cornerstone. We are proud to carry this forward by empowering students with the knowledge and skills to innovate, lead, and create a meaningful impact in their professional and personal lives.',
    'Join us at VSM, and let’s embark on this journey to success together.',
    'At the Valia School of Management, we take immense pride in our commitment to fostering excellence in education. Our AICTE-approved Post Graduate Diploma in Management (PGDM) program is more than just an academic course; it is a gateway to leadership and innovation. Offering specializations in Marketing, Finance, Human Resources, Business Analytics, and Operations And Supply Chain Management, our program is thoughtfully designed to meet the evolving needs of today’s industries.',
    'The immersive learning experience, strengthened by case-based methodologies and expert-led guest lectures, equips students with the practical skills and deep insights required to thrive in a competitive environment. Since 1961, our vision has been to empower individuals to succeed in a fast-changing world, and we remain steadfast in this mission.',
    'We are excited to welcome aspiring leaders to join the VSM family and be part of our journey of creating future-ready professionals who will make a meaningful difference in society and the business landscape.',
  ] },
  { name: 'Mrs. Alka Valia', role: 'Joint Secretary, Cosmopolitan Education Society', image: 'trustee-alka.jpg', paragraphs: [] },
  { name: 'Mr. Nilesh Mehta', role: 'Joint Treasurer, Cosmopolitan Education Society', image: 'trustee-nilesh.jpg', paragraphs: [
    'Cosmopolitan Education Society rooted in the mission of delivering value-based education in an intellectually, socially, and culturally enriching environment, the Society continues to uphold its legacy of nurturing responsible citizens through a harmonious blend of Indian traditions and modern technology.',
    'In alignment with our commitment to excellence and innovation, we are pleased to introduce Valia School of Management’s two-year full-time Post Graduate Diploma in Management (PGDM) program. This program is designed to equip future leaders with the skills and knowledge required to thrive in a dynamic global environment.',
    'We take pride in the Society’s continued role in shaping the future of education and fostering a better tomorrow. Your insights and support have always been instrumental in driving our initiatives forward.',
    'We would be thrilled to have you enrolled in the PGDM program at VSM and elevate your career to new heights.',
  ] },
];

export const viceChairmanMessage = {
  greeting: 'Dear Students and Parents,',
  intro: [
    'It gives me immense pleasure to welcome you to Valia School of Management (VSM), where our focus is to develop confident, competent, and industry-ready professionals and future business leaders.',
    'At VSM, we believe that management education must go beyond classrooms. The corporate world today seeks professionals with strong knowledge, practical skills, digital competence, communication, adaptability, problem-solving abilities, and the confidence to contribute from day one.',
  ],
  bridge: ['Corporate interactions', 'Live projects', 'Internships', 'Mentorship', 'Guest sessions', 'Industrial visits', 'Experiential learning'],
  careersIntro: 'We believe that employability begins from the first day of the PGDM. Our corporate and placement initiatives aim to connect students with diverse industries and career opportunities across:',
  careers: ['Marketing & Sales', 'Finance & BFSI', 'Human Resources', 'Business Analytics', 'Operations & Supply Chain', 'Consulting', 'Digital Business', 'Entrepreneurship'],
  closing: [
    'We will continuously focus on corporate connect, internships, live projects, career readiness, professional skills, interview preparation, and industry exposure, enabling our students to understand workplace expectations and become valuable contributors to their organisations.',
    'To our students, remember that the institution can create opportunities, but you must convert them into a career. Your attitude, discipline, communication skills, internships, networking, and willingness to learn will shape your professional journey.',
    'To our parents, your trust in VSM is a responsibility we deeply value. Together, we aim not only to help students earn a PGDM and secure their first career opportunity, but also to prepare them for long-term professional growth and leadership.',
    'I encourage every student to learn beyond the syllabus, engage with industry, build networks, take up internships and live projects, participate actively, and embrace challenges. Your PGDM is not merely a qualification; it is the foundation of your professional journey.',
    'I warmly welcome you and your family to the VSM community and wish you every success in becoming future-ready professionals, responsible leaders, and valuable contributors to the corporate world and society.',
  ],
  signature: ['With my very best wishes,', 'Bryan Dsouza', 'Vice Chairman', 'Valia School of Management'],
};

export const directorMessage = {
  greeting: 'Dear Students, Aspirants, and Stakeholders,',
  paragraphs: [
    'It is with great enthusiasm that I welcome you to the Valia School of Management (VSM) — a premier institution with a forward-looking, progressive philosophy located in the heart of Mumbai suburbs. Our vision is to nurture future leaders who can excel in an increasingly dynamic and global business environment.',
    'The world of business today is in a constant state of transformation. Emerging technologies, digital ecosystems, and shifting global paradigms continue to redefine how organizations compete and create value. Business education, therefore, must remain equally agile and forward-looking — preparing leaders not just to adapt to change, but to anticipate and shape it.',
    'At VSM, we blend tradition with transformation. Our AICTE-approved PGDM program is designed for the era of Industry 4.0, combining academic rigor with real-world relevance through projects, simulations, and deep industry immersion.',
  ],
  pillars: [
    ['Design Thinking', 'fostering creativity, empathy, and innovation.'],
    ['Digitalization', 'integrating technology, data, and analytics into decision-making.'],
    ['Sustainability', 'embedding responsibility and long-term thinking in every action.'],
    ['Entrepreneurship', 'nurturing initiative, innovation, and value creation.'],
  ],
  closing: [
    'Students can specialize in Marketing, Finance, Human Resource Management, Business Analytics, and Operations & Supply Chain Management. Supported by a distinguished faculty and strong industry partnerships, VSM strives to create T-shaped professionals — individuals with deep domain expertise and the versatility to collaborate across disciplines.',
    'At Valia School of Management, we do not merely prepare students for careers — we prepare them to build futures of impact, integrity, and innovation.',
  ],
  signature: ['Warm regards,', 'Dr. Sandeep Sawant', 'Director, Valia School of Management'],
};

export const affiliationIntro = [
  'Valia School of Management, offering a prestigious 2-year PGDM program, is proudly AICTE-approved, ensuring that our curriculum adheres to the highest academic standards set by the regulatory authorities. With a strong legacy of over six decades in education, we have consistently been at the forefront of academic excellence and industry leadership.',
  'Our PGDM program is designed to equip students with the essential skills and knowledge to thrive in today’s dynamic business environment. Through strategic affiliations with industry leaders, we ensure our students have access to the latest industry trends, internships, and placement opportunities.',
  'Additionally, we provide comprehensive, high-quality study material through our collaboration with Hardware Publishing, which supports an enriched learning experience. This partnership allows us to deliver cutting-edge content and resources that keep our students ahead in their academic and professional pursuits.',
  'At Valia School of Management, we continue to build strong industry ties and offer students the best of both worlds—rigorous academics and real-world exposure.',
];

export const industryLeaders: AboutProfile[] = [
  { name: 'Rekha Sethi', role: 'Director General AIMA', image: 'aima-rekha.png' },
  { name: 'C K Ranganathan', details: ['President AIMA', 'Chairman & Managing Director', 'CavinKare Pvt. Ltd.'], image: 'aima-ranganathan.png' },
  { name: 'Shrinivas V Dempo', details: ['Senior Vice-President AIMA', 'Chairman', 'Dempo Group of Companies'], image: 'aima-dempo.png' },
  { name: 'Nikhil Sawhney', details: ['Vice-President AIMA', 'Vice Chairman and Managing Director', 'Triveni Turbine Limited', 'Triveni Engineering and Industries Limited'], image: 'aima-sawhney.png' },
  { name: 'P Dwarkanath', details: ['Treasurer AIMA', 'Former Chairman', 'GSK Consumer Healthcare Ltd'], image: 'aima-dwarkanath.png' },
  { name: 'Harsh Pati Singhania', details: ['Immediate Past President AIMA', 'Director, JK Organization', 'Vice Chairman and MD, JK Paper Ltd'], image: 'aima-singhania.png' },
];

export const aimaPastPresidents: AboutProfile[] = [
  { name: 'Sanjay Kirloskar', role: '2019 - 2020', details: ['Chairman and Managing Director', 'Kirloskar Brothers Limited'], image: 'aima-kirloskar.png' },
  { name: 'Harshavardhan Neotia', role: '2018 - 2019', details: ['Chairman', 'AmbujaNeotia Group'], image: 'aima-neotia.png' },
  { name: 'T V Mohandas Pai', role: '2017 - 2018', details: ['Chairman', 'Manipal Global Education Services Pvt Ltd'], image: 'aima-pai.png' },
  { name: 'Sunil Kant Munjal', role: '2016 - 2017', details: ['Chairman', 'The Hero Enterprise'], image: 'aima-munjal.png' },
  { name: 'Firdose Vandrevala', role: '2015 - 2016', details: ['Former Executive Vice Chairman Essar Steel India Ltd'], image: 'aima-vandrevala.png' },
  { name: 'H. M Nerurkar', role: '2014 - 2015', details: ['Chairman', 'TRL Krosaki Refractories Limited'], image: 'aima-nerurkar.png' },
  { name: 'Preetha Reddy', role: '2013 - 2014', details: ['Vice Chairperson', 'Apollo Hospitals'], image: 'aima-reddy.png' },
  { name: 'D. Shivakumar', role: '2012 - 2013', details: ['Group Executive President, Corporate Strategy & Business Development', 'Aditya Birla Management Corporation Pvt. Ltd.'], image: 'aima-shivakumar.png' },
];
