import { prisma } from '../../lib/prisma.js';

export const adminRepository = {
  async dashboard() {
    const [pages, programmes, newEnquiries, activeUsers] = await Promise.all([
      prisma.page.count({ where: { deletedAt: null } }), prisma.programme.count({ where: { deletedAt: null } }),
      prisma.enquiry.count({ where: { status: 'NEW' } }), prisma.adminUser.count({ where: { status: 'ACTIVE' } }),
    ]);
    return { pages, programmes, newEnquiries, activeUsers };
  },
  createPage(input: { title: string; slug: string; templateKey: string; status: 'DRAFT' | 'PUBLISHED'; authorId: number; requestId?: string }) {
    const publishedAt = input.status === 'PUBLISHED' ? new Date() : null;
    return prisma.$transaction(async (tx) => {
      const page = await tx.page.create({ data: { title: input.title, slug: input.slug, templateKey: input.templateKey, status: input.status, authorId: input.authorId, publishedAt } });
      await tx.auditLog.create({ data: { actorId: input.authorId, action: 'page.create', entityType: 'page', entityId: String(page.id), requestId: input.requestId } });
      return page;
    });
  },
  listPages(query: { limit: number; cursor?: number }) {
    return prisma.page.findMany({ where: { deletedAt: null }, orderBy: { id: 'asc' }, take: query.limit, ...(query.cursor ? { skip: 1, cursor: { id: query.cursor } } : {}) });
  },
};
