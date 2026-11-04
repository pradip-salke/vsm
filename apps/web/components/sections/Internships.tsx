import Image from 'next/image';
import { Carousel } from '@/components/ui/Carousel';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { internships } from '@/content/shared';
import styles from './Internships.module.css';

export function Internships({ variant = 'default' }: { variant?: 'default' | 'academic' }) {
  const slides = internships.map((card, index) => (
    <figure key={index} className={styles.card}>
      <Image src={card.src} alt={card.alt} width={card.width} height={card.height} sizes="(max-width: 767px) 85vw, 30vw" />
    </figure>
  ));

  return (
    <section className={`${styles.section} ${variant === 'academic' ? styles.academic : ''}`} aria-labelledby="internship-title">
      <div className="container">
        <SectionHeading id="internship-title" title="Summer Internship 2025-27" align="center" />
        <Carousel label="Summer Internship 2025-27" slides={slides} className={styles.carousel} />
      </div>
    </section>
  );
}
