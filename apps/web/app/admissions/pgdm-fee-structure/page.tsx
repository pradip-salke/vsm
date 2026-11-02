import type { Metadata } from 'next';
import { AdmissionsPageShell, AdmissionSection } from '../AdmissionsPageShell';
import styles from '../Admissions.module.css';

export const metadata: Metadata = {
  title: 'PGDM Fees Structure 2026–28',
  description: 'PGDM program fee structure for 2026–28 at Valia School of Management.',
  alternates: { canonical: '/admissions/pgdm-fee-structure/' },
};

const fees = [
  ['Application Form Fees (One Time)', 'INR 2,000/- (One Time)'],
  ['Admission Fees', 'INR 50,000/-'],
  ['1st Year', 'INR 3,00,000/-'],
  ['2nd Year', 'INR 3,50,000/-'],
  ['TOTAL FEES', 'INR 7,00,000/-'],
];

export default function FeesStructurePage() {
  return <AdmissionsPageShell title="PGDM Fees Structure: Batch 2026–28" subtitle="Your Investment in World-Class Education" active="Fees Structure">
    <AdmissionSection title="PGDM Course Fees in Mumbai">
      <p className={styles.lead}>Discover the value of a transformative education at Valia School of Management. Our PGDM fee structure is designed to be clear and inclusive, ensuring that students from diverse backgrounds can plan their educational journey with confidence. At VSM, we believe in transparency and affordability, providing you with a detailed breakdown of costs for our PGDM and PGDM Dual Specialization programs.</p>
      <p>Explore our detailed PGDM fee structure below, tailored for both Indian Nationals and International Students:</p>
    </AdmissionSection>
    <AdmissionSection title="PGDM Program Fees 2026–28">
      <div className={styles.tableScroll} tabIndex={0}><table className={styles.table}><caption className="visually-hidden">PGDM fees for Indian national students</caption>
        <thead><tr><th scope="col">Fee Structure</th><th scope="col">Indian Nationals Students</th></tr></thead>
        <tbody>{fees.map(([name, value]) => <tr key={name}><th scope="row">{name}</th><td>{value}</td></tr>)}</tbody>
      </table></div>
      <p className={styles.note}>* INR 50,000 Scholarship for Valia College Students</p>
    </AdmissionSection>
  </AdmissionsPageShell>;
}
