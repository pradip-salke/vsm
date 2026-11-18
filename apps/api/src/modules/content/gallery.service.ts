import { Prisma } from '@prisma/client';
import { z } from 'zod';
import { prisma } from '../../lib/prisma.js';
import { HttpError } from '../../middleware/errors.js';
import { homeMasterDefaults } from '@vsmedu/contracts/home';
import { academicsMasterDefaults } from '@vsmedu/contracts/academics';
import { academicsSpecialisationIndex } from '@vsmedu/contracts/academics-specialisations';
import { eventsPages } from '@vsmedu/contracts/events';

const pages = ['home', 'aicte', 'aima', ...academicsSpecialisationIndex.map(page => page.slug), 'events-gallery', 'events-gallery-2'];
const pageSet = new Set(pages);
const assetSchema = z.object({ src: z.string().max(2048), alt: z.string().max(1000), width: z.number().int().positive(), height: z.number().int().positive() }).passthrough();
const itemSchema = z.object({ image: assetSchema, caption: z.string().max(30000).optional(), href: z.string().max(2048).optional(), enabled: z.boolean().optional(), pages: z.array(z.string()).optional(), sections: z.array(z.enum(['life', 'events'])).max(2).optional() }).passthrough();
const bodySchema = z.object({ content: z.object({ items: z.array(itemSchema).max(200) }), updatedAt: z.string().datetime().nullable() }).strict();
const GALLERY_KEY = 'gallery.life';
const collectionKey = (collection: string) => collection === 'unified' ? 'gallery.unified' : collection === 'life' ? 'gallery.life' : collection === 'albums' ? 'gallery.albums' : null;

function asItems(value: unknown): Record<string, unknown>[] {
  if (!value || typeof value !== 'object' || !('items' in value) || !Array.isArray((value as { items: unknown }).items)) return [];
  return (value as { items: Record<string, unknown>[] }).items;
}

function sourceItems(raw: unknown, sourcePage: string): Record<string, unknown>[] {
  return asItems(raw).map(item => ({ ...item, pages: Array.isArray(item.pages) ? item.pages : [sourcePage] }));
}

function mergeLegacy(homeItems: unknown, aicteItems: unknown) {
  const merged: Record<string, unknown>[] = [];
  const byIdentity = new Map<string, Record<string, unknown>>();
  for (const item of [...sourceItems(homeItems, 'home'), ...sourceItems(aicteItems, 'aicte')]) {
    const image = item.image && typeof item.image === 'object' ? item.image as Record<string, unknown> : {};
    const identity = String(image.src ?? '');
    const current = byIdentity.get(identity);
    if (current) {
      const assigned = new Set([...(current.pages as string[]), ...(item.pages as string[])]);
      current.pages = [...assigned];
      const currentImage = current.image as Record<string, unknown>;
      if (!String(currentImage.alt ?? '').trim() && String(image.alt ?? '').trim()) current.image = { ...currentImage, alt: image.alt };
    } else {
      const copy = structuredClone(item);
      byIdentity.set(identity, copy);
      merged.push(copy);
    }
  }
  return merged;
}

function mergePageCollections(sourceCollections: { value: unknown; page: string }[]) {
  const merged: Record<string, unknown>[] = [];
  const byIdentity = new Map<string, Record<string, unknown>>();
  for (const { value, page } of sourceCollections) for (const item of sourceItems(value, page)) {
    const image = item.image && typeof item.image === 'object' ? item.image as Record<string, unknown> : {};
    const identity = `${String(item.href ?? '')}\u0000${String(item.title ?? '')}\u0000${String(image.src ?? '')}`;
    const current = byIdentity.get(identity);
    if (current) current.pages = [...new Set([...(current.pages as string[]), ...(item.pages as string[])])];
    else { const copy = structuredClone(item); byIdentity.set(identity, copy); merged.push(copy); }
  }
  return merged;
}

export async function readGalleryMaster() {
  const row = await prisma.websiteSetting.findUnique({ where: { key: GALLERY_KEY } });
  if (row) return { content: row.value as { items: Record<string, unknown>[] }, updatedAt: row.updatedAt.toISOString() };
  const legacyRows = await prisma.websiteSetting.findMany({ where: { key: { in: ['home.master-life', 'academics.master-gallery'] } } });
  const legacy = new Map(legacyRows.map(entry => [entry.key, entry.value]));
  const home = legacy.get('home.master-life') ?? homeMasterDefaults.life;
  const aicte = legacy.get('academics.master-gallery') ?? academicsMasterDefaults.gallery;
  return { content: { items: mergeLegacy(home, aicte) }, updatedAt: null };
}

export async function readGalleryCollection(collection: string): Promise<{ content: { items: Record<string, unknown>[] }; updatedAt: string | null }> {
  const key = collectionKey(collection);
  if (!key) throw new HttpError(404, 'GALLERY_COLLECTION_NOT_FOUND', 'Unknown gallery collection');
  const row = await prisma.websiteSetting.findUnique({ where: { key } });
  if (row) return { content: row.value as { items: Record<string, unknown>[] }, updatedAt: row.updatedAt.toISOString() };
  if (collection === 'unified') {
    const [albums, life, eventRow] = await Promise.all([readGalleryCollection('albums'), readGalleryMaster(), prisma.websiteSetting.findUnique({ where: { key: 'home.master-events' } })]);
    const items = [
      ...albums.content.items.map(item => ({ ...item, sections: item.sections ?? [] })),
      ...life.content.items.map(item => ({ ...item, title: item.title ?? item.caption ?? '', sections: item.sections ?? ['life'] })),
      ...asItems(eventRow?.value ?? homeMasterDefaults.events).map(item => ({ ...item, title: item.title ?? item.caption ?? '', sections: item.sections ?? ['events'] })),
    ];
    return { content: { items }, updatedAt: null };
  }
  if (collection === 'life') return readGalleryMaster();
  const legacyKeys = ['gallery', 'gallery-2'].map(page => `events.${page}.master-albums`);
  const legacyRows = await prisma.websiteSetting.findMany({ where: { key: { in: legacyKeys } } });
  const legacy = new Map(legacyRows.map(entry => [entry.key, entry.value]));
  return { content: { items: mergePageCollections([
    { value: legacy.get(legacyKeys[0]!) ?? eventsPages.gallery!.masters.albums, page: 'events-gallery' },
    { value: legacy.get(legacyKeys[1]!) ?? eventsPages['gallery-2']!.masters.albums, page: 'events-gallery-2' },
  ]) }, updatedAt: null };
}

export async function saveGalleryMaster(input: unknown, actorId: number, requestId?: string) {
  return saveGalleryCollection('life', input, actorId, requestId);
}

export async function saveGalleryCollection(collection: string, input: unknown, actorId: number, requestId?: string) {
  const recordKey = collectionKey(collection);
  if (!recordKey) throw new HttpError(404, 'GALLERY_COLLECTION_NOT_FOUND', 'Unknown gallery collection');
  const parsed = bodySchema.parse(input);
  for (const item of parsed.content.items) {
    if (collection !== 'unified' && !item.pages?.length) throw new HttpError(400, 'GALLERY_PAGE_REQUIRED', 'Choose at least one page for each gallery image.');
  }
  return prisma.$transaction(async tx => {
    const old = await tx.websiteSetting.findUnique({ where: { key: recordKey } });
    if ((old?.updatedAt.toISOString() ?? null) !== parsed.updatedAt) throw new HttpError(409, 'CONTENT_CONFLICT', 'Gallery content changed elsewhere. Reload before saving.');
    const value = parsed.content as Prisma.InputJsonValue;
    if (old) {
      const changed = await tx.websiteSetting.updateMany({ where: { id: old.id, updatedAt: old.updatedAt }, data: { value, isPublic: true } });
      if (changed.count !== 1) throw new HttpError(409, 'CONTENT_CONFLICT', 'Gallery content changed elsewhere. Reload before saving.');
    } else await tx.websiteSetting.create({ data: { key: recordKey, value, isPublic: true } });
    await tx.auditLog.create({ data: { actorId, action: 'gallery.update', entityType: 'gallery', entityId: collection, requestId } });
    const saved = await tx.websiteSetting.findUniqueOrThrow({ where: { key: recordKey } });
    return { content: saved.value, updatedAt: saved.updatedAt.toISOString() };
  });
}

export async function readPublicGallery(page: string) {
  if (!pageSet.has(page)) throw new HttpError(404, 'PAGE_NOT_FOUND', 'Unknown page');
  const unified = await readGalleryCollection('unified');
  return unified.content.items.filter(item => item.enabled !== false && ((page === 'events-gallery' || page === 'events-gallery-2') || (Array.isArray(item.sections) && item.sections.includes('life'))));
}

export async function readGalleryEvents() {
  const unified = await readGalleryCollection('unified');
  return unified.content.items.filter(item => item.enabled !== false && Array.isArray(item.sections) && item.sections.includes('events'));
}
