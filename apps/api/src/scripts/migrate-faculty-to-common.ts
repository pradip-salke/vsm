import { Prisma } from '@prisma/client';
import '../config/env.js';
import { prisma } from '../lib/prisma.js';
import { readFacultyDocument } from '../modules/content/academics-faculty.service.js';
import { readHomeDocument } from '../modules/content/home.service.js';

type LegacyProfile = { name: string; expertise: string; image: unknown; experience: string; role: string; previous: string; organisations: string; academic: string; enabled: boolean };
type Master = { items: Record<string, unknown>[] };

async function main() {
  const [common, legacy] = await Promise.all([readHomeDocument('master-faculty'), readFacultyDocument('master-profiles')]);
  const items = (common.content as Master).items;
  const oldItems = (legacy.content as { items: LegacyProfile[] }).items;
  const names = new Set(items.map(item => String(item.name).trim().toLocaleLowerCase()));
  const missing = oldItems.filter(item => !names.has(item.name.trim().toLocaleLowerCase()));
  console.log(`Common profiles: ${items.length}; legacy profiles: ${oldItems.length}; missing: ${missing.length}.`);
  if (!process.argv.includes('--apply') || missing.length === 0) return;
  const converted = missing.map(p => ({ name: p.name, role: p.expertise, shortRole: p.expertise, image: p.image, details: [
    { label: 'Specialisation', value: p.expertise }, { label: 'Total Industry / Teaching Experience', value: p.experience },
    { label: 'Position Held', value: p.role }, ...(p.previous ? [{ label: 'Previous Company', value: p.previous }] : []),
    ...(p.organisations ? [{ label: 'Other Companies worked with', value: p.organisations }] : []),
    ...(p.academic ? [{ label: 'Academic Assignments', value: p.academic }] : []),
  ], enabled: p.enabled, pages: [] }));
  await prisma.$transaction(async tx => {
    const row = await tx.websiteSetting.findUnique({ where: { key: 'home.master-faculty' } });
    if ((row?.updatedAt.toISOString() ?? null) !== common.updatedAt) throw new Error('Common master changed; retry after reviewing it.');
    const value = { items: [...items, ...converted] } as Prisma.InputJsonValue;
    if (row) {
      const result = await tx.websiteSetting.updateMany({ where: { id: row.id, updatedAt: row.updatedAt }, data: { value } });
      if (result.count !== 1) throw new Error('Common master changed; migration aborted.');
    } else await tx.websiteSetting.create({ data: { key: 'home.master-faculty', value, isPublic: true } });
  });
  console.log(`Added ${converted.length} missing profiles; legacy records were retained.`);
}

main().catch(error => { console.error(error); process.exitCode = 1; }).finally(() => prisma.$disconnect());
