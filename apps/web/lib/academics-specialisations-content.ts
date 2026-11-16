import 'server-only';
import {
  academicsSpecialisationDefaults,
  academicsSpecialisationMasterDefaults,
  type AcademicsSpecialisationSlug,
} from '@vsmedu/contracts/academics-specialisations';
import type { ImageAsset } from '@/content/types';
import { homeDefaults, homeMasterDefaults, type HomeMasters } from '@vsmedu/contracts/home';

type InternshipContent = { title: string; items: (ImageAsset & { enabled?: boolean })[] };
type SpecialisationClosingContent = {
  why: (typeof academicsSpecialisationDefaults)[AcademicsSpecialisationSlug]['why'];
  admission: (typeof academicsSpecialisationDefaults)[AcademicsSpecialisationSlug]['admission'];
  careers: (typeof academicsSpecialisationDefaults)[AcademicsSpecialisationSlug]['careers'];
  curriculum: (typeof academicsSpecialisationDefaults)[AcademicsSpecialisationSlug]['curriculum'];
  internships: InternshipContent;
  testimonials: typeof homeDefaults.testimonials & { items: HomeMasters['testimonials']['items'] };
};

export async function getSpecialisationClosingContent(slug: string): Promise<SpecialisationClosingContent> {
  const page = academicsSpecialisationDefaults[slug as AcademicsSpecialisationSlug];
  const specMasters = academicsSpecialisationMasterDefaults[slug as AcademicsSpecialisationSlug];
  const fallback: SpecialisationClosingContent = {
    why: page.why,
    admission: page.admission,
    careers: page.careers,
    curriculum: page.curriculum,
    internships: {
      title: page?.internships.title ?? 'Summer Internship 2025-27',
      items: specMasters?.internships.items ?? [],
    },
    testimonials: {
      ...(page?.testimonials ?? homeDefaults.testimonials),
      items: specMasters?.testimonials.items ?? homeMasterDefaults.testimonials.items,
    },
  };

  try {
    const response = await fetch(
      `${process.env.API_BASE_URL ?? 'http://localhost:4000'}/api/v1/public/academics/specialisations/${encodeURIComponent(slug)}`,
      { cache: 'no-store', signal: AbortSignal.timeout(5000) }
    );
    if (!response.ok) throw new Error(`Specialisation API returned ${response.status}`);
    const json: { data?: Partial<SpecialisationClosingContent> } = await response.json();
    return {
      why: json.data?.why ?? fallback.why,
      admission: json.data?.admission ?? fallback.admission,
      careers: json.data?.careers ? { ...json.data.careers, roles: json.data.careers.roles.map(item => typeof item === 'string' ? { text: item, icon: '/images/figma/icon-neutral.svg', iconSize: 32 } : item) } : fallback.careers,
      curriculum: json.data?.curriculum ? { ...json.data.curriculum, subjects: json.data.curriculum.subjects.map(item => typeof item === 'string' ? { text: item, icon: '/images/figma/icon-neutral.svg', iconSize: 32 } : item) } : fallback.curriculum,
      internships: json.data?.internships ?? fallback.internships,
      testimonials: json.data?.testimonials ?? fallback.testimonials,
    };
  } catch (error) {
    console.error(
      `Specialisation closing content unavailable for ${slug}; using bundled defaults.`,
      error instanceof Error ? error.message : 'Unknown error'
    );
    return fallback;
  }
}
