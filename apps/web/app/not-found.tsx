import { Button } from '@/components/ui/Button';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { ACADEMICS_PGDM_PATH } from '@/content/site';
import styles from './not-found.module.css';

export default function NotFound() {
  return (
    <section className={`container ${styles.notFound}`} aria-labelledby="not-found-title">
      <SectionHeading id="not-found-title" eyebrow="Page not found" title="This page is not available yet" as="h1">
        <p>The page you are looking for may have moved or is still being built. Explore the PGDM programme or head back home.</p>
      </SectionHeading>
      <div className={styles.actions}>
        <Button href="/">Back to Home</Button>
        <Button variant="arrow" href={ACADEMICS_PGDM_PATH}>
          View PGDM program
        </Button>
      </div>
    </section>
  );
}
