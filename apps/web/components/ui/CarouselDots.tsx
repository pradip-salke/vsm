import styles from './CarouselDots.module.css';

type CarouselDotsProps = {
  count: number;
  active: number;
  onSelect: (index: number) => void;
  tone?: 'dark' | 'light';
  align?: 'start' | 'center';
  label: string;
};

export function CarouselDots({ count, active, onSelect, tone = 'dark', align = 'center', label }: CarouselDotsProps) {
  return (
    <div className={`${styles.dots} ${styles[tone]} ${styles[align]}`} role="group" aria-label={`${label} slide controls`}>
      {Array.from({ length: count }, (_, index) => (
        <button
          key={index}
          type="button"
          className={styles.dot}
          aria-label={`Show slide ${index + 1}`}
          aria-current={index === active ? 'true' : undefined}
          onClick={() => onSelect(index)}
        />
      ))}
    </div>
  );
}
