import 'server-only';

type CardImage = { src: string; alt: string; width: number; height: number };

export async function getAboutCardImages(page: string, section: string): Promise<{ title: string; text: string; image: CardImage }[] | null> {
  try {
    const response = await fetch(`${process.env.API_BASE_URL ?? 'http://localhost:4000'}/api/v1/public/about/${encodeURIComponent(page)}`, { cache: 'no-store', signal: AbortSignal.timeout(5000) });
    if (!response.ok) return null;
    const result = await response.json() as { data?: { sections?: Record<string, { cards?: { title: string; text: string; image: CardImage }[] }> } };
    return result.data?.sections?.[section]?.cards ?? null;
  } catch {
    return null;
  }
}
