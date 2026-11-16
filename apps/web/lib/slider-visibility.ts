import 'server-only';

export type SliderVisibility = Record<'faculty' | 'recruiters' | 'internships' | 'testimonials', boolean>;

export async function getSliderVisibility(scope: string): Promise<SliderVisibility> {
  const masters = ['faculty', 'recruiters', 'internships', 'testimonials'] as const;
  const entries = await Promise.all(masters.map(async master => {
    const fallback = master === 'faculty' ? ['home', 'aicte'].includes(scope) : true;
    try {
      const response = await fetch(`${process.env.API_BASE_URL ?? 'http://localhost:4000'}/api/v1/public/slider-visibility/${master}`, { cache: 'no-store', signal: AbortSignal.timeout(5000) });
      if (!response.ok) return [master, fallback] as const;
      const result = await response.json() as { data: { pages: string[] } };
      return [master, result.data.pages.includes(scope)] as const;
    } catch { return [master, fallback] as const; }
  }));
  return Object.fromEntries(entries) as SliderVisibility;
}
