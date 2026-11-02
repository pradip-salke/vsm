import type { CSSProperties } from 'react';

import { Icon } from '@/components/ui/Icon';
import type { IconListItem } from '@/content/shared';
import styles from './IconList.module.css';

type IconListProps = {
  items: IconListItem[];
  /** Separator lines between rows (Admission Procedure). */
  divided?: boolean;
  ordered?: boolean;
  className?: string;
};

/** Figma badge is 77px; glyph and layer sizes are stored in Figma px and scaled with the badge. */
const BADGE = 77;
const pct = (px: number, of = BADGE) => `${(px / of) * 100}%`;

/**
 * Icon rows used by "Why Choose VSM" and "Admission Procedure". The first row
 * carries the teal highlight band; hovering or focusing another row moves it.
 */
export function IconList({ items, divided = false, ordered = false, className }: IconListProps) {
  const Tag = ordered ? 'ol' : 'ul';
  return (
    <Tag className={[styles.list, divided && styles.divided, className].filter(Boolean).join(' ')} role="list">
      {items.map((item, index) => (
        <li key={item.text} className={styles.item} data-active={index === 0 || undefined}>
          <span className={styles.badge} aria-hidden>
            {item.layers ? (
              <span className={styles.layers} style={{ '--glyph': pct(item.iconSize) } as CSSProperties}>
                {item.layers.map((layer) => (
                  <span
                    key={layer.src}
                    className={styles.layer}
                    style={{
                      left: pct(layer.x, item.iconSize),
                      top: pct(layer.y, item.iconSize),
                      width: pct(layer.size, item.iconSize),
                    }}
                  >
                    <Icon src={layer.src} size="100%" />
                  </span>
                ))}
              </span>
            ) : (
              <span className={styles.glyph} style={{ '--glyph': pct(item.iconSize) } as CSSProperties}>
                <Icon src={item.icon} size="100%" />
              </span>
            )}
          </span>
          <span className={styles.text}>{item.text}</span>
        </li>
      ))}
    </Tag>
  );
}
