import 'dotenv/config';
import assert from 'node:assert/strict';
import { access } from 'node:fs/promises';
import { resolve } from 'node:path';
import { PrismaClient } from '@prisma/client';
import argon2 from 'argon2';

const prisma = new PrismaClient();
const base = process.env.API_BASE_URL ?? 'http://localhost:4000';
const origin = process.env.ADMIN_ORIGIN ?? 'http://localhost:5173';
const email = 'enquiries-test@example.invalid';
const password = 'Temporary-Enquiries-Test!2026';

async function cleanup(userId?: number) {
  try {
    const user = userId ? await prisma.adminUser.findUnique({ where: { id: userId } }) : await prisma.adminUser.findUnique({ where: { email } });
    if (user) {
      await prisma.auditLog.deleteMany({ where: { actorId: user.id } });
      await prisma.adminUser.delete({ where: { id: user.id } });
    }
  } catch (err) {
    console.warn('Cleanup warning:', err);
  }
}

async function main() {
  console.info('=== Starting Enquiries Submenus & Forms Verification ===');

  // 1. Ensure test admin user exists with editor permissions
  await prisma.adminUser.deleteMany({ where: { email } });

  const testUser = await prisma.adminUser.create({
    data: {
      email,
      name: 'Enquiries Test Admin',
      passwordHash: await argon2.hash(password),
      userRoles: { create: { role: { connect: { code: 'editor' } } } },
    },
  });

  // Log in as admin
  const loginRes = await fetch(`${base}/api/v1/auth/login`, {
    method: 'POST',
    headers: { Origin: origin, 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  assert.equal(loginRes.status, 200, 'Admin login must succeed');
  const cookie = loginRes.headers.get('set-cookie')!.split(';')[0]!;
  const adminHeaders = { Cookie: cookie, Origin: origin, 'Content-Type': 'application/json' };

  let careerEnquiryId: number | null = null;
  let careerResumePath: string | null = null;
  let generalEnquiryId: number | null = null;
  let applicationId: number | null = null;

  try {
    // -------------------------------------------------------------
    // TEST 1: Public Career Form Submission (with simulated Resume)
    // -------------------------------------------------------------
    console.info('\n1. Testing Career Form Submission (POST /api/v1/public/career)...');
    const careerFormData = new FormData();
    careerFormData.append('name', 'Dr. Ramesh Sharma');
    careerFormData.append('email', 'ramesh.sharma.test@example.com');
    careerFormData.append('phone', '+91 98765 43210');
    careerFormData.append('position', 'Professor of Marketing');
    careerFormData.append('designation', 'Associate Professor');
    
    // Create dummy PDF blob
    const resumeBlob = new Blob(['%PDF-1.4 Mock Resume Document Content for VSM Career Submission'], { type: 'application/pdf' });
    careerFormData.append('resume', resumeBlob, 'ramesh_sharma_cv.pdf');

    const careerRes = await fetch(`${base}/api/v1/public/career`, {
      method: 'POST',
      body: careerFormData,
    });
    assert.equal(careerRes.status, 201, `Career submission should return 201, got ${careerRes.status}`);
    const careerJson = await careerRes.json();
    assert.ok(careerJson.data?.id, 'Career response must contain data.id');
    careerEnquiryId = careerJson.data.id;
    console.info(`✓ Career application submitted successfully. ID: #${careerEnquiryId}`);

    // -------------------------------------------------------------
    // TEST 2: Public General Enquiry Submission (Global Enquire Now)
    // -------------------------------------------------------------
    console.info('\n2. Testing General Enquiry Form Submission (POST /api/v1/public/enquiries)...');
    const generalRes = await fetch(`${base}/api/v1/public/enquiries`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Priya Mehta',
        email: 'priya.mehta.test@example.com',
        phone: '+91 99887 76655',
        city: 'Mumbai',
        message: 'Interested in the PGDM Executive batch starting in July 2026.',
        source: 'website-enquire-now',
      }),
    });
    assert.equal(generalRes.status, 201, `General enquiry should return 201, got ${generalRes.status}`);
    const generalJson = await generalRes.json();
    assert.ok(generalJson.data?.id, 'General enquiry response must contain data.id');
    generalEnquiryId = generalJson.data.id;
    console.info(`✓ General enquiry submitted successfully. ID: #${generalEnquiryId}`);

    // -------------------------------------------------------------
    // TEST 3: Public PGDM Admission Application Form Submission
    // -------------------------------------------------------------
    console.info('\n3. Testing Admission Application Submission (POST /api/v1/public/applications)...');
    const invalidAppRes = await fetch(`${base}/api/v1/public/applications`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ firstName: 'Invalid', lastName: 'Applicant', email: 'invalid@example.com', phone: 'letters', consent: false }),
    });
    assert.equal(invalidAppRes.status, 400, 'Invalid phone, required application fields and missing consent must be rejected');
    const appRes = await fetch(`${base}/api/v1/public/applications`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        firstName: 'Amitabh',
        middleName: 'Kumar',
        lastName: 'Verma',
        email: 'amitabh.verma.test@example.com',
        phone: '+91 98220 12345',
        parentPhone: '+91 98220 99999',
        dateOfBirth: '2001-08-15',
        nationality: 'Indian',
        gender: 'Male',
        familyAnnualIncome: 'INR 8,00,000',
        address: '102 Green Acres, Juhu Road, Mumbai',
        city: 'Mumbai',
        pinCode: '400049',
        country: 'India',
        referral: 'Other',
        referralOther: 'Audit referral source',
        consent: true,
        education: [
          {
            stage: 'Graduation',
            institution: 'St. Xaviers College',
            stream: 'B.Com Management',
            passingYear: 2023,
            resultPercent: 78.5,
          },
          {
            stage: '12th',
            institution: 'Mithibai College',
            board: 'Maharashtra State Board',
            stream: 'Commerce',
            passingYear: 2020,
            resultPercent: 84.0,
          },
          {
            stage: '10th',
            institution: 'Audit Public School',
            board: 'Central Board',
            stream: 'General',
            passingYear: 2018,
            resultPercent: 89.5,
          },
        ],
        examScores: [
          {
            examCode: 'CAT',
            score: 87.5,
            rank: 1240,
            session: '2023',
          },
          {
            examCode: 'MH-CET',
            score: 92.4,
            rank: 450,
            session: '2024',
          },
        ],
      }),
    });
    assert.equal(appRes.status, 201, `Admission application should return 201, got ${appRes.status}`);
    const appJson = await appRes.json();
    assert.ok(appJson.data?.id, 'Application response must contain data.id');
    applicationId = appJson.data.id;
    console.info(`✓ Admission application submitted successfully. ID: #${applicationId}`);

    // -------------------------------------------------------------
    // TEST 4: Admin API - Career Submenu Listing & Filtering
    // -------------------------------------------------------------
    console.info('\n4. Verifying Admin Career Submenu API (GET /api/v1/admin/enquiries/career)...');
    const getCareer = await fetch(`${base}/api/v1/admin/enquiries/career?search=Ramesh`, { headers: adminHeaders });
    assert.equal(getCareer.status, 200);
    const careerList = (await getCareer.json()).data;
    assert.ok(careerList.items.length >= 1, 'Should find at least 1 career item with search Ramesh');
    const foundCareer = careerList.items.find((i: { id: number }) => i.id === careerEnquiryId);
    assert.ok(foundCareer, `Career item #${careerEnquiryId} must be present`);
    assert.equal(foundCareer.name, 'Dr. Ramesh Sharma');
    assert.equal(foundCareer.position, 'Professor of Marketing');
    assert.equal(foundCareer.designation, 'Associate Professor');
    assert.ok(foundCareer.resumeUrl, 'Resume URL must be present');
    careerResumePath = resolve(process.env.MEDIA_ROOT ?? 'uploads/home', foundCareer.resumeUrl.split('/').pop()!);
    await access(careerResumePath);
    console.info(`✓ Career item found in admin listing. Resume URL: ${foundCareer.resumeUrl}`);

    // -------------------------------------------------------------
    // TEST 5: Admin API - Enquiry Submenu Listing & Filtering
    // -------------------------------------------------------------
    console.info('\n5. Verifying Admin Enquiry Submenu API (GET /api/v1/admin/enquiries/general)...');
    const getGeneral = await fetch(`${base}/api/v1/admin/enquiries/general?search=Priya`, { headers: adminHeaders });
    assert.equal(getGeneral.status, 200);
    const generalList = (await getGeneral.json()).data;
    assert.ok(generalList.items.length >= 1, 'Should find at least 1 general enquiry with search Priya');
    const foundGeneral = generalList.items.find((i: { id: number }) => i.id === generalEnquiryId);
    assert.ok(foundGeneral, `General enquiry item #${generalEnquiryId} must be present`);
    assert.equal(foundGeneral.name, 'Priya Mehta');
    assert.equal(foundGeneral.city, 'Mumbai');
    assert.ok(foundGeneral.message.includes('PGDM Executive batch'));
    console.info(`✓ General enquiry found in admin listing. City: ${foundGeneral.city}, Status: ${foundGeneral.status}`);

    // -------------------------------------------------------------
    // TEST 6: Admin API - Application Submenu Listing & Multi-Table Data
    // -------------------------------------------------------------
    console.info('\n6. Verifying Admin Application Submenu API (GET /api/v1/admin/enquiries/applications)...');
    const getApp = await fetch(`${base}/api/v1/admin/enquiries/applications?search=Amitabh`, { headers: adminHeaders });
    assert.equal(getApp.status, 200);
    const appList = (await getApp.json()).data;
    assert.ok(appList.items.length >= 1, 'Should find at least 1 application with search Amitabh');
    const foundApp = appList.items.find((i: { id: number }) => i.id === applicationId);
    assert.ok(foundApp, `Application item #${applicationId} must be present`);
    assert.equal(foundApp.fullName, 'Amitabh Kumar Verma');
    assert.equal(foundApp.middleName, 'Kumar');
    assert.equal(foundApp.nationality, 'Indian');
    assert.equal(foundApp.gender, 'Male');
    assert.equal(foundApp.familyAnnualIncome, 'INR 8,00,000');
    assert.equal(foundApp.referralOther, 'Audit referral source');
    assert.equal(foundApp.consent, true);
    assert.equal(foundApp.education.length, 3, 'Should have 10th, 12th and graduation records');
    assert.equal(foundApp.examScores.length, 2, 'Should have 2 exam score records');
    console.info(`✓ Admission application found. Qualification summary: "${foundApp.qualification}", Exam summary: "${foundApp.examSummary}"`);

    // -------------------------------------------------------------
    // TEST 7: Update Status across all 3 submenu types
    // -------------------------------------------------------------
    console.info('\n7. Verifying Status Updates for all 3 submenus...');
    // Career status update
    const patchCareer = await fetch(`${base}/api/v1/admin/enquiries/${careerEnquiryId}/status`, {
      method: 'PATCH',
      headers: adminHeaders,
      body: JSON.stringify({ status: 'IN_PROGRESS' }),
    });
    assert.equal(patchCareer.status, 200);
    const updatedCareer = (await patchCareer.json()).data;
    assert.equal(updatedCareer.status, 'IN_PROGRESS');
    console.info(`✓ Career #${careerEnquiryId} status updated to IN_PROGRESS`);

    // Enquiry status update
    const patchEnquiry = await fetch(`${base}/api/v1/admin/enquiries/${generalEnquiryId}/status`, {
      method: 'PATCH',
      headers: adminHeaders,
      body: JSON.stringify({ status: 'RESOLVED' }),
    });
    assert.equal(patchEnquiry.status, 200);
    const updatedEnquiry = (await patchEnquiry.json()).data;
    assert.equal(updatedEnquiry.status, 'RESOLVED');
    console.info(`✓ Enquiry #${generalEnquiryId} status updated to RESOLVED`);

    // Application status update
    const patchApp = await fetch(`${base}/api/v1/admin/applications/${applicationId}/status`, {
      method: 'PATCH',
      headers: adminHeaders,
      body: JSON.stringify({ status: 'REVIEWED' }),
    });
    assert.equal(patchApp.status, 200);
    const updatedApp = (await patchApp.json()).data;
    assert.equal(updatedApp.status, 'REVIEWED');
    console.info(`✓ Application #${applicationId} status updated to REVIEWED`);

    // -------------------------------------------------------------
    // TEST 8: Delete Action across all 3 submenu types
    // -------------------------------------------------------------
    console.info('\n8. Verifying Delete Actions across all 3 submenus...');
    // Delete career
    const delCareer = await fetch(`${base}/api/v1/admin/enquiries/${careerEnquiryId}`, {
      method: 'DELETE',
      headers: adminHeaders,
    });
    assert.equal(delCareer.status, 204);
    assert(careerResumePath);
    await assert.rejects(access(careerResumePath), 'Deleting a career enquiry removes its uploaded test resume');
    console.info(`✓ Career #${careerEnquiryId} deleted`);

    // Delete general enquiry
    const delGeneral = await fetch(`${base}/api/v1/admin/enquiries/${generalEnquiryId}`, {
      method: 'DELETE',
      headers: adminHeaders,
    });
    assert.equal(delGeneral.status, 204);
    console.info(`✓ General enquiry #${generalEnquiryId} deleted`);

    // Delete application
    const delApp = await fetch(`${base}/api/v1/admin/applications/${applicationId}`, {
      method: 'DELETE',
      headers: adminHeaders,
    });
    assert.equal(delApp.status, 204);
    console.info(`✓ Application #${applicationId} deleted`);

    console.info('\n=== ALL ENQUIRIES VERIFICATION TESTS PASSED SUCCESSFULLY! ===\n');
  } finally {
    await cleanup(testUser.id);
    await prisma.$disconnect();
  }
}

main().catch((err) => {
  console.error('Verification failed with error:', err);
  process.exit(1);
});
