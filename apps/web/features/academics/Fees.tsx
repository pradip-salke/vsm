import { SectionHeading } from '@/components/ui/SectionHeading';
import { fees } from '@/content/academics';
import styles from './AcademicsBlocks.module.css';

export function Fees() {
  return (
    <section aria-labelledby="fees-title">
      <SectionHeading id="fees-title" title={fees.title} />
      <div className={styles.tableScroll} tabIndex={0}>
        <table className={`${styles.table} ${styles.feeTable}`}>
          <thead>
            <tr>
              {fees.columns.map((column) => (
                <th key={column} scope="col">
                  {column}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {fees.rows.map(([label, value]) => (
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
