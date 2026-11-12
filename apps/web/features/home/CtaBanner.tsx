import Image from 'next/image';
import { Button } from '@/components/ui/Button';
import styles from './CtaBanner.module.css';
import { homeDefaults, type HomeContent } from '@vsmedu/contracts/home';

export function CtaBanner({ content = homeDefaults.cta }: { content?: HomeContent['cta'] }) {
  const cta = content;
  return (
    <section className={styles.banner} aria-labelledby="cta-title">
      <Image className={styles.image} src={cta.image.src} alt={cta.image.alt} width={cta.image.width} height={cta.image.height} sizes="100vw" />
      <div className={`container ${styles.content}`}>
        <h2 id="cta-title" className={styles.title}>
          {cta.title}
        </h2>
        <Button variant="arrow" href={content.buttonHref}>
          {content.buttonText}
        </Button>
      </div>
    </section>
  );
}
