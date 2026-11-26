import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { prisma } from '../../lib/prisma.js';
import { HttpError } from '../../middleware/errors.js';
import { FooterContentSchema, footerDefaults, type FooterContent } from '@vsmedu/contracts/footer';

const DEFAULT_CONTACT_LOCATIONS: FooterContent['contactPage']['locations'] = {
  andheri: '5th Floor, Valia College Building, Cosmopolitan Education Society Road, Andheri & D. N. Nagar Metro Station, Andheri (West), Mumbai – 400 053.',
  borivali: '',
  ghatkopar: '',
};
const DEFAULT_CONTACT_MAP_LINKS: FooterContent['contactPage']['mapLinks'] = {
  andheri: '',
  borivali: '',
  ghatkopar: '',
};

function withContactLocationDefaults(content: unknown): FooterContent {
  const value = content && typeof content === 'object' && !Array.isArray(content)
    ? content as Partial<FooterContent>
    : {};
  const savedContactPage = value.contactPage as Partial<FooterContent['contactPage']> | undefined;
  const savedLocations = savedContactPage?.locations;
  return {
    ...footerDefaults,
    ...value,
    contactPage: {
      ...footerDefaults.contactPage,
      ...savedContactPage,
      locations: {
        ...DEFAULT_CONTACT_LOCATIONS,
        ...(savedLocations ?? {}),
      },
      mapLinks: {
        ...DEFAULT_CONTACT_MAP_LINKS,
        ...(savedContactPage?.mapLinks ?? {}),
      },
    },
  };
}

export async function readFooterAdmin(): Promise<{ content: FooterContent; updatedAt: string | null }> {
  const row = await prisma.websiteSetting.findUnique({ where: { key: 'global.footer' } });
  if (row) {
    const parseResult = FooterContentSchema.safeParse(row.value);
    const parsed = parseResult.success ? parseResult.data : row.value;
    const rawContact = row.value && typeof row.value === 'object' && !Array.isArray(row.value)
      ? (row.value as { contactPage?: FooterContent['contactPage'] }).contactPage
      : undefined;
    const content = parseResult.success && rawContact ? {
      ...parsed,
      contactPage: {
        ...parsed.contactPage,
        locations: rawContact.locations ?? parsed.contactPage.locations,
        mapLinks: rawContact.mapLinks ?? parsed.contactPage.mapLinks,
      },
    } : parsed;
    return {
      content: withContactLocationDefaults(content),
      updatedAt: row.updatedAt.toISOString(),
    };
  }

  return {
    content: withContactLocationDefaults(footerDefaults),
    updatedAt: null,
  };
}

export async function updateFooterAdmin(
  input: unknown,
  actorId: number,
  requestId?: string
): Promise<{ content: FooterContent; updatedAt: string }> {
  const schema = z.object({
    content: FooterContentSchema,
    updatedAt: z.string().datetime().nullable(),
  }).strict();

  const { content, updatedAt } = schema.parse(input);

  return prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    const oldRow = await tx.websiteSetting.findUnique({ where: { key: 'global.footer' } });
    const expectedTime = oldRow ? oldRow.updatedAt.toISOString() : null;

    if (expectedTime !== updatedAt) {
      throw new HttpError(409, 'CONTENT_CONFLICT', 'Footer settings were updated elsewhere. Please reload before saving.');
    }

    const value = content as unknown as Prisma.InputJsonValue;

    if (oldRow) {
      await tx.websiteSetting.update({
        where: { id: oldRow.id },
        data: { value, isPublic: true },
      });
    } else {
      await tx.websiteSetting.create({
        data: { key: 'global.footer', value, isPublic: true },
      });
    }

    await tx.auditLog.create({
      data: {
        actorId,
        action: 'settings.footer_update',
        entityType: 'settings',
        entityId: 'global.footer',
        requestId,
      },
    });

    const saved = await tx.websiteSetting.findUniqueOrThrow({ where: { key: 'global.footer' } });
    return {
      content: saved.value as unknown as FooterContent,
      updatedAt: saved.updatedAt.toISOString(),
    };
  });
}

export async function readPublicFooter(): Promise<{ content: FooterContent }> {
  const row = await prisma.websiteSetting.findUnique({ where: { key: 'global.footer', isPublic: true } });
  if (row) {
    const parseResult = FooterContentSchema.safeParse(row.value);
    const parsed = parseResult.success ? parseResult.data : row.value;
    const rawContact = row.value && typeof row.value === 'object' && !Array.isArray(row.value)
      ? (row.value as { contactPage?: FooterContent['contactPage'] }).contactPage
      : undefined;
    const content = parseResult.success && rawContact ? {
      ...parsed,
      contactPage: {
        ...parsed.contactPage,
        locations: rawContact.locations ?? parsed.contactPage.locations,
        mapLinks: rawContact.mapLinks ?? parsed.contactPage.mapLinks,
      },
    } : parsed;
    return {
      content: withContactLocationDefaults(content),
    };
  }

  return { content: withContactLocationDefaults(footerDefaults) };
}
