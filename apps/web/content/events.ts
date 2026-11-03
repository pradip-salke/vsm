import type { ImageAsset } from './types';
import sourceGalleryImages from './gallery-images.json';

const base = '/images/figma';
const image = (name: string, alt: string): ImageAsset => ({ src: `${base}/${name}.webp`, alt, width: 768, height: 432 });
const classroom = image('event-inauguration', 'Students and faculty at a Valia School of Management event');
const galleryImages = (slug: string, title: string): ImageAsset[] => ((sourceGalleryImages as Record<string, string[]>)[slug] ?? []).map((src) => ({ src, alt: `${title} at Valia School of Management`, width: 768, height: 432 }));

export const galleryEvents = [
  ['Out Bound 2026-28', 'out-bound-2026-28'], ['Dubai Tour 2026', 'testimonial-batch-2025-27'],
  ['Inaugration 2026', 'inaugration-2026'], ['Freshers party 2026', 'test'],
  ['Induction Week 2026', 'induction-week-2026'], ['Inauguration Ceremony 2026', 'inauguration-ceremony-2026'],
  ['Ramesh Iyer Sir – Seminar', 'mr-ramesh-sir-seminar'], ['Board Meeting', 'board-meeting'],
  ['Film City Visit Wheel of Fortune', 'film-city-visit-wheel-of-fortune'], ['NISM Visit', 'nism-visit'],
  ['Makar Sankranti – 2026', 'makar-sankranti-2026'], ['Induction Day – 2025', 'induction-day-2025'],
].map(([title, slug], index) => {
  const images = galleryImages(slug, title);
  const fallback = index % 3 === 0 ? image('event-outbound', 'Students taking part in a Valia School of Management event') : index % 3 === 1 ? image('event-silvassa', 'Students at a Valia School of Management event') : classroom;
  return { title, href: `/gallery/${slug}/`, image: images[0] ?? fallback, images: images.length ? images : [fallback] };
});

export const archiveEvents = [
  ['Silvassa Industrial Visit', 'silvassa-industrial-visit'], ['Outbound Activity', 'outbound-activity'], ['Infra', 'infra'],
  ['Inauguration – 2025', 'inauguration-2025'], ['GYF', 'gyf'], ['Garba Night – 2025', 'garba-night-2025'],
  ['Christmas – 2025', 'christmas'], ['Celebrity', 'celebrity'], ['Diwali – 2025', 'diwali-2025'],
].map(([title, slug], index) => {
  const images = galleryImages(slug, title);
  const fallback = index % 2 ? image('event-outbound', `${title} at Valia School of Management`) : image('event-silvassa', `${title} at Valia School of Management`);
  return { title, href: `/gallery/${slug}/`, image: images[0] ?? fallback, images: images.length ? images : [fallback] };
});

const eventDetailsContent: Record<string, { title: string; paragraphs: string[]; image: ImageAsset }> = {
  'silvassa-industrial-visit': { title: 'Silvassa Industrial Visit', image: image('event-silvassa', 'Students at the Silvassa industrial visit'), paragraphs: ['The Silvassa industrial visit was a great learning experience as it helped the students to understand how businesses actually work in real life. Visiting Manfood (Parle-G) showed and made them understand how large-scale production and quality control are managed efficiently. At Navneet Education, they learned about the supply chain behind a well-known educational brand, and at Millennium Marbles, they witnessed how raw materials are converted into finished products. Overall, the visit helped the students to connect classroom concepts with real business operations.'] },
  'outbound-activity': { title: 'Outbound Activity', image: image('event-outbound', 'Students taking part in an outbound activity'), paragraphs: ['Valia School of Management students take part in experiential activities that encourage collaboration, communication and leadership beyond the classroom.'] },
  'inauguration-2025': { title: 'Inauguration', image: classroom, paragraphs: ['Valia School of Management welcomes its PGDM students with an inauguration and induction programme marking the beginning of their management journey.'] },
  'mba-junction': { title: 'Batch Inauguration – 2022–24', image: classroom, paragraphs: ['From September 12th to 14th, we celebrated the commencement of the PGDM Batch of 2022-2024 with an Inauguration and Induction Week. The event was a resounding success, marked by the vibrant energy and enthusiasm of our new students.', 'The Batch Inauguration for 2023-25 at Valia School of Management was a vibrant and enriching event that marked the beginning of an exciting journey for the new batch of PGDM students. Held from August 19th to 26th, 2023, the Induction and Orientation Week was a flurry of activities, energy, and learning.'] },
  'film-city-visit-wheel-of-fortune': { title: 'Batch Inauguration – 2023–25', image: image('event-outbound', 'PGDM batch inauguration and induction event'), paragraphs: ['The Batch Inauguration for 2023-25 at Valia School of Management marked the beginning of an exciting journey for the new batch of PGDM students. Held from August 19th to 26th, 2023, the Induction and Orientation Week was a flurry of activities, energy, and learning.'] },
};

export const eventDetails: Record<string, { title: string; paragraphs: string[]; image: ImageAsset; images: ImageAsset[] }> = Object.fromEntries(
  Object.entries(eventDetailsContent).map(([slug, item]) => {
    const images = galleryImages(slug, item.title);
    return [slug, { ...item, image: images[0] ?? item.image, images: images.length ? images : [item.image] }];
  }),
);

export const speakers = [
  ['Dr. Neil Sequeira', 'COO, Thane Cancer Hospital'],
  ['Mr. G.A. Sastry', 'Asst. Sr. Vice President – Marketing, Mahindra Finance'],
  ['Dr. Shishir Vahia', 'Vice President, SageIT'],
  ['Mr. Purv Shah', 'Consultant & Trainer and News Provider for Channels on Financial Markets'],
  ['Mr. Pranay Shah', 'Vice President, UBS'],
  ['Mr. Gaurav Ghelani', 'Regional Head, TCS Talent Acquisition Group'],
  ['Ms. Pratibha Dewett', 'Chief Sustainability & Marketing Officer, Lucro Plastecycle Pvt. Ltd'],
  ['Mr. Rajesh Devasia', 'Founder & CEO, Clevermind Technologies'],
  ['Dr. Arloph John Vieira', 'Sr. Vice President, Bajaj Healthcare Limited'],
];

export const speakerVideos = [
  { title: 'Dr. Neil Sequeira â€“ Session 1', role: 'COO, Thane Cancer Hospital', src: 'https://vsmedu.com/wp-content/uploads/2025/09/IMG_9591.mp4' },
  { title: 'Dr. Neil Sequeira â€“ Session 2', role: 'COO, Thane Cancer Hospital', src: 'https://vsmedu.com/wp-content/uploads/2025/09/IMG_9619.mp4' },
  { title: 'Mr. G.A. Sastry', role: 'Asst. Sr. Vice President â€“ Marketing, Mahindra Finance', src: 'https://vsmedu.com/wp-content/uploads/2025/09/WhatsApp-Video-2025-08-20-at-11.09.09-AM.mp4' },
  { title: 'Dr. Shishir Vahia', role: 'Vice President, SageIT', src: 'https://vsmedu.com/wp-content/uploads/2025/09/WhatsApp-Video-2025-08-20-at-11.11.40-AM.mp4' },
  { title: 'Mr. Purv Shah', role: 'Consultant & Trainer and News Provider for Channels on Financial Markets', src: 'https://vsmedu.com/wp-content/uploads/2025/09/WhatsApp-Video-2025-08-07-at-3.31.41-PM.mp4' },
  { title: 'Mr. Pranay Shah', role: 'Vice President, UBS', src: 'https://vsmedu.com/wp-content/uploads/2025/09/WhatsApp-Video-2025-08-07-at-3.31.00-PM.mp4' },
  { title: 'Mr. Gaurav Ghelani', role: 'Regional Head, TCS Talent Acquisition Group', src: 'https://vsmedu.com/wp-content/uploads/2025/09/WhatsApp-Video-2025-08-07-at-3.29.34-PM.mp4' },
  { title: 'Ms. Pratibha Dewett', role: 'Chief Sustainability & Marketing Officer, Lucro Plastecycle Pvt. Ltd', src: 'https://vsmedu.com/wp-content/uploads/2025/09/WhatsApp-Video-2025-08-07-at-2.20.39-PM.mp4' },
  { title: 'Mr. Rajesh Devasia', role: 'Founder & CEO, Clevermind Technologies', src: 'https://vsmedu.com/wp-content/uploads/2025/09/WhatsApp-Video-2025-08-08-at-1.42.58-PM.mp4' },
  { title: 'Dr. Arloph John Vieira', role: 'Sr. Vice President, Bajaj Healthcare Limited', src: 'https://vsmedu.com/wp-content/uploads/2025/09/WhatsApp-Video-2025-08-18-at-11.40.35-AM.mp4' },
];
