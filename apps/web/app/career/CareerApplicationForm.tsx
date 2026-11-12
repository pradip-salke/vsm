'use client';

import { useState, type FormEvent } from 'react';
import { PUBLIC_API_BASE_URL } from '@/lib/api';
import styles from './CareerPage.module.css';

export function CareerApplicationForm() {
  const [status, setStatus] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);

    const position = String(formData.get('position') ?? 'this position');
    setSubmitting(true);
    setStatus('');
    setIsSuccess(false);

    try {
      const response = await fetch(`${PUBLIC_API_BASE_URL}/api/v1/public/career`, {
        method: 'POST',
        body: formData,
      });

      const result = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(result?.error?.message ?? 'Failed to submit application. Please check your information and try again.');
      }

      setIsSuccess(true);
      setStatus(`✓ Thank you! Your application for "${position}" has been submitted successfully. Our HR team will review your resume and contact you.`);
      form.reset();
    } catch (cause) {
      setIsSuccess(false);
      setStatus(cause instanceof Error ? cause.message : 'Could not submit your application. Please try again or email us.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <label className={styles.field}>
        <span>Name <b aria-hidden="true">*</b></span>
        <input name="name" type="text" autoComplete="name" required disabled={submitting} />
      </label>
      <label className={styles.field}>
        <span>Email <b aria-hidden="true">*</b></span>
        <input name="email" type="email" autoComplete="email" required disabled={submitting} />
      </label>
      <label className={styles.field}>
        <span>Phone Number <b aria-hidden="true">*</b></span>
        <input
          name="phone"
          type="tel"
          autoComplete="tel"
          inputMode="numeric"
          pattern="[0-9]{10}"
          minLength={10}
          maxLength={10}
          placeholder="10-digit mobile number"
          required
          disabled={submitting}
        />
      </label>
      <label className={styles.field}>
        <span>Position Applied <b aria-hidden="true">*</b></span>
        <input name="position" type="text" placeholder="e.g. Assistant Professor, Marketing" required disabled={submitting} />
      </label>
      <label className={styles.field}>
        <span>Current Designation <b aria-hidden="true">*</b></span>
        <input name="designation" type="text" placeholder="e.g. Senior Lecturer, Corporate Trainer" required disabled={submitting} />
      </label>
      <label className={`${styles.field} ${styles.fileField}`}>
        <span>Resume/CV (PDF, DOC, DOCX) <b aria-hidden="true">*</b></span>
        <input
          name="resume"
          type="file"
          accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          required
          disabled={submitting}
        />
      </label>
      <button className={styles.submit} type="submit" disabled={submitting}>
        {submitting ? 'Submitting…' : 'Submit Application'}
      </button>
      {status && (
        <p
          className={`${styles.formStatus} ${isSuccess ? styles.formStatusSuccess : styles.formStatusError}`}
          aria-live="polite"
          style={{ color: isSuccess ? '#15803d' : '#b91c1c', fontWeight: 600, marginTop: '12px' }}
        >
          {status}
        </p>
      )}
    </form>
  );
}
