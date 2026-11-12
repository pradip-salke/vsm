import 'server-only';
import { cache } from 'react';
import { headers } from 'next/headers';
import type { Metadata } from 'next';
import {
  normaliseSeoPath,
  seoGlobalDefaults,
  seoTrackingDefaults,
  type SeoGlobalSettings,
  type SeoPageOverride,
  type SeoTrackingSettings,
} from '@vsmedu/contracts/seo';

export type SeoPayload = { path: string; siteUrl: string; global: SeoGlobalSettings; tracking: SeoTrackingSettings; page: SeoPageOverride | null };

/** SEO Studio settings for one URL; falls back to the page's own metadata when the CMS is unavailable. */
export const getSeo = cache(async (rawPath: string): Promise<SeoPayload> => {
  const path = normaliseSeoPath(rawPath);
  try {
    const response = await fetch(`${process.env.API_BASE_URL ?? 'http://localhost:4000'}/api/v1/public/seo?path=${encodeURIComponent(path)}`, { cache: 'no-store', signal: AbortSignal.timeout(4000) });
    if (!response.ok) throw new Error(`SEO API returned ${response.status}`);
    const data = (await response.json()).data as SeoPayload;
    return { ...data, global: { ...seoGlobalDefaults, ...data.global }, tracking: { ...seoTrackingDefaults, ...data.tracking } };
  } catch (error) {
    console.error('SEO settings unavailable; using page metadata only.', error instanceof Error ? error.message : 'Unknown error');
    return { path, siteUrl: process.env.WEB_ORIGIN ?? 'http://localhost:3000', global: seoGlobalDefaults, tracking: seoTrackingDefaults, page: null };
  }
});

/** The admin's SEO inspection requests the page "as built" (without Page SEO overrides) to show the original values. */
async function wantsOriginal() {
  return (await headers()).get('x-vsm-seo-original') === '1';
}

/** Current request path, set by middleware.ts. */
export async function currentPath() {
  return normaliseSeoPath((await headers()).get('x-vsm-pathname') ?? '/');
}

const imageUrl = (images: NonNullable<Metadata['openGraph']>['images']) => {
  const first = Array.isArray(images) ? images[0] : images;
  if (!first) return '';
  return typeof first === 'string' || first instanceof URL ? String(first) : String(first.url);
};

/**
 * Applies Page SEO overrides (only the fields filled in) and global defaults (only where the page has none)
 * on top of a page's own metadata.
 */
export async function withSeo(rawPath: string, base: Metadata): Promise<Metadata> {
  const path = normaliseSeoPath(rawPath);
  const [seo, original] = await Promise.all([getSeo(path), wantsOriginal()]);
  const page = original ? null : seo.page;
  const global = seo.global;
  const metadata: Metadata = { ...base };

  if (page?.metaTitle) metadata.title = { absolute: page.metaTitle };
  if (page?.metaDescription) metadata.description = page.metaDescription;
  const canonical = page?.canonicalUrl || (base.alternates?.canonical ? String(base.alternates.canonical) : path);
  metadata.alternates = { ...base.alternates, canonical };
  if (page && page.robots !== 'index, follow') metadata.robots = page.robots;
  if (page?.metaKeywords) metadata.keywords = page.metaKeywords.split(',').map((keyword) => keyword.trim()).filter(Boolean);

  const description = page?.ogDescription || page?.metaDescription || (typeof base.description === 'string' ? base.description : undefined);
  const title = page?.ogTitle || page?.metaTitle || undefined;
  const image = page?.ogImage || imageUrl(base.openGraph?.images) || (original ? '' : global.defaultShareImage);
  metadata.openGraph = {
    type: 'website',
    siteName: global.orgName || undefined,
    url: canonical,
    ...base.openGraph,
    ...(title ? { title } : {}),
    ...(description ? { description } : {}),
    ...(image ? { images: [{ url: image, width: 1200, height: 630 }] } : {}),
  };
  metadata.twitter = {
    card: image ? 'summary_large_image' : 'summary',
    ...(global.twitterHandle ? { site: global.twitterHandle } : {}),
    ...base.twitter,
    ...(title ? { title } : {}),
    ...(description ? { description } : {}),
    ...(image ? { images: [image] } : {}),
  };
  return metadata;
}

/** Site-wide metadata for the root layout: metadataBase and search engine verification tags. */
export async function globalSeoMetadata(base: Metadata): Promise<Metadata> {
  const { siteUrl, global } = await getSeo(await currentPath());
  let metadataBase: URL | undefined;
  try {
    metadataBase = new URL(siteUrl);
  } catch {
    metadataBase = undefined;
  }
  const other: Record<string, string> = {};
  if (global.bingVerification) other['msvalidate.01'] = global.bingVerification;
  if (global.pinterestVerification) other['p:domain_verify'] = global.pinterestVerification;
  if (global.facebookVerification) other['facebook-domain-verification'] = global.facebookVerification;
  return {
    ...base,
    metadataBase,
    verification: {
      ...(global.googleVerification ? { google: global.googleVerification } : {}),
      ...(global.yandexVerification ? { yandex: global.yandexVerification } : {}),
      ...(Object.keys(other).length ? { other } : {}),
    },
  };
}
