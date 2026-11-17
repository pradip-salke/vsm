import 'server-only';
import { FooterContentSchema, footerDefaults, type FooterContent } from '@vsmedu/contracts/footer';

export async function getPublicFooter(): Promise<FooterContent> {
  try {
    const response = await fetch(`${process.env.API_BASE_URL ?? 'http://localhost:4000'}/api/v1/public/footer`, {
      cache: 'no-store',
      signal: AbortSignal.timeout(4000),
    });
    if (!response.ok) throw new Error(`Footer API returned ${response.status}`);
    const result = await response.json() as { data?: { content?: FooterContent } };
    return FooterContentSchema.parse(result.data?.content ?? footerDefaults);
  } catch {
    return footerDefaults;
  }
}

export async function getWebsiteLogo(): Promise<string> {
  const footer = await getPublicFooter();
  return footer.about.logoUrl?.trim() || footerDefaults.about.logoUrl;
}
