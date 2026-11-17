import 'server-only';

export type CmsImage = { src: string; alt?: string; width?: number; height?: number };
export type CmsProfile = { name: string; role?: string; details?: string[]; image?: string | CmsImage; enabled?: boolean };
export type CmsSection = Record<string, unknown>;
export type CmsPageData = { path?: string; sections: Record<string, CmsSection>; masters: Record<string, CmsSection> };

async function readCmsPage(path: string): Promise<CmsPageData | null> {
  try {
    const response = await fetch(`${process.env.API_BASE_URL ?? 'http://localhost:4000'}/api/v1/public/${path}`, {
      cache: 'no-store',
      signal: AbortSignal.timeout(5000),
    });
    if (!response.ok) throw new Error(`CMS content API returned ${response.status}`);
    const result = await response.json() as { data?: CmsPageData };
    return result.data?.sections && result.data?.masters ? result.data : null;
  } catch (error) {
    console.error(`CMS content unavailable for ${path}; using bundled page defaults.`, error instanceof Error ? error.message : 'Unknown error');
    return null;
  }
}

export const getAboutPageContent = (slug: string) => readCmsPage(`about/${encodeURIComponent(slug)}`);
export const getPlacementsPageContent = (slug: string) => readCmsPage(`placements/${encodeURIComponent(slug)}`);
export const getEventsPageContent = (slug: string) => readCmsPage(`events/${encodeURIComponent(slug)}`);
export const getCareerPageContent = (slug: string) => readCmsPage(`career/${encodeURIComponent(slug)}`);
export const getAdmissionsPageContent = (slug: string) => readCmsPage(`admissions/${encodeURIComponent(slug)}`);

export function cmsString(value: unknown, fallback = ''): string {
  return typeof value === 'string' ? value : fallback;
}

export function cmsImage(value: unknown, fallback: CmsImage): CmsImage {
  if (typeof value === 'string') return { ...fallback, src: value };
  if (!value || typeof value !== 'object') return fallback;
  const image = value as CmsImage;
  return {
    src: cmsString(image.src, fallback.src),
    alt: cmsString(image.alt, fallback.alt ?? ''),
    width: typeof image.width === 'number' ? image.width : fallback.width,
    height: typeof image.height === 'number' ? image.height : fallback.height,
  };
}

export function cmsProfiles(value: unknown, fallback: CmsProfile[]): CmsProfile[] {
  if (!Array.isArray(value)) return fallback;
  return value.map((item, index) => {
    const old = fallback[index];
    const profile: CmsProfile = item && typeof item === 'object' ? item as CmsProfile : { name: old?.name ?? `Profile ${index + 1}` };
    return {
      ...old,
      ...profile,
      name: cmsString(profile.name, old?.name ?? `Profile ${index + 1}`),
      role: cmsString(profile.role, old?.role ?? ''),
      details: Array.isArray(profile.details) ? profile.details.map(String) : old?.details,
      image: profile.image ?? old?.image,
    };
  }).filter(profile => profile.enabled !== false);
}

export function cmsParagraphs(html: unknown, fallback: string[]): string[] {
  if (typeof html !== 'string' || !html.trim()) return fallback;
  return Array.from(html.matchAll(/<p\b[^>]*>([\s\S]*?)<\/p>/gi), (match) => match[1].replace(/<[^>]*>/g, '').trim()).filter(Boolean);
}
