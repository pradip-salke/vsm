import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { prisma } from '../../lib/prisma.js';
import { HttpError } from '../../middleware/errors.js';
import { FooterContentSchema, footerDefaults, type FooterContent } from '@vsmedu/contracts/footer';

export async function readFooterAdmin(): Promise<{ content: FooterContent; updatedAt: string | null }> {
  const row = await prisma.websiteSetting.findUnique({ where: { key: 'global.footer' } });
  if (row) {
    const parseResult = FooterContentSchema.safeParse(row.value);
    return {
      content: parseResult.success ? parseResult.data : { ...footerDefaults, ...(row.value as object) },
      updatedAt: row.updatedAt.toISOString(),
    };
  }

  return {
    content: footerDefaults,
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
    return {
      content: parseResult.success ? parseResult.data : { ...footerDefaults, ...(row.value as object) },
    };
  }

  return { content: footerDefaults };
}
