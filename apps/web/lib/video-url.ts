/** Extract the usable URL from the formats accepted by the CMS video field. */
export function normalizeVideoUrl(value: string | null | undefined): string | null {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  if (!trimmed) return null;

  const iframeSrc = trimmed.match(/<iframe\b[^>]*\bsrc\s*=\s*(["'])(.*?)\1/i)?.[2];
  const source = (iframeSrc ?? trimmed)
    .replace(/&amp;/gi, '&')
    .replace(/\\\//g, '/')
    .trim();

  if (/^[\w-]{11}$/.test(source)) return source;
  if (source.startsWith('//')) return `https:${source}`;
  if (/^(?:https?:\/\/|\/)/i.test(source)) return source;
  if (/^(?:www\.)?(?:youtube\.com|youtu\.be)\//i.test(source)) return `https://${source}`;
  return null;
}

export function youtubeVideoId(value: string): string | null {
  const source = normalizeVideoUrl(value);
  if (!source || /^[\w-]{11}$/.test(source)) return source || null;
  try {
    const url = new URL(source);
    const host = url.hostname.toLowerCase().replace(/^www\./, '').replace(/^m\./, '');
    const segments = url.pathname.split('/').filter(Boolean);
    let id = '';

    if (host === 'youtu.be') id = segments[0] ?? '';
    else if (host === 'youtube.com' || host === 'youtube-nocookie.com') {
      if (url.pathname.toLowerCase() === '/watch') id = url.searchParams.get('v') ?? '';
      else if (/^(embed|shorts|live)$/i.test(segments[0] ?? '')) id = segments[1] ?? '';
    }

    return /^[\w-]{11}$/.test(id) ? id : null;
  } catch {
    return null;
  }
}

export function videoThumbnailUrl(value: string): string | null {
  const id = youtubeVideoId(value);
  return id ? `https://i.ytimg.com/vi/${id}/hqdefault.jpg` : null;
}

export function youtubeEmbedUrl(value: string): string | null {
  const id = youtubeVideoId(value);
  return id ? `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&playsinline=1&rel=0` : null;
}
