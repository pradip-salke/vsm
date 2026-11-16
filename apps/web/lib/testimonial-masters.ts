import 'server-only';
import type { HomeMasters } from '@vsmedu/contracts/home';

type Items = HomeMasters['testimonials']['items'];

export async function getTestimonialMasters(scope: string, fallback: Items): Promise<{ video: Items; written: Items }> {
  const load = async (kind: 'video' | 'written') => {
    try {
      const response = await fetch(`${process.env.API_BASE_URL ?? 'http://localhost:4000'}/api/v1/public/testimonials/${encodeURIComponent(scope)}/${kind}`, { cache: 'no-store', signal: AbortSignal.timeout(5000) });
      if (!response.ok) throw new Error('Testimonials unavailable');
      const payload = await response.json() as { data: { content: { items: Items } } };
      return payload.data.content.items;
    } catch {
      return fallback.filter(item => kind === 'video' ? Boolean(item.videoLink?.trim()) : Boolean(item.quote?.trim()));
    }
  };
  const [video, written] = await Promise.all([load('video'), load('written')]);
  return { video, written };
}
