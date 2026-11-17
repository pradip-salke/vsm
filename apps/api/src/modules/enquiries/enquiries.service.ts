import { prisma } from '../../lib/prisma.js';
import { unlink } from 'node:fs/promises';
import { resolve } from 'node:path';
import { HttpError } from '../../middleware/errors.js';
import { homeMediaRoot } from '../content/home-media.js';
import { Prisma, type EnquiryStatus } from '@prisma/client';

export type CareerEnquiryItem = {
  id: number;
  name: string;
  email: string | null;
  phone: string;
  position: string;
  designation: string;
  resumeUrl: string | null;
  resumeName: string | null;
  status: EnquiryStatus;
  submittedAt: string;
};

export type GeneralEnquiryItem = {
  id: number;
  name: string;
  email: string | null;
  phone: string;
  city: string | null;
  message: string | null;
  source: string | null;
  status: EnquiryStatus;
  submittedAt: string;
};

export type FilterParams = {
  search?: string;
  from?: string;
  to?: string;
  status?: string;
  page?: number;
  limit?: number;
  sort?: string;
  dir?: string;
};

type SortField = 'id' | 'name' | 'date' | 'status';
function sortOf(params: FilterParams): { field: SortField; dir: 'asc' | 'desc' } {
  const field = (['id', 'name', 'date', 'status'] as const).find((f) => f === params.sort) ?? 'date';
  return { field, dir: params.dir === 'asc' ? 'asc' : 'desc' };
}

function enquiryOrder(params: FilterParams): Prisma.EnquiryOrderByWithRelationInput[] {
  const { field, dir } = sortOf(params);
  const primary: Prisma.EnquiryOrderByWithRelationInput =
    field === 'id' ? { id: dir } : field === 'name' ? { name: dir } : field === 'status' ? { status: dir } : { submittedAt: dir };
  return field === 'id' ? [primary] : [primary, { id: dir }];
}

function applicationOrder(params: FilterParams): Prisma.ApplicationOrderByWithRelationInput[] {
  const { field, dir } = sortOf(params);
  if (field === 'name') return [{ firstName: dir }, { lastName: dir }, { id: dir }];
  if (field === 'id') return [{ id: dir }];
  return [field === 'status' ? { status: dir } : { submittedAt: dir }, { id: dir }];
}

function parseDateRange(from?: string, to?: string) {
  const dateFilter: Prisma.DateTimeFilter = {};
  if (from) {
    const f = new Date(from);
    if (!isNaN(f.getTime())) {
      f.setHours(0, 0, 0, 0);
      dateFilter.gte = f;
    }
  }
  if (to) {
    const t = new Date(to);
    if (!isNaN(t.getTime())) {
      t.setHours(23, 59, 59, 999);
      dateFilter.lte = t;
    }
  }
  return Object.keys(dateFilter).length > 0 ? dateFilter : undefined;
}

export const enquiriesService = {
  // --- Public Submissions ---
  async createGeneralEnquiry(input: {
    name: string;
    email?: string | null;
    phone: string;
    city?: string | null;
    message?: string | null;
    source?: string | null;
  }) {
    return prisma.enquiry.create({
      data: {
        name: input.name.trim(),
        email: input.email ? input.email.trim() : null,
        phone: input.phone.trim(),
        city: input.city ? input.city.trim() : null,
        message: input.message ? input.message.trim() : null,
        source: input.source ?? 'website-enquire-now',
        consent: true,
        consentVersion: 'v1',
        consentedAt: new Date(),
        status: 'NEW',
      },
    });
  },

  async createCareerEnquiry(input: {
    name: string;
    email: string;
    phone: string;
    position: string;
    designation: string;
    resumeUrl: string;
    resumeName: string;
  }) {
    const details = {
      position: input.position.trim(),
      designation: input.designation.trim(),
      resumeUrl: input.resumeUrl,
      resumeName: input.resumeName,
    };

    return prisma.enquiry.create({
      data: {
        name: input.name.trim(),
        email: input.email.trim(),
        phone: input.phone.trim(),
        city: input.position.trim(), // Stored in city for easy indexing/display
        message: JSON.stringify(details),
        source: 'career',
        consent: true,
        consentVersion: 'v1',
        consentedAt: new Date(),
        status: 'NEW',
      },
    });
  },

  async createApplication(input: {
    firstName: string;
    middleName?: string | null;
    lastName: string;
    email: string;
    phone: string;
    parentPhone?: string | null;
    dateOfBirth?: string | null;
    nationality?: string | null;
    gender?: string | null;
    familyAnnualIncome?: string | null;
    referral?: string | null;
    referralOther?: string | null;
    address?: string | null;
    city?: string | null;
    pinCode?: string | null;
    country?: string | null;
    education?: Array<{
      stage: string;
      institution?: string | null;
      board?: string | null;
      stream?: string | null;
      passingYear?: number | null;
      resultPercent?: number | null;
    }>;
    examScores?: Array<{
      examCode: string;
      score?: number | null;
      rank?: number | null;
      session?: string | null;
    }>;
    consent: boolean;
  }) {
    const dob = input.dateOfBirth ? new Date(input.dateOfBirth) : null;

    return prisma.$transaction(async (tx) => {
      const application = await tx.application.create({
        data: {
        firstName: input.firstName.trim(),
        middleName: input.middleName ? input.middleName.trim() : null,
        lastName: input.lastName.trim(),
        email: input.email.trim(),
        phone: input.phone.trim(),
        parentPhone: input.parentPhone ? input.parentPhone.trim() : null,
        dateOfBirth: dob && !isNaN(dob.getTime()) ? dob : null,
        address: input.address?.trim() ?? null,
        city: input.city ? input.city.trim() : null,
        postalCode: input.pinCode ? input.pinCode.trim() : null,
        country: input.country ? input.country.trim() : 'India',
        consent: input.consent,
        consentVersion: 'v1',
        consentedAt: new Date(),
        status: 'SUBMITTED',
        education: input.education?.length
          ? {
              create: input.education.map((edu) => ({
                stage: edu.stage,
                institution: edu.institution ?? null,
                board: edu.board ?? null,
                stream: edu.stream ?? null,
                passingYear: edu.passingYear ?? null,
                resultPercent: edu.resultPercent ?? null,
              })),
            }
          : undefined,
        examScores: input.examScores?.length
          ? {
              create: input.examScores.map((score) => ({
                examCode: score.examCode,
                score: score.score ?? null,
                rank: score.rank ?? null,
                session: score.session ?? null,
              })),
            }
          : undefined,
        },
        include: { education: true, examScores: true },
      });
      await tx.$executeRaw`
        UPDATE applications SET
          nationality = ${input.nationality?.trim() ?? null},
          gender = ${input.gender?.trim() ?? null},
          familyAnnualIncome = ${input.familyAnnualIncome?.trim() ?? null},
          referral = ${input.referral?.trim() ?? null},
          referralOther = ${input.referralOther?.trim() ?? null}
        WHERE id = ${application.id}
      `;
      return tx.application.findUniqueOrThrow({ where: { id: application.id }, include: { education: true, examScores: true } });
    });
  },

  // --- Admin Queries ---
  async listCareerEnquiries(params: FilterParams) {
    const page = Math.max(1, Number(params.page) || 1);
    const limit = Math.max(1, Math.min(100, Number(params.limit) || 25));
    const skip = (page - 1) * limit;

    const where: Prisma.EnquiryWhereInput = {
      source: 'career',
    };

    const dateFilter = parseDateRange(params.from, params.to);
    if (dateFilter) where.submittedAt = dateFilter;

    if (params.status && params.status !== 'ALL') {
      where.status = params.status as EnquiryStatus;
    }

    if (params.search && params.search.trim()) {
      const q = params.search.trim();
      where.OR = [
        { name: { contains: q } },
        { email: { contains: q } },
        { phone: { contains: q } },
        { city: { contains: q } },
        { message: { contains: q } },
      ];
    }

    const [rows, total, totalAll, newCount] = await Promise.all([
      prisma.enquiry.findMany({
        where,
        orderBy: enquiryOrder(params),
        skip,
        take: limit,
      }),
      prisma.enquiry.count({ where }),
      prisma.enquiry.count({ where: { source: 'career' } }),
      prisma.enquiry.count({ where: { source: 'career', status: 'NEW' } }),
    ]);

    const items: CareerEnquiryItem[] = rows.map((row) => {
      let details: { position?: string; designation?: string; resumeUrl?: string; resumeName?: string } = {};
      try {
        if (row.message) details = JSON.parse(row.message);
      } catch {
        details = { position: row.city ?? '', designation: row.message ?? '' };
      }

      return {
        id: row.id,
        name: row.name,
        email: row.email,
        phone: row.phone,
        position: details.position || row.city || 'Applicant',
        designation: details.designation || '—',
        resumeUrl: details.resumeUrl || null,
        resumeName: details.resumeName || null,
        status: row.status,
        submittedAt: row.submittedAt.toISOString(),
      };
    });

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.max(1, Math.ceil(total / limit)),
      stats: { total: totalAll, newCount },
    };
  },

  async listGeneralEnquiries(params: FilterParams) {
    const page = Math.max(1, Number(params.page) || 1);
    const limit = Math.max(1, Math.min(100, Number(params.limit) || 25));
    const skip = (page - 1) * limit;

    const where: Prisma.EnquiryWhereInput = {
      source: { not: 'career' },
    };

    const dateFilter = parseDateRange(params.from, params.to);
    if (dateFilter) where.submittedAt = dateFilter;

    if (params.status && params.status !== 'ALL') {
      where.status = params.status as EnquiryStatus;
    }

    if (params.search && params.search.trim()) {
      const q = params.search.trim();
      where.OR = [
        { name: { contains: q } },
        { email: { contains: q } },
        { phone: { contains: q } },
        { city: { contains: q } },
        { message: { contains: q } },
      ];
    }

    const [rows, total, totalAll, newCount] = await Promise.all([
      prisma.enquiry.findMany({
        where,
        orderBy: enquiryOrder(params),
        skip,
        take: limit,
      }),
      prisma.enquiry.count({ where }),
      prisma.enquiry.count({ where: { source: { not: 'career' } } }),
      prisma.enquiry.count({ where: { source: { not: 'career' }, status: 'NEW' } }),
    ]);

    const items: GeneralEnquiryItem[] = rows.map((row) => ({
      id: row.id,
      name: row.name,
      email: row.email,
      phone: row.phone,
      city: row.city,
      message: row.message,
      source: row.source,
      status: row.status,
      submittedAt: row.submittedAt.toISOString(),
    }));

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.max(1, Math.ceil(total / limit)),
      stats: { total: totalAll, newCount },
    };
  },

  async listApplications(params: FilterParams) {
    const page = Math.max(1, Number(params.page) || 1);
    const limit = Math.max(1, Math.min(100, Number(params.limit) || 25));
    const skip = (page - 1) * limit;

    const where: Prisma.ApplicationWhereInput = {};

    const dateFilter = parseDateRange(params.from, params.to);
    if (dateFilter) where.submittedAt = dateFilter;

    if (params.status && params.status !== 'ALL') {
      where.status = params.status;
    }

    if (params.search && params.search.trim()) {
      const q = params.search.trim();
      where.OR = [
        { firstName: { contains: q } },
        { lastName: { contains: q } },
        { email: { contains: q } },
        { phone: { contains: q } },
        { city: { contains: q } },
      ];
    }

    const [rows, total, totalAll, newCount] = await Promise.all([
      prisma.application.findMany({
        where,
        include: {
          education: true,
          examScores: true,
        },
        orderBy: applicationOrder(params),
        skip,
        take: limit,
      }),
      prisma.application.count({ where }),
      prisma.application.count(),
      prisma.application.count({ where: { status: 'SUBMITTED' } }),
    ]);

    const demographics = rows.length
      ? await prisma.$queryRaw<Array<{ id: number; nationality: string | null; gender: string | null; familyAnnualIncome: string | null; referral: string | null; referralOther: string | null }>>`
          SELECT id, nationality, gender, familyAnnualIncome, referral, referralOther
          FROM applications WHERE id IN (${Prisma.join(rows.map((row) => row.id))})
        `
      : [];
    const demographicsById = new Map(demographics.map((item) => [item.id, item]));

    const items = rows.map((row) => {
      const demographic = demographicsById.get(row.id);
      const [addressText, legacyMeta] = row.address?.split('\n---\n') ?? [null, null];
      const legacyFields = Object.fromEntries((legacyMeta ?? '').split(' | ').map((part) => {
        const separator = part.indexOf(': ');
        return separator > 0 ? [part.slice(0, separator), part.slice(separator + 2)] : ['', ''];
      }).filter(([key]) => key));
      const fullName = [row.firstName, row.middleName, row.lastName].filter(Boolean).join(' ');
      const grad = row.education.find((e) => e.stage.toLowerCase().includes('grad'));
      const qualification = grad
        ? `${grad.stream || 'Graduation'}${grad.resultPercent ? ` (${grad.resultPercent}%)` : ''}`
        : row.education[0]
          ? `${row.education[0].stage}: ${row.education[0].stream || ''}`
          : '—';

      const topExam = row.examScores[0];
      const examSummary = topExam
        ? `${topExam.examCode}${topExam.score ? `: ${topExam.score}` : ''}`
        : '—';

      return {
        id: row.id,
        fullName,
        firstName: row.firstName,
        middleName: row.middleName,
        lastName: row.lastName,
        email: row.email,
        phone: row.phone,
        parentPhone: row.parentPhone,
        dateOfBirth: row.dateOfBirth ? row.dateOfBirth.toISOString().split('T')[0] : null,
        address: legacyMeta ? addressText : row.address,
        city: row.city,
        postalCode: row.postalCode,
        country: row.country,
        nationality: demographic?.nationality ?? legacyFields.Nationality ?? null,
        gender: demographic?.gender ?? legacyFields.Gender ?? null,
        familyAnnualIncome: demographic?.familyAnnualIncome ?? legacyFields['Family Income'] ?? null,
        referral: demographic?.referral ?? legacyFields.Referral?.replace(/ \(.+\)$/, '') ?? null,
        referralOther: demographic?.referralOther ?? legacyFields.Referral?.match(/\((.+)\)$/)?.[1] ?? null,
        consent: row.consent,
        qualification,
        examSummary,
        education: row.education,
        examScores: row.examScores,
        status: row.status,
        submittedAt: row.submittedAt.toISOString(),
      };
    });

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.max(1, Math.ceil(total / limit)),
      stats: { total: totalAll, newCount },
    };
  },

  async updateEnquiryStatus(id: number, status: EnquiryStatus, reviewerId?: number) {
    const existing = await prisma.enquiry.findUnique({ where: { id } });
    if (!existing) throw new HttpError(404, 'NOT_FOUND', 'Enquiry not found');

    return prisma.enquiry.update({
      where: { id },
      data: {
        status,
        reviewerId: reviewerId ?? existing.reviewerId,
      },
    });
  },

  async updateApplicationStatus(id: number, status: string) {
    const existing = await prisma.application.findUnique({ where: { id } });
    if (!existing) throw new HttpError(404, 'NOT_FOUND', 'Application not found');

    return prisma.application.update({
      where: { id },
      data: { status },
    });
  },

  async deleteEnquiry(id: number) {
    const existing = await prisma.enquiry.findUnique({ where: { id } });
    if (!existing) throw new HttpError(404, 'NOT_FOUND', 'Enquiry not found');
    const removed = await prisma.enquiry.delete({ where: { id } });
    if (existing.source === 'career' && existing.message) {
      try {
        const details = JSON.parse(existing.message) as { resumeUrl?: unknown };
        const match = typeof details.resumeUrl === 'string'
          ? /^\/cms-media\/(resume-[0-9a-f-]{36}-[A-Za-z0-9._-]+\.(?:pdf|docx?))$/i.exec(details.resumeUrl)
          : null;
        if (match?.[1]) await unlink(resolve(homeMediaRoot, match[1])).catch(() => undefined);
      } catch {
        // Preserve deletion even if a legacy career message is not valid JSON.
      }
    }
    return removed;
  },

  async deleteApplication(id: number) {
    const existing = await prisma.application.findUnique({ where: { id } });
    if (!existing) throw new HttpError(404, 'NOT_FOUND', 'Application not found');

    return prisma.application.delete({ where: { id } });
  },
};

