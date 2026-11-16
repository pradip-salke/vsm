import 'server-only';
import type { HomeMasters } from '@vsmedu/contracts/home';
import type { ImageAsset } from '@/content/types';

export type CommonSlides = {
  faculty: HomeMasters['faculty']['items'];
  recruiters: HomeMasters['recruiters']['items'];
  internships: (ImageAsset & { enabled?: boolean })[];
  video: HomeMasters['testimonials']['items'];
  written: HomeMasters['testimonials']['items'];
};

export async function getCommonSlides(scope: string): Promise<CommonSlides | null> {
  try {
    const response = await fetch(`${process.env.API_BASE_URL ?? 'http://localhost:4000'}/api/v1/public/common-slides/${encodeURIComponent(scope)}`, { cache: 'no-store', signal: AbortSignal.timeout(10000) });
    if (!response.ok) return null;
    return (await response.json() as { data: CommonSlides }).data;
  } catch { return null; }
}
