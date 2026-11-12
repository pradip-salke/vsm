import { mkdir, unlink, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { randomUUID } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import type { RequestHandler } from 'express';
import sharp from 'sharp';
import { prisma } from '../../lib/prisma.js';
import { HttpError } from '../../middleware/errors.js';

export const homeMediaRoot = process.env.MEDIA_ROOT ? resolve(process.env.MEDIA_ROOT) : fileURLToPath(new URL('../../../../../uploads/home/', import.meta.url));

export const uploadHomeImage: RequestHandler = async (req, res) => {
  if (!Buffer.isBuffer(req.body) || !req.body.length) throw new HttpError(400, 'IMAGE_REQUIRED', 'Choose an image to upload');
  const originalName = decodeURIComponent(req.get('x-file-name') ?? 'image').replace(/[^a-zA-Z0-9._ -]/g, '_').slice(0, 255);
  const svg = req.body.toString('utf8');
  if (req.is('image/svg+xml') && /<!DOCTYPE|<!ENTITY|<script|<foreignObject|@import|href\s*=\s*["'](?!#|data:image\/(?:png|jpeg|webp);base64,)|url\(\s*["']?(?!#)/i.test(svg)) throw new HttpError(400, 'UNSAFE_SVG', 'Upload a self-contained SVG without scripts or external references');
  let data: Buffer;
  let width: number;
  let height: number;
  try {
    const result = await sharp(req.body, { limitInputPixels: 40000000 }).rotate().webp({ quality: 90 }).toBuffer({ resolveWithObject: true });
    data = result.data; width = result.info.width; height = result.info.height;
  } catch { throw new HttpError(400, 'INVALID_IMAGE', 'Upload a valid PNG, JPEG, WebP, AVIF or SVG image (maximum 2 MB)'); }
  const name = `${randomUUID()}.webp`;
  await mkdir(homeMediaRoot, { recursive: true });
  const path = resolve(homeMediaRoot, name);
  await writeFile(path, data);
  try {
    const asset = await prisma.mediaAsset.create({ data: { storageKey: `home/${name}`, originalName, mimeType: 'image/webp', byteSize: data.length, width, height, scanStatus: 'VALIDATED' } });
    res.status(201).json({ data: { id: asset.id, src: `/cms-media/${name}`, alt: '', width, height } });
  } catch (error) { await unlink(path).catch(() => undefined); throw error; }
};

const videoTypes = {
  'video/mp4': { ext: 'mp4', signature: (data: Buffer) => data.length > 12 && data.toString('ascii', 4, 8) === 'ftyp' },
  'video/webm': { ext: 'webm', signature: (data: Buffer) => data.length > 4 && data.subarray(0, 4).equals(Buffer.from([0x1a, 0x45, 0xdf, 0xa3])) },
  'video/ogg': { ext: 'ogv', signature: (data: Buffer) => data.length > 4 && data.toString('ascii', 0, 4) === 'OggS' },
} as const;

export const uploadProgramVideo: RequestHandler = async (req, res) => {
  if (!Buffer.isBuffer(req.body) || !req.body.length) throw new HttpError(400, 'VIDEO_REQUIRED', 'Choose a video to upload');
  const type = req.get('content-type') ?? '';
  const format = videoTypes[type as keyof typeof videoTypes];
  if (!format || !format.signature(req.body)) throw new HttpError(400, 'INVALID_VIDEO', 'Upload a valid MP4, WebM or Ogg video');
  const originalName = decodeURIComponent(req.get('x-file-name') ?? 'program-video').replace(/[^a-zA-Z0-9._ -]/g, '_').slice(0, 255);
  const name = `${randomUUID()}.${format.ext}`;
  await mkdir(homeMediaRoot, { recursive: true });
  const path = resolve(homeMediaRoot, name);
  await writeFile(path, req.body);
  try {
    const asset = await prisma.mediaAsset.create({ data: { storageKey: `home/${name}`, originalName, mimeType: type, byteSize: req.body.length, scanStatus: 'VALIDATED' } });
    res.status(201).json({ data: { id: asset.id, src: `/cms-media/${name}` } });
  } catch (error) { await unlink(path).catch(() => undefined); throw error; }
};
