// Seeds Placements page CMS rows (placements.<page>.<section>) from contract defaults. Never overwrites existing rows.
import 'dotenv/config';
import { Prisma, PrismaClient } from '@prisma/client';
import { placementsPages } from '../packages/contracts/src/placements';

const prisma = new PrismaClient();

async function main() {
  let created = 0;
  let total = 0;
  for (const [slug, page] of Object.entries(placementsPages)) {
    const docs: Record<string, unknown> = {
      ...page.sections,
      ...Object.fromEntries(Object.entries(page.masters).map(([key, value]) => [`master-${key}`, value])),
    };
    for (const [key, value] of Object.entries(docs)) {
      total++;
      const dbKey = `placements.${slug}.${key}`;
      const existing = await prisma.websiteSetting.findUnique({ where: { key: dbKey } });
      if (existing) continue;
      await prisma.websiteSetting.create({ data: { key: dbKey, value: value as Prisma.InputJsonValue, isPublic: true } });
      created++;
    }
  }
  console.info(`✓ Placements seed complete: ${created} of ${total} row(s) created (existing rows kept).`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
