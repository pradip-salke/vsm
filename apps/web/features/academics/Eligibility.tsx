import { Icon } from '@/components/ui/Icon';
import { icons } from '@/components/ui/icons';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { eligibility } from '@/content/academics';
import styles from './AcademicsBlocks.module.css';

export function Eligibility() {
  return (
    <section aria-labelledby="eligibility-title">
      <SectionHeading id="eligibility-title" title="Pgdm Course Eligibility" />
      <ul className={styles.eligibility} role="list">
        {eligibility.map((criterion) => (
          <li key={criterion}>
            <Icon src={icons.graduate} className={styles.graduate} />
            <p>{criterion}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
