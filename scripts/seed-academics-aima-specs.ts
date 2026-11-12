import 'dotenv/config';
import { PrismaClient, Prisma } from '@prisma/client';
import { aimaDefaults, aimaMasterDefaults } from '../packages/contracts/src/academics-aima';
import { academicsSpecialisationDefaults, academicsSpecialisationMasterDefaults } from '../packages/contracts/src/academics-specialisations';

const prisma = new PrismaClient();

async function main() {
  const homeTestimonialRow = await prisma.websiteSetting.findUnique({ where: { key: 'home.master-testimonials' } });
  const homeTestimonialItems = (homeTestimonialRow?.value as { items?: { name?: string; videoLink?: string }[] } | null)?.items ?? [];
  const withIndependentHomeVideoLinks = <T extends { items: { name?: string; videoLink?: string }[] }>(master: T): T => ({
    ...master,
    items: master.items.map((item) => ({
      ...item,
      videoLink: item.videoLink || homeTestimonialItems.find((homeItem) => homeItem.name === item.name)?.videoLink || '',
    })),
  });
  const aimaDocs: Record<string, unknown> = {
    ...aimaDefaults,
    ...Object.fromEntries(Object.entries(aimaMasterDefaults).map(([k, v]) => [
      `master-${k}`,
      k === 'testimonials' ? withIndependentHomeVideoLinks(v) : v,
    ])),
  };

  for (const [key, value] of Object.entries(aimaDocs)) {
    await prisma.websiteSetting.upsert({
      where: { key: `academics-aima.${key}` },
      update: {},
      create: {
        key: `academics-aima.${key}`,
        value: value as Prisma.InputJsonValue,
        isPublic: true,
      },
    });
  }

  const specFlat: Record<string, unknown> = {};
  for (const slug of Object.keys(academicsSpecialisationDefaults)) {
    const page = academicsSpecialisationDefaults[slug as keyof typeof academicsSpecialisationDefaults];
    specFlat[`${slug}.meta`] = page.meta;
    specFlat[`${slug}.hero`] = page.hero;
    specFlat[`${slug}.tabs`] = page.tabs;
    specFlat[`${slug}.glance`] = page.glance;
    specFlat[`${slug}.overview`] = page.overview;
    specFlat[`${slug}.why`] = page.why;
    specFlat[`${slug}.careers`] = page.careers;
    specFlat[`${slug}.curriculum`] = page.curriculum;
    specFlat[`${slug}.admission`] = page.admission;
    specFlat[`${slug}.internships`] = page.internships;
    specFlat[`${slug}.testimonials`] = page.testimonials;
    specFlat[`${slug}.faq`] = page.faq;
    specFlat[`master-${slug}.hero`] = academicsSpecialisationMasterDefaults[slug as keyof typeof academicsSpecialisationMasterDefaults].hero;
    specFlat[`master-${slug}.internships`] = academicsSpecialisationMasterDefaults[slug as keyof typeof academicsSpecialisationMasterDefaults].internships;
    specFlat[`master-${slug}.testimonials`] = withIndependentHomeVideoLinks(academicsSpecialisationMasterDefaults[slug as keyof typeof academicsSpecialisationMasterDefaults].testimonials);
  }

  for (const [key, value] of Object.entries(specFlat)) {
    await prisma.websiteSetting.upsert({
      where: { key: `academics-specs.${key}` },
      update: {},
      create: {
        key: `academics-specs.${key}`,
        value: value as Prisma.InputJsonValue,
        isPublic: true,
      },
    });
  }

  console.info(
    `Seeded ${Object.keys(aimaDocs).length} AIMA docs and ${Object.keys(specFlat).length} specialisation docs (no overwrites).`
  );
}

main()
  .catch((e) => {
    console.error('Seeding failed:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
