import { stats } from '@/content/home';
import styles from './StatsBar.module.css';

export function StatsBar() {
  return (
    <section className={styles.stats} aria-label="Programme at a glance">
      <dl className={`container ${styles.grid}`}>
        {stats.map((stat) => (
          <div key={stat.label} className={styles.item}>
            <dt className={styles.label}>{stat.label}</dt>
            <dd className={styles.value}>{stat.value}</dd>
            <dd className={styles.description}>{stat.description}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
