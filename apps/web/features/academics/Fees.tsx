import { SectionHeading } from '@/components/ui/SectionHeading';
import type { AcademicsContent } from '@vsmedu/contracts/academics';
import styles from './AcademicsBlocks.module.css';

export function Fees({ fees }: { fees: AcademicsContent['fees'] }) {
  return (
    <section aria-labelledby="fees-title">
      <SectionHeading id="fees-title" title={fees.title} />
      <div className={styles.tableScroll} tabIndex={0}>
        <table className={`${styles.table} ${styles.feeTable}`}>
          <thead>
            <tr>
              {[fees.columnLabel, fees.columnValue].map((column) => (
                <th key={column} scope="col">
                  {column}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {fees.rows.map(({ label, amount: value }) => (
              <tr key={label}>
                <th scope="row">{label}</th>
                <td>{value}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className={styles.note}>{fees.note}</p>
    </section>
  );
}
