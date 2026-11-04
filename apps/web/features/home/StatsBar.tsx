import { stats } from '@/content/home';
import styles from './StatsBar.module.css';

export function StatsBar() {
  return (
    <section className={styles.stats} aria-label="Programme at a glance">
      <dl className={`container ${styles.grid}`}>
        {stats.map((stat, index) => (
          <div key={stat.label} className={styles.item}>
            {index > 0 && (
              <img className={styles.divider} src="/images/figma/stats-divider.svg" alt="" aria-hidden="true" />
            )}
            <dt className={styles.label}>{stat.label}</dt>
            <dd className={styles.value}>{stat.value}</dd>
            <dd className={styles.description}>{stat.description}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
