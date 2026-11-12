import 'server-only';
import { academicsDefaults, type AcademicsVideoItem } from '@vsmedu/contracts/academics';
import { eventsPages, type EventsVideoItem } from '@vsmedu/contracts/events';

const apiBase = process.env.API_BASE_URL ?? 'http://localhost:4000';

export async function getProgramVideoContent(): Promise<{ title: string; items: AcademicsVideoItem[] }> {
  try {
    const response = await fetch(`${apiBase}/api/v1/public/academics/program-videos`, { cache: 'no-store', signal: AbortSignal.timeout(5000) });
    if (!response.ok) throw new Error(`Program video API returned ${response.status}`);
    const json: { data?: { section?: { title?: string }; master?: { items?: AcademicsVideoItem[] }; gallery?: { items?: AcademicsVideoItem[] } } } = await response.json();
    const items = (json.data?.master?.items ?? []).filter((item) => item.enabled !== false);
    const galleryVideos = (json.data?.gallery?.items ?? []).filter((item) => item.enabled !== false && item.videoLink?.trim());
    const missingVideo = items.some((item) => !item.videoLink?.trim());
    // Reuse Gallery videos first; published speaker videos provide a fallback until dedicated URLs are assigned.
    const existingVideos = missingVideo && galleryVideos.length === 0 ? await getSpeakerVideoContent() : null;
    const fallbackVideoUrls = galleryVideos.length
      ? galleryVideos.map((item) => item.videoLink!.trim())
      : (existingVideos?.videos ?? []).map((item) => item.videoUrl);
    return {
      title: json.data?.section?.title || academicsDefaults['program-videos'].title,
      items: items.map((item, index) => ({ ...item, videoLink: item.videoLink?.trim() || fallbackVideoUrls[index % Math.max(fallbackVideoUrls.length, 1)] || '' })),
    };
  } catch (error) {
    console.error('Program video content API unavailable.', error instanceof Error ? error.message : 'Unknown error');
    return { title: academicsDefaults['program-videos'].title, items: [] };
  }
}

export async function getSpeakerVideoContent(): Promise<{
  title: string;
  description: string;
  videos: EventsVideoItem[];
}> {
  const fallback = eventsPages['videos-of-speakers'];
  try {
    const response = await fetch(`${apiBase}/api/v1/public/events/videos-of-speakers`, { cache: 'no-store', signal: AbortSignal.timeout(5000) });
    if (!response.ok) throw new Error(`Speaker video API returned ${response.status}`);
    const json: { data?: { sections?: { intro?: { title?: string; description?: string } }; masters?: { videos?: { items?: EventsVideoItem[] } } } } = await response.json();
    return {
      title: json.data?.sections?.intro?.title || fallback.sections.intro.title,
      description: json.data?.sections?.intro?.description || fallback.sections.intro.description,
      videos: json.data?.masters?.videos?.items ?? [],
    };
  } catch (error) {
    console.error('Speaker video content API unavailable.', error instanceof Error ? error.message : 'Unknown error');
    return {
      title: fallback.sections.intro.title,
      description: fallback.sections.intro.description,
      videos: [],
    };
  }
}
