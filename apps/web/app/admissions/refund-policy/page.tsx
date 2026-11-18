import type { Metadata } from 'next';
import { AdmissionsPageShell, AdmissionSection } from '../AdmissionsPageShell';
import styles from '../Admissions.module.css';
import { withSeo } from '@/lib/seo';
import { getAdmissionsPageContent, cmsString } from '@/lib/cms-content';

const metadata: Metadata = {
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

export async function generateMetadata(): Promise<Metadata> {
  return withSeo('/admissions/refund-policy/', metadata);
}

export default async function RefundPolicyPage() {
  const content = await getAdmissionsPageContent('refund-policy');
  const policyContent = content?.sections.policy;
  const policyClauses = Array.isArray(policyContent?.clauses) ? policyContent.clauses as {body:string}[] : null;
  const refundTable = content?.sections['refund-table'];
  const cmsRows = Array.isArray(refundTable?.refundRows) ? refundTable.refundRows as {particular:string;deduction:string;refund:string}[] : null;
  return <AdmissionsPageShell title="Refund Policy" subtitle="Cancellation of Admission, Refund of Fees and Return of Documents by Institute" active="Refund Policy" content={content}>
    <AdmissionSection title={cmsString(policyContent?.title, 'Cancellation of Admission, Refund of Fees and Return of Documents by Institute')}>
      <ol className={styles.list}>{(policyClauses ?? policy.map((item) => ({body: ''}))).map((clause, index) => <li key={index}><span className={styles.marker} aria-hidden>{index + 1}</span><div>{policyClauses ? <span dangerouslySetInnerHTML={{__html:clause.body}} /> : policy[index]}</div></li>)}</ol>
      <p className={`${styles.lead} ${styles.refundAfterList}`} dangerouslySetInnerHTML={{__html:cmsString(policyContent?.note, 'Notwithstanding the clause above, the student shall not be entitled to any refund of his/her fee, if the cancellation of admission request is made by the Student after the Course Commences.')}} />
    </AdmissionSection>
    <AdmissionSection title={cmsString(refundTable?.title, 'Refund Policy: As prescribed by AICTE')}>
      <div className={styles.tableScroll} tabIndex={0}><table className={styles.table}><caption className="visually-hidden">Refund policy prescribed by AICTE</caption>
        <thead><tr><th scope="col">{cmsString(refundTable?.particularHeading,'Fees Particulars')}</th><th scope="col">{cmsString(refundTable?.deductionHeading,'Deduction')}</th><th scope="col">{cmsString(refundTable?.refundHeading,'Refund')}</th></tr></thead>
        <tbody>{(cmsRows ?? refundRows.map(([particular,deduction,refund])=>({particular,deduction,refund}))).map(({particular,deduction,refund}) => <tr key={particular}><th scope="row">{particular}</th><td>{deduction}</td><td>{refund}</td></tr>)}</tbody>
      </table></div>
    </AdmissionSection>
  </AdmissionsPageShell>;
}
