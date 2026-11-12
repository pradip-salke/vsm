import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
try {
  const e = await prisma.enquiry.count();
  const a = await prisma.application.count();
  console.log('Enquiries count:', e);
  console.log('Applications count:', a);
} catch (err) {
  console.error('DB Error:', err);
} finally {
  await prisma.$disconnect();
}

