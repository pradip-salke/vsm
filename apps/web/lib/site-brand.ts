import 'server-only';
import { footerDefaults } from '@vsmedu/contracts/footer';

export async function getWebsiteLogo(): Promise<string> {
  try {
    const response = await fetch(`${process.env.API_BASE_URL ?? 'http://localhost:4000'}/api/v1/public/footer`, {
      cache: 'no-store',
      signal: AbortSignal.timeout(4000),
    });
    if (!response.ok) throw new Error(`Footer API returned ${response.status}`);
    const result = await response.json() as { data?: { content?: { about?: { logoUrl?: string } } } };
    return result.data?.content?.about?.logoUrl?.trim() || footerDefaults.about.logoUrl;
  } catch {
    return footerDefaults.about.logoUrl;
  }
}
