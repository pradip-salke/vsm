import 'server-only';
import type { EventsAlbumItem } from '@vsmedu/contracts/events';

export type GalleryAlbum = EventsAlbumItem & { pages?: string[] };

export async function getGalleryAlbums(page: 'events-gallery' | 'events-gallery-2'): Promise<GalleryAlbum[] | null> {
  try {
    const response = await fetch(`${process.env.API_BASE_URL ?? 'http://localhost:4000'}/api/v1/public/gallery/${page}`, { cache: 'no-store', signal: AbortSignal.timeout(10000) });
    if (!response.ok) return null;
    return (await response.json() as { data: GalleryAlbum[] }).data;
  } catch {
    return null;
  }
}
