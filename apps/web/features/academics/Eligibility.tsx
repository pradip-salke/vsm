import Image from 'next/image';
import { Icon } from '@/components/ui/Icon';
import { SectionHeading } from '@/components/ui/SectionHeading';
import type { AcademicsContent } from '@vsmedu/contracts/academics';
import styles from './AcademicsBlocks.module.css';

type EligibilityProps = {
  eligibility: AcademicsContent['eligibility'];
};

function CriterionIcon({
  icon,
}: {
  icon: AcademicsContent['eligibility']['criteria'][number]['icon'];
}) {
  const src = String(icon.src ?? '');
  const isSvg = src.toLowerCase().endsWith('.svg');
  if (isSvg) {
    return <Icon src={src} className={styles.graduate} label={icon.alt?.trim() ? icon.alt : undefined} />;
  }
  const w = icon.width > 0 ? icon.width : 68;
  const h = icon.height > 0 ? icon.height : 68;
  return (
    <Image
      src={src}
      alt={icon.alt?.trim() || ''}
      width={w}
      height={h}
      className={styles.eligibilityRaster}
    />
  );
}

export function Eligibility({ eligibility }: EligibilityProps) {
  const { title, criteria } = eligibility;

  return (
    <section id="eligibility" aria-labelledby="eligibility-title">
      <SectionHeading id="eligibility-title" title={title} />
      <ul className={styles.eligibility} role="list">
        {criteria.map((criterion, index) => (
          <li key={`${criterion.text}-${index}`}>
            <CriterionIcon icon={criterion.icon} />
            <p>{criterion.text}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
