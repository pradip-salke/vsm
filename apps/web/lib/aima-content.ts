import 'server-only';
import { aimaDefaults, aimaMasterDefaults, type AimaContent, type AimaMasters } from '@vsmedu/contracts/academics-aima';

export async function getAimaContent(): Promise<{ sections: AimaContent; masters: AimaMasters }> {
  try {
    const response = await fetch(`${process.env.API_BASE_URL ?? 'http://localhost:4000'}/api/v1/public/academics/aima`, { cache: 'no-store', signal: AbortSignal.timeout(5000) });
    if (!response.ok) throw new Error(`AIMA content API returned ${response.status}`);
    const payload = (await response.json()).data;
    return { sections: { ...aimaDefaults, ...payload.sections }, masters: { ...aimaMasterDefaults, ...payload.masters } };
  } catch (error) {
    console.error('AIMA CMS unavailable; using bundled defaults.', error instanceof Error ? error.message : 'Unknown error');
    return { sections: { ...aimaDefaults, faq: { ...aimaDefaults.faq, items: [] } }, masters: aimaMasterDefaults };
  }
}
