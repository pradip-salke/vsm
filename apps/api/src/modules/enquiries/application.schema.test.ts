import test from 'node:test';
import assert from 'node:assert/strict';
import { applicationSchema } from './enquiries.controller.js';

const validApplication = {
  firstName: 'Test', middleName: 'Applicant', lastName: 'Student', email: 'student@example.com',
  phone: '+91 98765 43210', parentPhone: '+91 98765 43211', dateOfBirth: '2002-06-15',
  address: '10 Test Road', city: 'Mumbai', pinCode: '400001', country: 'India', nationality: 'Indian',
  gender: 'Female', familyAnnualIncome: 'INR 8,00,000', referral: 'Website', consent: true,
  education: [
    { stage: '10th', institution: 'Test School', board: 'CBSE', stream: 'General', passingYear: 2018, resultPercent: 85 },
    { stage: '12th', institution: 'Test Junior College', board: 'CBSE', stream: 'Commerce', passingYear: 2020, resultPercent: 88.5 },
    { stage: 'Graduation', institution: 'Test University', stream: 'B.Com', passingYear: 2023, resultPercent: 79 },
  ],
  examScores: [{ examCode: 'CAT', score: 0 }],
};

test('application form schema accepts all submitted fields and optional middle name', () => {
  const parsed = applicationSchema.safeParse({ ...validApplication, middleName: undefined });
  assert.equal(parsed.success, true);
  if (parsed.success) assert.equal(parsed.data.examScores?.[0]?.score, 0);
});

test('application schema rejects invalid contact, postal, consent and incomplete education data', () => {
  assert.equal(applicationSchema.safeParse({ ...validApplication, phone: 'letters' }).success, false);
  assert.equal(applicationSchema.safeParse({ ...validApplication, pinCode: '123' }).success, false);
  assert.equal(applicationSchema.safeParse({ ...validApplication, consent: false }).success, false);
  assert.equal(applicationSchema.safeParse({ ...validApplication, education: validApplication.education.slice(0, 2) }).success, false);
});

test('application schema requires a specification for Other referral', () => {
  assert.equal(applicationSchema.safeParse({ ...validApplication, referral: 'Other' }).success, false);
  assert.equal(applicationSchema.safeParse({ ...validApplication, referral: 'Other', referralOther: 'Friend' }).success, true);
});
