// Seeds Admissions page CMS rows (admissions.<page>.<section>) from contract defaults. Never overwrites existing rows.
import 'dotenv/config';
import { Prisma, PrismaClient } from '@prisma/client';
import { admissionsPages } from '../packages/contracts/src/admissions';

const prisma = new PrismaClient();

async function main() {
  let created = 0;
  for (const [slug, page] of Object.entries(admissionsPages)) {
    const docs: Record<string, unknown> = {
      ...page.sections,
      ...Object.fromEntries(Object.entries(page.masters).map(([key, value]) => [`master-${key}`, value])),
    };
    for (const [key, value] of Object.entries(docs)) {
      const dbKey = `admissions.${slug}.${key}`;
      const existing = await prisma.websiteSetting.findUnique({ where: { key: dbKey } });
      if (existing) continue;
      await prisma.websiteSetting.create({ data: { key: dbKey, value: value as Prisma.InputJsonValue, isPublic: true } });
      created++;
    }
  }
  console.info(`✓ Admissions seed complete: ${created} new row(s) created (existing rows kept).`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
