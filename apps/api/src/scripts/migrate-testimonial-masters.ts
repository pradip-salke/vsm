import { Prisma } from '@prisma/client';
import { academicsSpecialisationIndex } from '@vsmedu/contracts/academics-specialisations';
import { prisma } from '../lib/prisma.js';
import { readTestimonialMaster } from '../modules/content/testimonial-masters.service.js';

async function main() {
  const scopes = ['home', 'aicte', 'aima', ...academicsSpecialisationIndex.map(item => item.slug)];
  let created = 0;
  for (const scope of scopes) {
    for (const kind of ['video', 'written'] as const) {
      const key = `testimonial-master.${scope}.${kind}`;
      const source = await readTestimonialMaster(scope, kind);
      if (source.updatedAt !== null) continue;
      const result = await prisma.websiteSetting.createMany({ data: [{ key, value: source.content as Prisma.InputJsonValue, isPublic: true }], skipDuplicates: true });
      created += result.count;
    }
  }
  process.stdout.write(`Created ${created} testimonial masters; existing masters and legacy records were preserved.\n`);
}

main().catch(error => { console.error(error); process.exitCode = 1; }).finally(() => prisma.$disconnect());
