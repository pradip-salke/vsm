'use client';

import { useState, type FormEvent } from 'react';
import { Button } from '@/components/ui/Button';
import { PUBLIC_API_BASE_URL } from '@/lib/api';
import enquiryStyles from '@/components/sections/EnquiryForm.module.css';
import styles from '../Admissions.module.css';

type FieldProps = { label: string; name: string; type?: string; required?: boolean; wide?: boolean; options?: string[]; min?: string | number; max?: string | number; step?: string | number; pattern?: string; title?: string; inputMode?: 'numeric' | 'tel' };
function Field({ label, name, type = 'text', required = false, wide = false, options, min, max, step, pattern, title, inputMode }: FieldProps) {
  return <div className={`${styles.field} ${enquiryStyles.field} ${wide ? styles.wide : ''}`}>
    <label htmlFor={`application-${name}`}>{label}{required ? ' *' : ''}</label>
    {options ? <select className={`${enquiryStyles.input} ${enquiryStyles.select}`} id={`application-${name}`} name={name} required={required} defaultValue=""><option value="" disabled>Select</option>{options.map((option) => <option key={option}>{option}</option>)}</select> :
      <input className={enquiryStyles.input} id={`application-${name}`} name={name} type={type} required={required} min={min} max={max} step={step} pattern={pattern} title={title} inputMode={inputMode} />}
  </div>;
}

const required = true;
const currentYear = new Date().getFullYear();
const today = new Date().toISOString().slice(0, 10);
const exams = ['CAT', 'MAT', 'CET', 'CMAT', 'ATMA'];
const referrals = ['Website', 'Social Media', 'Advertisement', 'Friend', 'Phone / SMS / Email', 'Other'];

export function AdmissionsApplicationForm() {
  const [status, setStatus] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [selectedReferral, setSelectedReferral] = useState('');

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    if (!form.reportValidity()) return;

    setSubmitting(true);
    setStatus('');
    setIsSuccess(false);

    const formData = new FormData(form);
    const get = (key: string) => String(formData.get(key) ?? '').trim();
    const getNumber = (key: string) => {
      const value = get(key);
      return value ? Number(value) : undefined;
    };

    const payload = {
      firstName: get('first-name'),
      middleName: get('middle-name') || undefined,
      lastName: get('last-name'),
      dateOfBirth: get('date-of-birth') || undefined,
      nationality: get('nationality') || undefined,
      gender: get('gender') || undefined,
      email: get('email'),
      phone: get('phone'),
      parentPhone: get('parent-phone') || undefined,
      familyAnnualIncome: get('family-annual-income') || undefined,
      address: get('address') || undefined,
      city: get('city') || undefined,
      pinCode: get('pin-code') || undefined,
      country: get('country') || 'India',
      referral: get('referral') || undefined,
      referralOther: get('referral-other') || undefined,
      consent: formData.get('terms-consent') === 'Agreed',
      education: [
        {
          stage: '10th',
          institution: get('10th-school'),
          board: get('10th-board'),
          stream: get('10th-stream'),
          passingYear: getNumber('10th-year'),
          resultPercent: getNumber('10th-percentage'),
        },
        {
          stage: '12th',
          institution: get('12th-school'),
          board: get('12th-board'),
          stream: get('12th-stream'),
          passingYear: getNumber('12th-year'),
          resultPercent: getNumber('12th-percentage'),
        },
        {
          stage: 'Graduation',
          institution: get('graduation-university'),
          stream: get('graduation-stream'),
          passingYear: getNumber('graduation-year'),
          resultPercent: getNumber('graduation-percentage'),
        },
      ].filter((e) => e.institution || e.stream || e.passingYear),
      examScores: [
        ...exams
          .map((exam) => {
            const val = get(`entrance-${exam.toLowerCase()}`);
            return val ? { examCode: exam, score: Number(val) } : null;
          })
          .filter(Boolean),
        ...(get('other-exam') ? [{ examCode: 'Other', score: getNumber('other-exam') }] : []),
      ],
    };

    try {
      const response = await fetch(`${PUBLIC_API_BASE_URL}/api/v1/public/applications`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(result?.error?.message ?? 'Could not submit your application. Please check all fields.');
      }

      setIsSuccess(true);
      setStatus(`✓ Thank you! Your PGDM admission application has been submitted successfully (Reference #${result.data.id}). Our admissions team will review your application and contact you soon.`);
      form.reset();
      setSelectedReferral('');
    } catch (cause) {
      setIsSuccess(false);
      setStatus(cause instanceof Error ? cause.message : 'Could not submit your application. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return <form className={styles.form} onSubmit={onSubmit}>
    <fieldset className={styles.formGroup}><legend className="visually-hidden">Section 1: Applicant Information</legend><h3>Section 1: Applicant Information</h3>
      <div className={styles.fields}>
        <Field label="First Name" name="first-name" required={required} /><Field label="Middle Name" name="middle-name" />
        <Field label="Last Name" name="last-name" required={required} /><Field label="Date of Birth" name="date-of-birth" type="date" max={today} required={required} />
        <Field label="Nationality" name="nationality" required={required} /><Field label="Gender" name="gender" required={required} options={['Male', 'Female']} />
        <Field label="Email Id" name="email" type="email" required={required} /><Field label="Phone Number" name="phone" type="tel" required={required} pattern="[+0-9 ()-]{7,32}" title="Enter a valid phone number" inputMode="tel" />
        <Field label="Parent Phone Number" name="parent-phone" type="tel" required={required} pattern="[+0-9 ()-]{7,32}" title="Enter a valid phone number" inputMode="tel" /><Field label="Family Annual Income" name="family-annual-income" required={required} />
      </div>
    </fieldset>
    <fieldset className={styles.formGroup}><legend className="visually-hidden">Section 2: Applicant Address</legend><h3>Section 2: Applicant Address</h3>
      <div className={styles.fields}><Field label="Full Address" name="address" required={required} wide /><Field label="City" name="city" required={required} /><Field label="Pin Code" name="pin-code" required={required} pattern="[0-9]{6}" title="Enter a 6-digit PIN code" inputMode="numeric" /><Field label="Country" name="country" required={required} /></div>
    </fieldset>
    <fieldset className={styles.formGroup}><legend className="visually-hidden">Section 3: Educational Qualifications</legend><h3>Section 3: Educational Qualifications</h3>
      <p className={styles.lead}>Enter your School / College, Board / University, Passing Year, Stream and Final Result % for each qualification.</p>
      {(['10th', '12th'] as const).map((exam) => <div className={styles.education} key={exam}><h4 className={styles.subheading}>{exam}</h4><div className={styles.fields}><Field label="School" name={`${exam}-school`} required={required} /><Field label="Board Name" name={`${exam}-board`} required={required} /><Field label="Passing Year" name={`${exam}-year`} type="number" min={1950} max={currentYear} step={1} required={required} /><Field label="Stream" name={`${exam}-stream`} required={required} /><Field label="Percentage %" name={`${exam}-percentage`} type="number" min={0} max={100} step="0.01" required={required} /></div></div>)}
      <div className={styles.education}><h4 className={styles.subheading}>Graduation</h4><div className={styles.fields}><Field label="University Name" name="graduation-university" required={required} /><Field label="Passing Year" name="graduation-year" type="number" min={1950} max={currentYear} step={1} required={required} /><Field label="Stream" name="graduation-stream" required={required} /><Field label="Percentage %" name="graduation-percentage" type="number" min={0} max={100} step="0.01" required={required} /></div></div>
    </fieldset>
    <fieldset className={styles.formGroup}><legend className="visually-hidden">Section 4: Entrance Scores Details</legend><h3>Section 4: Entrance Scores Details</h3>
      <div className={styles.fields}>{exams.map((exam) => <Field key={exam} label={exam} name={`entrance-${exam.toLowerCase()}`} type="number" min={0} step="any" />)}<Field label="Any Other Exams (Please Specify)" name="other-exam" type="number" min={0} step="any" /></div>
    </fieldset>
    <fieldset className={styles.formGroup}><legend className="visually-hidden">Section 5: How did you find about us?</legend><h3>Section 5: How did you find about us?</h3>
      <p className={styles.lead}>How did you find about us? *</p>
      <div className={styles.radios}>{referrals.map((referral) => <label key={referral}><input type="radio" name="referral" value={referral} required onChange={() => setSelectedReferral(referral)} />{referral}</label>)}</div>
      <div className={`${styles.fields} ${styles.consentArea}`}><Field label="If Other, please specify" name="referral-other" required={selectedReferral === 'Other'} />
        <label className={`${styles.consent} ${enquiryStyles.consent} ${styles.wide}`}><input className={enquiryStyles.checkbox} type="checkbox" name="terms-consent" value="Agreed" required /><span>I agree to VSM <a href="https://vsmedu.com/terms-and-conditions/" target="_blank" rel="noreferrer">Terms &amp; Conditions</a> and <a href="https://vsmedu.com/privacy-policy/" target="_blank" rel="noreferrer">Privacy Policy</a>. *</span></label>
      </div>
    </fieldset>
    <Button type="submit" disabled={submitting}>
      {submitting ? 'Submitting Application…' : 'Submit Application'}
    </Button>
    {status && (
      <p
        className={styles.status}
        role="status"
        aria-live="polite"
        style={{ color: isSuccess ? '#15803d' : '#b91c1c', fontWeight: 600, marginTop: '16px' }}
      >
        {status}
      </p>
    )}
  </form>;
}
