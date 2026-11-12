import 'server-only';
import { homeDefaults, homeMasterDefaults, type HomeContent, type HomeMasters } from '@vsmedu/contracts/home';

export async function getHomeContent(): Promise<{ sections: HomeContent; masters: HomeMasters }> {
  try {
    const response = await fetch(`${process.env.API_BASE_URL ?? 'http://localhost:4000'}/api/v1/public/home`, { cache: 'no-store', signal: AbortSignal.timeout(5000) });
    if (!response.ok) throw new Error(`Homepage API returned ${response.status}`);
    return (await response.json()).data;
  } catch (error) {
    console.error('Homepage content API unavailable; retaining imported website content.', error instanceof Error ? error.message : 'Unknown error');
    return { sections: homeDefaults, masters: homeMasterDefaults };
  }
}
