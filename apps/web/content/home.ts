import type { HeroSlide, ImageAsset, MediaItem } from './types';
import { events, lifeAtVsm } from './shared';

const FIG = '/images/figma';

const heroTitle = '2-YEARS FULL TIME AICTE APPROVED PGDM in Mumbai';
const heroSubtitle = 'Building Future-Ready Leaders Through AI, Analytics And Industry Immersion.';

export const heroSlides: HeroSlide[] = [1, 2, 3].map((n) => ({
  image: {
    src: `${FIG}/hero-${n}.webp`,
    alt: 'Valia School of Management PGDM students on campus',
    width: 1918,
    height: 820,
  },
  title: heroTitle,
  subtitle: heroSubtitle,
}));

export const stats = [
  { value: '6.5 L', label: 'Full Course Fees', description: 'Invest Smart, Reap Lifelong Rewards.' },
  { value: '200+', label: 'Corporate Network', description: 'Broaden Your Horizons with Elite Companies' },
  { value: '100%', label: 'Placement Assistance', description: 'Specialize in Your Passion, Shape Your Future' },
  { value: '3+', label: 'Month Guaranteed Internship', description: 'Accelerate Your Career with Hands-On Learning' },
];

export const about =
  'Nestled in the heart of Mumbai, Valia School of Management (VSM) is more than just a management institute; it’s a hub where future leaders are shaped.  Our core focuses -Marketing, Finance, Human Resources, Business Analytics, and Operations And Supply Chain Management, - are woven into a curriculum led by industry veterans. With a commitment to practical, real-world learning, our students embark on transformative journeys, including a 6-month intensive internship with leading corporates. VSM stands not just as an educational institute but as one of the best PGDM college in Mumbai, serving catalyst for future-ready leaders poised to make a meaningful impact in the business world. Explore our PGDM courses in Mumbai and join us on the path to success.';

export const pgdmProgram = {
  poster: {
    src: `${FIG}/pgdm-video-poster.webp`,
    alt: 'Valia School of Management PGDM programme video',
    width: 1895,
    height: 1559,
  } satisfies ImageAsset,
  subtitle: '2-Year AICTE-Approved PGDM Programs in Mumbai',
  lead: 'Unlock Your Potential with Our PGDM Courses',
  body: 'At Valia School of Management (VSM), our Post Graduate Diploma in Management (PGDM) is more than just a degree, it’s a journey towards industry excellence. This 2-year, AICTE-approved course is meticulously designed to bridge the gap between academic theories and real-world business practices. Our focus on practical learning is reflected in our curriculum, which includes rigorous case studies and value-added guest sessions by industry leaders. This approach not only equips our students with profound management knowledge but also hones their skills to thrive in the dynamic business environment. Experience our top PGDM programs and embark on a transformative journey towards success.',
  highlights: ['AICTE Approved', '3 Month Internships', 'Affordable Fees', '100% Placement Support', 'Industry-Led Curriculum'],
};

export const whyChooseImage: ImageAsset = {
  src: `${FIG}/why-dubai.webp`,
  alt: 'VSM students looking at the Dubai skyline during the international immersion',
  width: 1672,
  height: 941,
};

export const cta = {
  title: 'Nothing Beats Good Education For The Betterment Of A Student’s Future',
  image: { src: '/images/figma/cta-banner.webp', alt: '', width: 1920, height: 744 } satisfies ImageAsset,
};

export const homeEvents: MediaItem[] = events.map((event) => ({ image: event.image, caption: event.title, href: event.href }));
export const homeLife: MediaItem[] = lifeAtVsm.map((image) => ({ image }));
