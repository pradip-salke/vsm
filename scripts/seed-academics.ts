import 'dotenv/config';
import { PrismaClient, Prisma } from '@prisma/client';
import { academicsDefaults, academicsMasterDefaults } from '../packages/contracts/src/academics';

const prisma = new PrismaClient();
const LEGACY_HOME_KEYS = new Set(['program-videos', 'master-program-videos']);

async function main() {
  const documents: Record<string, unknown> = {
    ...academicsDefaults,
    ...Object.fromEntries(
      Object.entries(academicsMasterDefaults).map(([key, value]) => [`master-${key}`, value])
    ),
  };

  for (const [key, value] of Object.entries(documents)) {
    // Upsert into academics.<key>
    await prisma.websiteSetting.upsert({
      where: { key: `academics.${key}` },
      update: {},
      create: {
        key: `academics.${key}`,
        value: value as Prisma.InputJsonValue,
        isPublic: true,
      },
    });

    // Only the original program-video keys are aliased into home.*; other keys would shadow Home page sections.
    if (!LEGACY_HOME_KEYS.has(key)) continue;
    await prisma.websiteSetting.upsert({
      where: { key: `home.${key}` },
      update: {},
      create: {
        key: `home.${key}`,
        value: value as Prisma.InputJsonValue,
        isPublic: true,
      },
    });
  }

  console.info(`Seeded ${Object.keys(documents).length} academics documents without overwriting saved content.`);
}

main()
  .catch((e) => {
    console.error('Seeding failed:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
