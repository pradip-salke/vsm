import styles from './Marquee.module.css';

const WORDS: { text: string; highlight?: boolean }[] = [
  { text: 'Discover' },
  { text: 'Learn', highlight: true },
  { text: 'Lead' },
  { text: 'Innovate', highlight: true },
  { text: 'Grow' },
];

function WordRow({ hidden = false, items = WORDS }: { hidden?: boolean; items?: typeof WORDS }) {
  const words = items.length ? [...items, { ...items[0] }] : [];

  return (
    <ul className={styles.row} role="list" aria-hidden={hidden || undefined}>
      {words.map((word, index) => (
        <li key={`${word.text}-${index}`} className={word.highlight ? styles.highlight : undefined}>
          {word.text}
        </li>
      ))}
    </ul>
  );
}

export function Marquee({ items = WORDS }: { items?: typeof WORDS }) {
  return (
    <div className={styles.marquee}>
      <p className="visually-hidden">{items.map(item => item.text).join(', ')}</p>
      <div className={styles.track} aria-hidden>
        <WordRow hidden items={items} />
        <WordRow hidden items={items} />
      </div>
    </div>
  );
}
