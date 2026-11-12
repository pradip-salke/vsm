import 'dotenv/config';
import { PrismaClient, Prisma } from '@prisma/client';
import { homeDefaults, homeMasterDefaults } from '../packages/contracts/src/home';

const prisma = new PrismaClient();
async function main() {
  const documents = { ...homeDefaults, ...Object.fromEntries(Object.entries(homeMasterDefaults).map(([key, value]) => [`master-${key}`, value])) };
  for (const [key, value] of Object.entries(documents)) await prisma.websiteSetting.upsert({ where: { key: `home.${key}` }, update: {}, create: { key: `home.${key}`, value: value as Prisma.InputJsonValue, isPublic: true } });
  console.info(`Seeded ${Object.keys(documents).length} homepage documents without overwriting saved content.`);
}
main().finally(() => prisma.$disconnect());
