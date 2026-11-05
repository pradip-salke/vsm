import type { Metadata } from 'next';
import { AdmissionsPageShell, AdmissionSection } from '../AdmissionsPageShell';
import styles from '../Admissions.module.css';

export const metadata: Metadata = {
  title: 'PGDM Admission Refund Policy',
  description: 'Admission cancellation, fee refund and return of documents policy at Valia School of Management.',
  alternates: { canonical: '/admissions/refund-policy/' },
};

const policy = [
  <>Application Fee is Non – Refundable.</>,
  <>The Student shall apply through an email on <a href="mailto:admissions@vsmedu.in">admissions@vsmedu.in</a> for cancellation and withdrawal of admission. The student should also submit duly signed copy of application for cancellation of admission to the Institute in-person.</>,
  <>Upon the receiving of Student request for cancellation, his/her admission shall be treated as cancelled.</>,
  <>Upon such cancellation, the Student shall lose the claim on the seat.</>,
  <>The Student shall then be entitled to refund of the entire fees after deduction of Rs. 1000/- towards processing charges. All original documents submitted to the Institute will be returned.</>,
];
const refundRows = [
  ['Application Fee Rs. 2000/-', 'NA', 'No Refund'],
  ['Before Commencement of Course (as per the date notified by AICTE)', 'Rs. 1,000/-', '100% less Rs. 1,000/-'],
  ['After Commencement of Course (as per the date notified by AICTE)', '100%', 'No Refund'],
];

export default function RefundPolicyPage() {
  return <AdmissionsPageShell title="Refund Policy" subtitle="Cancellation of Admission, Refund of Fees and Return of Documents by Institute" active="Refund Policy">
    <AdmissionSection title="Cancellation of Admission, Refund of Fees and Return of Documents by Institute">
      <ol className={styles.list}>{policy.map((item, index) => <li key={index}><span className={styles.marker} aria-hidden>{index + 1}</span><p>{item}</p></li>)}</ol>
      <p className={`${styles.lead} ${styles.refundAfterList}`}>Notwithstanding the clause above, the student shall not be entitled to any refund of his/her fee, if the cancellation of admission request is made by the Student after the Course Commences.</p>
    </AdmissionSection>
    <AdmissionSection title="Refund Policy: As prescribed by AICTE">
      <div className={styles.tableScroll} tabIndex={0}><table className={styles.table}><caption className="visually-hidden">Refund policy prescribed by AICTE</caption>
        <thead><tr><th scope="col">Fees Particulars</th><th scope="col">Deduction</th><th scope="col">Refund</th></tr></thead>
        <tbody>{refundRows.map(([particular, deduction, refund]) => <tr key={particular}><th scope="row">{particular}</th><td>{deduction}</td><td>{refund}</td></tr>)}</tbody>
      </table></div>
    </AdmissionSection>
  </AdmissionsPageShell>;
}
