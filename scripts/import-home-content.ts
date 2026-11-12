// One-time baseline import: preserve the existing website copy and asset metadata.
import { writeFileSync } from 'node:fs';
import * as home from '../apps/web/content/home';
import * as shared from '../apps/web/content/shared';
import { APPLY_PATH, ACADEMICS_PGDM_PATH, contact } from '../apps/web/content/site';

const heading = (title: string, eyebrow = '', description = '') => ({ title, eyebrow, description });
const defaults = {
  hero: { primaryText: 'Apply Now', primaryHref: APPLY_PATH, secondaryText: 'Enquire now', secondaryHref: '#enquire-now' },
  stats: { items: home.stats },
  about: { title: 'About Us', eyebrow: 'Nurturing Future Leaders in the Age of Innovation', body: home.about, buttonText: 'Explore now', buttonHref: '/about-us/about-vsm-mba-pgdm-colleges-in-mumbai/' },
  marquee: { items: [{ text: 'Discover', highlight: false }, { text: 'Learn', highlight: true }, { text: 'Lead', highlight: false }, { text: 'Innovate', highlight: true }, { text: 'Grow', highlight: false }] },
  program: { title: 'Our PGDM Program', eyebrow: 'Empower Your Future with Industry-Focused Education', ...home.pgdmProgram, buttonText: 'choose your pgdm program', buttonHref: ACADEMICS_PGDM_PATH },
  faculty: heading('Meet Our Industry-Oriented PGDM Faculty', 'Masters of Their Craft, Mentors for the Future', shared.facultyIntro),
  why: { ...heading('Why Choose VSM Among PGDM Colleges in Mumbai?', 'Elevating Your Professional Aspirations', shared.whyChooseIntro), image: home.whyChooseImage, items: shared.whyChooseItems },
  specialisations: { title: 'Explore Industry-Relevant PGDM Specialisations', buttonText: 'Know more', items: shared.specialisations },
  recruiters: { title: 'Companies Hiring Our PGDM Students' },
  internships: { title: 'Summer Internship 2025-27' },
  testimonials: { title: 'Hear from Our PGDM Students', eyebrow: 'What students say about us?' },
  events: { title: 'Upcoming Events' },
  life: { title: 'Life @ VSM' },
  faq: { ...heading('FAQ About PGDM Admissions', 'Empowering Your Academic Journey: Your Questions Answered', shared.faqIntro), items: shared.faqs, buttonText: 'More FAQs', buttonHref: '/admissions/mba-pgdm-admissions-process/' },
  cta: { ...home.cta, buttonText: 'Apply now', buttonHref: APPLY_PATH },
  enquiry: { title: 'Enquire Now', eyebrow: 'Download Now', addressLabel: 'Address', contactLabel: 'Contact', openTimeLabel: 'Open Time', socialLabel: 'Stay Connected', addressTitle: contact.addressTitle, address: contact.address, openTime: contact.openTime, phones: contact.phones.map((phone, i) => ({ label: contact.phonesShort.split(' | ')[i], href: phone.href })) },
};
const masters = {
  hero: { items: home.heroSlides.map(item => ({ ...item, primaryText: 'Apply Now', primaryHref: APPLY_PATH, secondaryText: 'Enquire now', secondaryHref: '#enquire-now', enabled: true })) },
  faculty: { items: shared.faculty.map(item => ({ ...item, shortRole: item.shortRole ?? '', enabled: true })) },
  recruiters: { items: shared.recruiters.map(item => ({ ...item, enabled: true })) },
  internships: { items: shared.internships.map(item => ({ ...item, enabled: true })) },
  testimonials: { items: shared.testimonials.map(item => ({ ...item, image: item.image ?? shared.testimonialFallbackImage, avatar: item.avatar ?? { src: '', alt: '', width: 80, height: 80 }, enabled: true })) },
  events: { items: home.homeEvents.map(item => ({ ...item, videoLink: item.videoLink ?? '', href: item.href ?? '', enabled: true })) },
  life: { items: home.homeLife.map(item => ({ ...item, caption: item.caption ?? '', href: item.href ?? '', enabled: true })) },
};
const labels = { hero: 'Hero banner', stats: 'Programme at a glance', about: 'About Us', marquee: 'Discover / Learn marquee (both occurrences)', program: 'Our PGDM Program', faculty: 'PGDM Faculty', why: 'Why Choose VSM', specialisations: 'PGDM Specialisations', recruiters: 'Companies Hiring Our PGDM Students', internships: 'Summer Internship', testimonials: 'Student Testimonials', events: 'Upcoming Events', life: 'Life @ VSM', faq: 'FAQs', cta: 'Apply Now banner', enquiry: 'Enquire Now' };
writeFileSync('packages/contracts/src/home.ts', `// Initial values imported from the existing VSM homepage. Persisted edits take precedence.\nexport const homeDefaults = ${JSON.stringify(defaults, null, 2)};\nexport const homeMasterDefaults = ${JSON.stringify(masters, null, 2)};\nexport const homeLabels = ${JSON.stringify(labels, null, 2)};\nexport type HomeContent = typeof homeDefaults;\nexport type HomeMasters = typeof homeMasterDefaults;\nexport type HomeKey = keyof HomeContent;\nexport type HomeMasterKey = keyof HomeMasters;\nexport type HomeHeading = { title: string; eyebrow: string; description?: string };\n`);
