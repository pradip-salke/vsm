import styles from './Marquee.module.css';

const WORDS: { text: string; highlight?: boolean }[] = [
  { text: 'Discover' },
  { text: 'Learn', highlight: true },
  { text: 'Lead' },
  { text: 'Innovate', highlight: true },
  { text: 'Grow' },
];

function WordRow({ hidden = false }: { hidden?: boolean }) {
  return (
    <ul className={styles.row} role="list" aria-hidden={hidden || undefined}>
      {WORDS.map((word) => (
        <li key={word.text} className={word.highlight ? styles.highlight : undefined}>
          {word.text}
        </li>
      ))}
    </ul>
  );
}

export function Marquee() {
  return (
    <div className={styles.marquee}>
      <p className="visually-hidden">Discover, learn, lead, innovate, grow.</p>
      <div className={styles.track} aria-hidden>
        <WordRow hidden />
        <WordRow hidden />
      </div>
    </div>
  );
}
