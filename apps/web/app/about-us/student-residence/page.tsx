import type { Metadata } from 'next';
import Link from 'next/link';
import { AboutPageShell, AboutSection } from '../AboutPageShell';
import styles from '../about.module.css';

export const metadata: Metadata = { title: 'Student Residence', description: 'Student accommodation information for Valia School of Management students.', alternates: { canonical: '/about-us/student-residence/' } };

export default function StudentResidencePage() {
  return <AboutPageShell title="Student Residence" active="Student Residence">
    <AboutSection title="Student Residence">
      <div className={styles.copy}>
        <p>Student living is not your everyday life in Mumbai. It&apos;s your second home. VSM has tied-up with One of the Finest Student Residence providers – Stanza Living, a professionally managed accommodation for students.</p>
        <p>For further details, refer to the <Link href="https://vsmedu.com/wp-content/uploads/2024/09/VSM-AICTE-PGDM-Brochure.pdf" target="_blank" rel="noreferrer">VSM PGDM brochure (PDF)</Link>.</p>
      </div>
    </AboutSection>
  </AboutPageShell>;
}
