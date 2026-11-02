import Image from 'next/image';
import { Button } from '@/components/ui/Button';
import { cta } from '@/content/home';
import { APPLY_PATH } from '@/content/site';
import styles from './CtaBanner.module.css';

export function CtaBanner() {
  return (
    <section className={styles.banner} aria-labelledby="cta-title">
      <Image className={styles.image} src={cta.image.src} alt={cta.image.alt} width={cta.image.width} height={cta.image.height} sizes="100vw" />
      <div className={`container ${styles.content}`}>
        <h2 id="cta-title" className={styles.title}>
          {cta.title}
        </h2>
        <Button variant="arrow" href={APPLY_PATH}>
          Apply now
        </Button>
      </div>
    </section>
  );
}
