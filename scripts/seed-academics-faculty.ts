import 'dotenv/config';
import { PrismaClient, Prisma } from '@prisma/client';
import { facultyMasterDefaults, facultyPageDefaults } from '../packages/contracts/src/academics-faculty';

const prisma = new PrismaClient();

async function main() {
  const docs: Record<string, unknown> = {
    ...facultyPageDefaults,
    ...Object.fromEntries(Object.entries(facultyMasterDefaults).map(([k, v]) => [`master-${k}`, v])),
  };

  let created = 0;
  for (const [key, value] of Object.entries(docs)) {
    const existing = await prisma.websiteSetting.findUnique({ where: { key: `academics-faculty.${key}` } });
    if (existing) continue;
    await prisma.websiteSetting.create({
      data: { key: `academics-faculty.${key}`, value: value as Prisma.InputJsonValue, isPublic: true },
    });
    created += 1;
  }

  console.info(`Seeded ${created} of ${Object.keys(docs).length} Faculty page docs (existing rows left untouched).`);
}

main()
  .catch((e) => {
    console.error('Seeding failed:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
