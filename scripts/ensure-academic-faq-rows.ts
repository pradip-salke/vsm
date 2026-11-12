/**
 * Creates missing FAQ websiteSetting rows from contracts (no overwrite of existing content).
 * Run after pulling if `GET /admin/academics/faq` returns 404 or CMS shows "Loading section data" for FAQ.
 */
import 'dotenv/config';
import { PrismaClient, Prisma } from '@prisma/client';
import { academicsDefaults } from '../packages/contracts/src/academics';
import { aimaDefaults } from '../packages/contracts/src/academics-aima';
import { academicsSpecialisationDefaults } from '../packages/contracts/src/academics-specialisations';

const prisma = new PrismaClient();

async function ensure(key: string, value: unknown) {
  const existing = await prisma.websiteSetting.findUnique({ where: { key } });
  if (existing) return false;
  await prisma.websiteSetting.create({
    data: { key, value: value as Prisma.InputJsonValue, isPublic: true },
  });
  return true;
}

async function main() {
  const created: string[] = [];

  if (await ensure('academics.faq', academicsDefaults.faq)) created.push('academics.faq');
  if (await ensure('academics-aima.faq', aimaDefaults.faq)) created.push('academics-aima.faq');

  for (const slug of Object.keys(academicsSpecialisationDefaults)) {
    const page = academicsSpecialisationDefaults[slug as keyof typeof academicsSpecialisationDefaults];
    const k = `academics-specs.${slug}.faq`;
    if (await ensure(k, page.faq)) created.push(k);
  }

  if (created.length === 0) {
    console.info('All academic FAQ rows already present.');
  } else {
    console.info(`Created FAQ rows: ${created.join(', ')}`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
