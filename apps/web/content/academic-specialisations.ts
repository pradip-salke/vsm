import type { HeroSlide } from './types';

const banner = '/images/figma/academics-banner.webp';
const icons = '/images/icons';

export type SpecialisationPageContent = {
  slug: string;
  title: string;
  heroTitle: string;
  image: string;
  overview: string[];
  reasons: string[];
  roles: string[];
  subjects: string[];
};

export const academicSpecialisations: SpecialisationPageContent[] = [
  {
    slug: 'financial-management-specialisation',
    title: 'Financial Management',
    heroTitle: 'PGDM in Financial Management',
    image: `${icons}/spec-financial.svg`,
    overview: [
      'Finance goes beyond numbers: it helps organisations understand markets, allocate capital, manage risk, and plan for sustainable growth. VSM’s PGDM in Financial Management builds practical financial judgement alongside a strong grounding in management.',
      'Students learn to interpret financial information, evaluate investment opportunities, and make informed business decisions through an industry-oriented curriculum, case work, and project learning.',
    ],
    reasons: ['High demand across industries', 'A wide range of finance career paths', 'Strong analytical and decision-making skills', 'Exposure to investment, risk, and corporate finance', 'A foundation for long-term professional growth'],
    roles: ['Investment Banker', 'Private Equity Analyst', 'Financial Analyst', 'Financial Manager', 'Chief Financial Officer', 'Accounting Manager', 'Corporate Finance Controller', 'Management Consultant', 'Credit Manager', 'Hedge Fund Manager'],
    subjects: ['Financial Modelling & Equity Research', 'Security Analysis & Portfolio Management', 'Corporate Valuation, Mergers & Acquisitions', 'Financial Derivatives', 'Financial Analytics', 'Digital Financial Systems', 'International Finance', 'Management of Financial Services', 'Corporate Law', 'Credit Rating & Credit Analysis'],
  },
  {
    slug: 'mba-pgdm-in-human-resources-mumbai',
    title: 'Human Resource Management',
    heroTitle: 'PGDM in Human Resource Management',
    image: `${icons}/spec-hr.svg`,
    overview: [
      'Human Resource Management focuses on the people, culture, and systems that help organisations perform. The PGDM specialisation develops the skills to attract, support, and grow talent while aligning people practices with organisational goals.',
      'The curriculum connects management foundations with practical topics such as recruitment, employee relations, learning and development, compensation, and workforce analytics.',
    ],
    reasons: ['Build a career centred on people and organisational growth', 'Develop skills in hiring, training, and employee development', 'Prepare for an evolving and growing profession', 'Learn to support diverse, equitable workplaces', 'Strengthen communication and problem-solving abilities'],
    roles: ['HR Generalist', 'Recruitment Specialist', 'Social Media Recruiter', 'Compensation & Benefits Specialist', 'Training & Development Specialist', 'Employment & Placement Specialist', 'Human Resources Management System Analyst', 'Internal Communication Specialist'],
    subjects: ['People Management', 'Human Resource Management', 'Industrial Relations & Labour Laws', 'Compensation & Benefits', 'Human Resource Planning', 'Talent Management', 'HR Analytics', 'International HRM', 'Inclusion & Diversity', 'Competency Mapping', 'Organisation Development & Change Management', 'Training & Development'],
  },
  {
    slug: 'mba-in-marketing-mumbai',
    title: 'Marketing Management',
    heroTitle: 'PGDM in Marketing Management',
    image: `${icons}/spec-marketing.svg`,
    overview: [
      'Marketing combines creativity, customer understanding, and analysis. VSM’s PGDM specialisation develops the ability to understand buying decisions, build brands, plan campaigns, and use market information to guide business growth.',
      'Students gain exposure to current marketing practices through practical assignments, case studies, and an industry-aligned curriculum in Mumbai’s active business environment.',
    ],
    reasons: ['A broad range of opportunities across sectors', 'Fast-moving work with room for creative thinking', 'Develop communication, teamwork, and negotiation skills', 'Gain practical industry exposure', 'Build skills in brand, sales, and digital marketing'],
    roles: ['Sales & Marketing Representative', 'Marketing Coordinator', 'Customer Service Representative', 'New Product Manager', 'Market Research Analyst', 'Content Manager', 'Communication Manager', 'Sales Manager', 'Brand Manager', 'Promotion Manager', 'Marketing Manager', 'Advertising Manager', 'Public Relations Manager'],
    subjects: ['Marketing Management', 'Consumer Behaviour', 'Sales & Distribution Management', 'Integrated Marketing Communication', 'Managing Retail Business', 'Marketing Analytics', 'Market Research', 'Sales Promotion', 'Social Media & Digital Marketing', 'New Product Creation & Brand Development'],
  },
  {
    slug: 'pgdm-in-business-analytics-mumbai',
    title: 'Business Analytics',
    heroTitle: 'PGDM in Business Analytics',
    image: `${icons}/spec-analytics.svg`,
    overview: [
      'Business Analytics combines management principles with data analysis. Students learn to interpret information, identify patterns, and turn findings into decisions that help organisations improve performance and plan strategically.',
      'The specialisation introduces data science, visualisation, and predictive methods alongside core business learning. These skills are relevant across sectors that increasingly rely on data-informed decisions.',
    ],
    reasons: ['Turn complex data into useful business insights', 'Build skills in data science and visualisation', 'Apply analytics to decisions across functional areas', 'Prepare for a wide variety of roles and industries', 'Learn tools used in modern analytics teams'],
    roles: ['Business Analyst', 'Data Analyst', 'Data Scientist', 'Business Intelligence Analyst', 'Analytics Consultant', 'Marketing Analytics Specialist', 'Risk Analyst', 'Supply Chain Analyst', 'Human Resource Analytics Specialist', 'Web Analytics Specialist'],
    subjects: ['Data Science with Python', 'SQL for Data Analysis', 'Big Data Analytics', 'Power BI', 'Machine Learning', 'Data Science with R', 'Financial Analytics', 'Marketing Analytics', 'HR Analytics', 'Operations Analytics'],
  },
  {
    slug: 'operations-and-supply-chain-management-specialisation',
    title: 'Operations & Supply Chain Management',
    heroTitle: 'PGDM in Operations & Supply Chain Management',
    image: `${icons}/spec-operations.svg`,
    overview: [
      'Operations and supply chain management covers the flow of goods, services, information, and resources from sourcing through delivery. Professionals in this area improve productivity, quality, cost control, and customer outcomes.',
      'VSM’s industry-focused specialisation introduces logistics, procurement, quality control, project management, demand forecasting, and modern supply chain technologies. Mumbai’s manufacturing, retail, logistics, and service sectors offer a strong context for this learning.',
    ],
    reasons: ['Learn to improve processes and operational performance', 'Develop practical problem-solving and decision-making skills', 'Understand logistics, procurement, and demand planning', 'Build expertise relevant to manufacturing, retail, and services', 'Prepare for careers in a globally connected supply network'],
    roles: ['Operations Manager', 'Supply Chain Manager', 'Logistics Manager', 'Procurement Specialist', 'Demand Planner', 'Warehouse Manager', 'Quality Manager', 'Production Planner', 'Process Improvement Analyst', 'Inventory Manager'],
    subjects: ['Logistics Management', 'Warehouse Management', 'Global Supply Chain Management', 'Service Operations', 'Operations Analytics', 'Manufacturing Resource Planning & Control', 'Production Planning & Control', 'Purchase & Materials Management', 'Lean Management', 'Operations Strategy'],
  },
];

export const specialisationHero = (title: string): HeroSlide => ({
  image: { src: banner, alt: 'Valia School of Management students', width: 1918, height: 820 },
  title,
  subtitle: 'Navigating Today’s Business World with Tomorrow’s Leaders',
});

export const specialisationTabs = [
  { label: 'Overview', id: 'overview' },
  { label: 'Why Choose This Specialisation', id: 'why-specialisation' },
  { label: 'Career Opportunities', id: 'career-opportunities' },
  { label: 'Curriculum', id: 'specialisation-curriculum' },
  { label: 'Admission Procedure', id: 'admission-procedure' },
];

