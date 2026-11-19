import assert from 'node:assert/strict';
import test from 'node:test';
import { generalEnquirySchema } from './enquiries.controller.js';

test('recruitment enquiry requires all contact and organization details', () => {
  const valid = generalEnquirySchema.safeParse({
    name: 'Test Applicant',
    email: 'test@example.com',
    phone: '+91 9876543210',
    organization: 'Example Organization',
    designation: 'Talent Manager',
    message: 'We would like to discuss campus recruitment.',
    source: 'recruitment-enquiry',
  });
  assert.equal(valid.success, true);

  const invalid = generalEnquirySchema.safeParse({ name: 'Test Applicant', phone: '9876543210' });
  assert.equal(invalid.success, false);
});
