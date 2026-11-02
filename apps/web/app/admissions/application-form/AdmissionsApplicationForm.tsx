'use client';

import { useState, type FormEvent } from 'react';
import { Button } from '@/components/ui/Button';
import enquiryStyles from '@/components/sections/EnquiryForm.module.css';
import styles from '../Admissions.module.css';

type FieldProps = { label: string; name: string; type?: string; required?: boolean; wide?: boolean; options?: string[] };
function Field({ label, name, type = 'text', required = false, wide = false, options }: FieldProps) {
  return <div className={`${styles.field} ${enquiryStyles.field} ${wide ? styles.wide : ''}`}>
    <label htmlFor={`application-${name}`}>{label}{required ? ' *' : ''}</label>
    {options ? <select className={`${enquiryStyles.input} ${enquiryStyles.select}`} id={`application-${name}`} name={name} required={required} defaultValue=""><option value="" disabled>Select</option>{options.map((option) => <option key={option}>{option}</option>)}</select> :
      <input className={enquiryStyles.input} id={`application-${name}`} name={name} type={type} required={required} />}
  </div>;
}

const required = true;
const exams = ['CAT', 'MAT', 'CET', 'CMAT', 'ATMA'];
const referrals = ['Website', 'Social Media', 'Advertisement', 'Friend', 'Phone / SMS / Email', 'Other'];

export function AdmissionsApplicationForm() {
  const [status, setStatus] = useState('');
  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    if (!form.reportValidity()) return;
    const values = Array.from(new FormData(form).entries()).map(([name, value]) => `${name}: ${value}`).join('\n');
    const subject = encodeURIComponent('PGDM Application 2026–28');
    const body = encodeURIComponent(values);
    window.location.href = `mailto:admissions@vsmedu.in?subject=${subject}&body=${body}`;
    setStatus('Your email app should open with your application details. Send the email to complete your application.');
  }

  return <form className={styles.form} onSubmit={onSubmit}>
    <fieldset className={styles.formGroup}><legend className="visually-hidden">Section 1: Applicant Information</legend><h3>Section 1: Applicant Information</h3>
      <div className={styles.fields}>
        <Field label="First Name" name="first-name" required={required} /><Field label="Middle Name" name="middle-name" required={required} />
        <Field label="Last Name" name="last-name" required={required} /><Field label="Date of Birth" name="date-of-birth" type="date" required={required} />
        <Field label="Nationality" name="nationality" required={required} /><Field label="Gender" name="gender" required={required} options={['Male', 'Female']} />
        <Field label="Email Id" name="email" type="email" required={required} /><Field label="Phone Number" name="phone" type="tel" required={required} />
        <Field label="Parent Phone Number" name="parent-phone" type="tel" required={required} /><Field label="Family Annual Income" name="family-annual-income" required={required} />
      </div>
    </fieldset>
    <fieldset className={styles.formGroup}><legend className="visually-hidden">Section 2: Applicant Address</legend><h3>Section 2: Applicant Address</h3>
      <div className={styles.fields}><Field label="Full Address" name="address" required={required} wide /><Field label="City" name="city" required={required} /><Field label="Pin Code" name="pin-code" required={required} /><Field label="Country" name="country" required={required} /></div>
    </fieldset>
    <fieldset className={styles.formGroup}><legend className="visually-hidden">Section 3: Educational Qualifications</legend><h3>Section 3: Educational Qualifications</h3>
      <p className={styles.lead}>Enter your School / College, Board / University, Passing Year, Stream and Final Result % for each qualification.</p>
      {(['10th', '12th'] as const).map((exam) => <div className={styles.education} key={exam}><h4 className={styles.subheading}>{exam}</h4><div className={styles.fields}><Field label="School" name={`${exam}-school`} required={required} /><Field label="Board Name" name={`${exam}-board`} required={required} /><Field label="Passing Year" name={`${exam}-year`} required={required} /><Field label="Stream" name={`${exam}-stream`} required={required} /><Field label="Percentage %" name={`${exam}-percentage`} required={required} /></div></div>)}
      <div className={styles.education}><h4 className={styles.subheading}>Graduation</h4><div className={styles.fields}><Field label="University Name" name="graduation-university" required={required} /><Field label="Passing Year" name="graduation-year" required={required} /><Field label="Stream" name="graduation-stream" required={required} /><Field label="Percentage %" name="graduation-percentage" required={required} /></div></div>
    </fieldset>
    <fieldset className={styles.formGroup}><legend className="visually-hidden">Section 4: Entrance Scores Details</legend><h3>Section 4: Entrance Scores Details</h3>
      <div className={styles.fields}>{exams.map((exam) => <Field key={exam} label={exam} name={`entrance-${exam.toLowerCase()}`} />)}<Field label="Any Other Exams (Please Specify)" name="other-exam" /></div>
    </fieldset>
    <fieldset className={styles.formGroup}><legend className="visually-hidden">Section 5: How did you find about us?</legend><h3>Section 5: How did you find about us?</h3>
      <p className={styles.lead}>How did you find about us? *</p>
      <div className={styles.radios}>{referrals.map((referral) => <label key={referral}><input type="radio" name="referral" value={referral} required />{referral}</label>)}</div>
      <div className={`${styles.fields} ${styles.consentArea}`}><Field label="If Other, please specify" name="referral-other" />
        <label className={`${styles.consent} ${enquiryStyles.consent} ${styles.wide}`}><input className={enquiryStyles.checkbox} type="checkbox" name="terms-consent" value="Agreed" required /><span>I agree to VSM <a href="https://vsmedu.com/terms-and-conditions/" target="_blank" rel="noreferrer">Terms &amp; Conditions</a> and <a href="https://vsmedu.com/privacy-policy/" target="_blank" rel="noreferrer">Privacy Policy</a>. *</span></label>
      </div>
    </fieldset>
    <Button type="submit">Submit Application</Button>
    <p className={styles.status} role="status" aria-live="polite">{status}</p>
  </form>;
}
