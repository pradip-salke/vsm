'use client';

import { useCallback, useEffect, useId, useState, type FormEvent } from 'react';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { icons } from '@/components/ui/icons';
import { enquiryCities } from '@/content/shared';
import { submitEnquiry } from '@/lib/api';
import styles from './EnquiryForm.module.css';

type Status = { type: 'idle' } | { type: 'sending' } | { type: 'success' } | { type: 'error'; message: string };
type Errors = Partial<Record<'firstName' | 'lastName' | 'email' | 'phone' | 'city' | 'captcha' | 'consent', string>>;

const CAPTCHA_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
const makeCaptcha = () => Array.from({ length: 4 }, () => CAPTCHA_CHARS[Math.floor(Math.random() * CAPTCHA_CHARS.length)]).join('');

function validate(data: FormData, captcha: string): Errors {
  const errors: Errors = {};
  const value = (key: string) => String(data.get(key) ?? '').trim();
  if (value('firstName').length < 1) errors.firstName = 'Enter your first name.';
  if (value('lastName').length < 1) errors.lastName = 'Enter your last name.';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value('email'))) errors.email = 'Enter a valid email address.';
  if (!/^\+?[\d\s-]{7,20}$/.test(value('phone'))) errors.phone = 'Enter a valid phone number.';
  if (!value('city')) errors.city = 'Select your city.';
  if (value('captcha') !== captcha) errors.captcha = 'The text does not match the image.';
  if (!data.get('consent')) errors.consent = 'Please accept to continue.';
  return errors;
}

export function EnquiryForm() {
  const formId = useId();
  const [status, setStatus] = useState<Status>({ type: 'idle' });
  const [errors, setErrors] = useState<Errors>({});
  const [captcha, setCaptcha] = useState('');

  const refreshCaptcha = useCallback(() => setCaptcha(makeCaptcha()), []);
  // Generated after mount so server and client markup match.
  useEffect(refreshCaptcha, [refreshCaptcha]);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const nextErrors = validate(data, captcha);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      form.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus();
      return;
    }

    setStatus({ type: 'sending' });
    const result = await submitEnquiry({
      name: `${data.get('firstName')} ${data.get('lastName')}`.trim(),
      email: String(data.get('email')).trim(),
      phone: String(data.get('phone')).trim(),
      city: String(data.get('city')),
      consent: true,
      source: 'website-enquire-now',
    });
    if ('message' in result) {
      setStatus({ type: 'error', message: result.message });
    } else {
      form.reset();
      refreshCaptcha();
      setStatus({ type: 'success' });
    }
  }

  const field = (name: keyof Errors) => ({
    id: `${formId}-${name}`,
    name,
    'aria-invalid': errors[name] ? true : undefined,
    'aria-describedby': errors[name] ? `${formId}-${name}-error` : undefined,
  });
  const error = (name: keyof Errors) =>
    errors[name] ? (
      <span id={`${formId}-${name}-error`} className={styles.error}>
        {errors[name]}
      </span>
    ) : null;

  return (
    <form className={styles.form} onSubmit={onSubmit} noValidate>
      <div className={styles.grid}>
        <div className={styles.field}>
          <label htmlFor={`${formId}-firstName`} className="visually-hidden">
            First Name
          </label>
          <input {...field('firstName')} className={styles.input} placeholder="First Name*" autoComplete="given-name" required />
          {error('firstName')}
        </div>
        <div className={styles.field}>
          <label htmlFor={`${formId}-lastName`} className="visually-hidden">
            Last Name
          </label>
          <input {...field('lastName')} className={styles.input} placeholder="Last Name*" autoComplete="family-name" required />
          {error('lastName')}
        </div>
        <div className={styles.field}>
          <label htmlFor={`${formId}-email`} className="visually-hidden">
            Email
          </label>
          <input {...field('email')} type="email" className={styles.input} placeholder="Email*" autoComplete="email" required />
          {error('email')}
        </div>
        <div className={styles.field}>
          <label htmlFor={`${formId}-phone`} className="visually-hidden">
            Phone Number
          </label>
          <input {...field('phone')} type="tel" className={styles.input} placeholder="Phone Number*" autoComplete="tel" required />
          {error('phone')}
        </div>
        <div className={`${styles.field} ${styles.full}`}>
          <label htmlFor={`${formId}-city`} className="visually-hidden">
            City
          </label>
          <select {...field('city')} className={`${styles.input} ${styles.select}`} defaultValue="" required>
            <option value="" disabled>
              Select City*
            </option>
            {enquiryCities.map((city) => (
              <option key={city} value={city}>
                {city}
              </option>
            ))}
          </select>
          {error('city')}
        </div>
        <div className={styles.field}>
          <div className={`${styles.input} ${styles.captchaBox}`}>
            <span className={styles.captchaText} aria-label={`Verification text: ${captcha.split('').join(' ')}`} role="img">
              {captcha}
            </span>
            <button type="button" className={styles.refresh} onClick={refreshCaptcha} aria-label="Show a new verification text">
              <Icon src={icons.refresh} size="100%" />
            </button>
          </div>
        </div>
        <div className={styles.field}>
          <label htmlFor={`${formId}-captcha`} className="visually-hidden">
            Enter the verification text
          </label>
          <input {...field('captcha')} className={styles.input} placeholder="Enter Text" autoComplete="off" required />
          {error('captcha')}
        </div>
      </div>

      <div className={styles.consent}>
        <input {...field('consent')} type="checkbox" className={styles.checkbox} value="yes" required />
        <label htmlFor={`${formId}-consent`}>
          I agree to receive information regarding my submitted application by signing up with Valia School of Management via Email,
          SMS and WhatsApp.*
        </label>
      </div>
      {error('consent')}

      <Button type="submit" disabled={status.type === 'sending'} className={styles.submit}>
        {status.type === 'sending' ? 'Sending…' : 'Contact Us'}
      </Button>

      <p className={styles.status} role="status" aria-live="polite">
        {status.type === 'success' && 'Thank you! Our admissions team will contact you shortly.'}
        {status.type === 'error' && <span className={styles.statusError}>{status.message}</span>}
      </p>
    </form>
  );
}
