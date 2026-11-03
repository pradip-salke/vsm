'use client';

import { useState, type FormEvent } from 'react';
import styles from './CareerPage.module.css';

export function CareerApplicationForm() {
  const [status, setStatus] = useState('');

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus('Online application delivery is not available yet. Please email your resume to info@vsmedu.in.');
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <label className={styles.field}>
        <span>Name <b aria-hidden="true">*</b></span>
        <input name="name" type="text" autoComplete="name" required />
      </label>
      <label className={styles.field}>
        <span>Email <b aria-hidden="true">*</b></span>
        <input name="email" type="email" autoComplete="email" required />
      </label>
      <label className={styles.field}>
        <span>Phone Number <b aria-hidden="true">*</b></span>
        <input name="phone" type="tel" autoComplete="tel" inputMode="numeric" pattern="[0-9]{10}" minLength={10} maxLength={10} required />
      </label>
      <label className={styles.field}>
        <span>Position Applied <b aria-hidden="true">*</b></span>
        <input name="position" type="text" required />
      </label>
      <label className={styles.field}>
        <span>Current Designation <b aria-hidden="true">*</b></span>
        <input name="designation" type="text" required />
      </label>
      <label className={`${styles.field} ${styles.fileField}`}>
        <span>Resume/CV <b aria-hidden="true">*</b></span>
        <input name="resume" type="file" accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document" required />
      </label>
      <button className={styles.submit} type="submit">Submit</button>
      <p className={styles.formStatus} aria-live="polite">{status}</p>
    </form>
  );
}
