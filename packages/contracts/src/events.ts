// Events pages (Events dropdown) — CMS defaults mirroring the current static page content.
// Each page is stored independently under `events.<page>.<section>` (masters: `events.<page>.master-<key>`).
import type { AcademicsHeroSlide } from './academics.js';
import { eventsGalleryImageUrls } from './events-gallery-data.js';

const FIG = '/images/figma';
const APPLY_PATH = '/admissions/application-form/';
const ADMISSIONS_EMAIL = 'mailto:admissions@vsmedu.in';
const HERO_SUBTITLE = "Navigating Today's Business World with Tomorrow's Leaders";

export type EventsImage = { src: string; alt: string; width: number; height: number };
export type EventsAlbumItem = { title: string; image: EventsImage; images: EventsImage[]; enabled: boolean };
export type EventsPhotoItem = EventsImage & { enabled: boolean };
export type EventsSpeakerItem = { name: string; role: string; designation?: string; company?: string; topic?: string; description?: string; date?: string; photoUrl?: string; enabled: boolean };
export type EventsVideoItem = { title: string; role: string; videoUrl: string; enabled: boolean };

const allPageLinks = [
  { label: 'Events', href: '/events/' },
  { label: 'Guest Speakers', href: '/list-of-speakers/' },
  { label: 'Photo Gallery', href: '/events/gallery/' },
  { label: 'Achievements', href: '/events/achievements/' },
  { label: 'Speaker Bites', href: '/videos-of-speakers/' },
];

const pageNav = (withoutEvents = false) => ({
  title: 'Event pages',
  links: structuredClone(withoutEvents ? allPageLinks.filter((link) => link.label !== 'Events') : allPageLinks),
});

const breadcrumb = (current: string) => ({
  breadcrumb: [
    { label: 'Home', href: '/' },
    { label: 'Events', href: '/events/' },
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

const albums = (rows: [string, string][]): EventsAlbumItem[] =>
  rows.map(([title, slug]) => {
    const images = (eventsGalleryImageUrls[slug] ?? []).map((src) => ({
      src,
      alt: `${title} at Valia School of Management`,
      width: 768,
      height: 432,
    }));
    const cover = images[0] ?? { src: `${FIG}/event-inauguration.webp`, alt: `${title} at Valia School of Management`, width: 768, height: 432 };
    return { title, image: { ...cover }, images: images.length ? images : [{ ...cover }], enabled: true };
  });

const HERO_LABEL = 'Page Banner Breadcrumb';
const HERO_SUBTITLE_TEXT = 'Breadcrumb trail for the banner. Heading, image and buttons are edited in Page Banner (slider).';
const NAV_LABEL = 'Event Page Links';
const NAV_SUBTITLE = 'Links bar below the banner that switches between Events pages.';

export const eventsPages = {
  gallery: {
    path: '/events/gallery/',
    navTitle: 'Photo Gallery',
    sections: {
      hero: breadcrumb('Gallery'),
      'page-nav': pageNav(true),
      intro: { title: 'Event Gallery', description: "Navigating Today's Business World with Tomorrow's Leaders" },
    },
    masters: {
      hero: { items: [bannerSlide('Gallery')] },
      albums: {
        items: albums([
          ['Out Bound 2026-28', 'out-bound-2026-28'], ['Dubai Tour 2026', 'testimonial-batch-2025-27'],
          ['Inaugration 2026', 'inaugration-2026'], ['Freshers party 2026', 'test'],
          ['Induction Week 2026', 'induction-week-2026'], ['Inauguration Ceremony 2026', 'inauguration-ceremony-2026'],
          ['Ramesh Iyer Sir – Seminar', 'mr-ramesh-sir-seminar'], ['Board Meeting', 'board-meeting'],
          ['Film City Visit Wheel of Fortune', 'film-city-visit-wheel-of-fortune'], ['NISM Visit', 'nism-visit'],
          ['Makar Sankranti – 2026', 'makar-sankranti-2026'], ['Induction Day – 2025', 'induction-day-2025'],
        ]),
      },
    },
    masterLabels: { hero: 'Page Banner', albums: 'Gallery Albums' },
    masterSections: { albums: 'intro' },
    labels: { hero: HERO_LABEL, 'page-nav': NAV_LABEL, intro: 'Gallery Heading' },
    subtitles: {
      hero: HERO_SUBTITLE_TEXT,
      'page-nav': NAV_SUBTITLE,
      intro: 'Heading and sub-heading above the album grid. Albums are managed from Website Pages → Gallery.',
    },
  },
  'gallery-2': {
    path: '/events/gallery/2/',
    navTitle: 'Photo Gallery – Page 2',
    sections: {
      hero: breadcrumb('Gallery'),
      'page-nav': pageNav(true),
      intro: { title: 'More from the Event Gallery', description: 'Student activities and campus moments at Valia School of Management.' },
    },
    masters: {
      hero: { items: [bannerSlide('Gallery')] },
      albums: {
        items: albums([
          ['Silvassa Industrial Visit', 'silvassa-industrial-visit'], ['Outbound Activity', 'outbound-activity'], ['Infra', 'infra'],
          ['Inauguration – 2025', 'inauguration-2025'], ['GYF', 'gyf'], ['Garba Night – 2025', 'garba-night-2025'],
          ['Christmas – 2025', 'christmas'], ['Celebrity', 'celebrity'], ['Diwali – 2025', 'diwali-2025'],
        ]),
      },
    },
    masterLabels: { hero: 'Page Banner', albums: 'Gallery Albums' },
    masterSections: { albums: 'intro' },
    labels: { hero: HERO_LABEL, 'page-nav': NAV_LABEL, intro: 'Gallery Heading' },
    subtitles: {
      hero: HERO_SUBTITLE_TEXT,
      'page-nav': NAV_SUBTITLE,
      intro: 'Heading and sub-heading above the album grid. Albums are managed from Website Pages → Gallery.',
    },
  },
  achievements: {
    path: '/events/achievements/',
    navTitle: 'Achievements',
    sections: {
      hero: breadcrumb('Achievements'),
      'page-nav': pageNav(),
      intro: {
        title: 'Bright Education Visionaries Awards 2025',
        description: 'Valia School of Management celebrates recognition for its contribution to education and management learning.',
      },
    },
    masters: {
      hero: { items: [bannerSlide('Achievements')] },
      photos: {
        items: ([
          ['r3-768x960.jpeg', 'Bright Education Visionaries Awards 2025 – event photograph 1'],
          ['r2-768x960.jpeg', 'Bright Education Visionaries Awards 2025 – event photograph 2'],
          ['r1.jpeg', 'Bright Education Visionaries Awards 2025 – event photograph 3'],
        ] as [string, string][]).map(([file, alt]): EventsPhotoItem => ({
          src: `https://vsmedu.com/wp-content/uploads/2026/06/${file}`,
          alt,
          width: 768,
          height: 960,
          enabled: true,
        })),
      },
    },
    masterLabels: { hero: 'Page Banner', photos: 'Achievement Photos' },
    masterSections: { photos: 'intro' },
    labels: { hero: HERO_LABEL, 'page-nav': NAV_LABEL, intro: 'Achievement Heading' },
    subtitles: {
      hero: HERO_SUBTITLE_TEXT,
      'page-nav': NAV_SUBTITLE,
      intro: 'Award heading and description above the photos. Photos are managed in Achievement Photos.',
    },
  },
  'list-of-speakers': {
    path: '/list-of-speakers/',
    navTitle: 'Guest Speakers',
    sections: {
      hero: breadcrumb('List of Speakers'),
      'page-nav': pageNav(),
      intro: { title: 'Campus-Corporate Connect', description: 'Industry leaders share practical perspectives and experience with VSM students.' },
    },
    masters: {
      hero: { items: [bannerSlide('List of Speakers')] },
      speakers: {
        items: ([
          ['Dr. Neil Sequeira', 'COO, Thane Cancer Hospital'],
          ['Mr. G.A. Sastry', 'Asst. Sr. Vice President – Marketing, Mahindra Finance'],
          ['Dr. Shishir Vahia', 'Vice President, SageIT'],
          ['Mr. Purv Shah', 'Consultant & Trainer and News Provider for Channels on Financial Markets'],
          ['Mr. Pranay Shah', 'Vice President, UBS'],
          ['Mr. Gaurav Ghelani', 'Regional Head, TCS Talent Acquisition Group'],
          ['Ms. Pratibha Dewett', 'Chief Sustainability & Marketing Officer, Lucro Plastecycle Pvt. Ltd'],
          ['Mr. Rajesh Devasia', 'Founder & CEO, Clevermind Technologies'],
          ['Dr. Arloph John Vieira', 'Sr. Vice President, Bajaj Healthcare Limited'],
        ] as [string, string][]).map(([name, role]): EventsSpeakerItem => ({ name, role, designation: '', company: '', topic: '', description: '', date: '', photoUrl: '', enabled: true })),
      },
    },
    masterLabels: { hero: 'Page Banner', speakers: 'Speakers' },
    masterSections: { speakers: 'intro' },
    labels: { hero: HERO_LABEL, 'page-nav': NAV_LABEL, intro: 'Speakers Heading' },
    subtitles: {
      hero: HERO_SUBTITLE_TEXT,
      'page-nav': NAV_SUBTITLE,
      intro: 'Heading and description above the speaker cards. Speakers are managed in Speakers.',
    },
  },
  'videos-of-speakers': {
    path: '/videos-of-speakers/',
    navTitle: 'Speaker Bites',
    sections: {
      hero: breadcrumb('Campus-Corporate Connect'),
      'page-nav': pageNav(),
      intro: {
        title: 'Campus-Corporate Connect',
        description: "Business leaders and practitioners bring their experience to the classroom through VSM's corporate connect sessions.",
      },
    },
    masters: {
      hero: { items: [bannerSlide('Campus-Corporate Connect')] },
      videos: {
        items: ([
          ['Dr. Neil Sequeira – Session 1', 'COO, Thane Cancer Hospital', 'IMG_9591.mp4'],
          ['Dr. Neil Sequeira – Session 2', 'COO, Thane Cancer Hospital', 'IMG_9619.mp4'],
          ['Mr. G.A. Sastry', 'Asst. Sr. Vice President – Marketing, Mahindra Finance', 'WhatsApp-Video-2025-08-20-at-11.09.09-AM.mp4'],
          ['Dr. Shishir Vahia', 'Vice President, SageIT', 'WhatsApp-Video-2025-08-20-at-11.11.40-AM.mp4'],
          ['Mr. Purv Shah', 'Consultant & Trainer and News Provider for Channels on Financial Markets', 'WhatsApp-Video-2025-08-07-at-3.31.41-PM.mp4'],
          ['Mr. Pranay Shah', 'Vice President, UBS', 'WhatsApp-Video-2025-08-07-at-3.31.00-PM.mp4'],
          ['Mr. Gaurav Ghelani', 'Regional Head, TCS Talent Acquisition Group', 'WhatsApp-Video-2025-08-07-at-3.29.34-PM.mp4'],
          ['Ms. Pratibha Dewett', 'Chief Sustainability & Marketing Officer, Lucro Plastecycle Pvt. Ltd', 'WhatsApp-Video-2025-08-07-at-2.20.39-PM.mp4'],
          ['Mr. Rajesh Devasia', 'Founder & CEO, Clevermind Technologies', 'WhatsApp-Video-2025-08-08-at-1.42.58-PM.mp4'],
          ['Dr. Arloph John Vieira', 'Sr. Vice President, Bajaj Healthcare Limited', 'WhatsApp-Video-2025-08-18-at-11.40.35-AM.mp4'],
        ] as [string, string, string][]).map(([title, role, file]): EventsVideoItem => ({
          title,
          role,
          videoUrl: `https://vsmedu.com/wp-content/uploads/2025/09/${file}`,
          enabled: true,
        })),
      },
    },
    masterLabels: { hero: 'Page Banner', videos: 'Speaker Videos' },
    masterSections: { videos: 'intro' },
    labels: { hero: HERO_LABEL, 'page-nav': NAV_LABEL, intro: 'Speaker Videos Heading' },
    subtitles: {
      hero: HERO_SUBTITLE_TEXT,
      'page-nav': NAV_SUBTITLE,
      intro: 'Heading and description above the video cards. Videos are managed in Speaker Videos.',
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

export type EventsPageSlug = keyof typeof eventsPages;
export const eventsPageSlugs = Object.keys(eventsPages) as EventsPageSlug[];

/** Master keys (including `hero`) for one Events page, in display order. */
export function eventsMasterKeys(slug: EventsPageSlug): string[] {
  return Object.keys(eventsPages[slug].masters);
}
