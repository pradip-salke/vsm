/** Convert CMS-pasted YouTube/embed input into the URL stored in videoLink. */
export function normalizeVideoLink(value: unknown): string {
  if (typeof value !== 'string') return '';
  const trimmed = value.trim();
  if (!trimmed) return '';
  const iframeSrc = trimmed.match(/<iframe\b[^>]*\bsrc\s*=\s*(["'])(.*?)\1/i)?.[2];
  let source = (iframeSrc ?? trimmed).replace(/&amp;/gi, '&').replace(/\\\//g, '/').trim();
  if (source.startsWith('//')) source = `https:${source}`;
  else if (/^(?:www\.)?(?:youtube\.com|youtu\.be)\//i.test(source)) source = `https://${source}`;
  return source;
}
