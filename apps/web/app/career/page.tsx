import type { Metadata } from 'next';
import Image from 'next/image';
import { Button } from '@/components/ui/Button';
import { PageHero } from '@/components/sections/PageHero';
import { academicsHero } from '@/content/academics';
import { APPLY_PATH } from '@/content/site';
import { CareerApplicationForm } from './CareerApplicationForm';
import styles from './CareerPage.module.css';

export const metadata: Metadata = {
  title: 'Career | Valia School of Management',
  description: 'Explore career opportunities at Valia School of Management and apply for a position.',
  alternates: { canonical: '/career/' },
};

export default function CareerPage() {
  const slide = { ...academicsHero, title: 'Start your career with VSM', subtitle: 'VSM Career Opportunities' };

  return (
    <>
      <PageHero
        size="inner"
        slides={[slide]}
        actions={<Button href="#career-application">Apply for a position</Button>}
        breadcrumb={[{ label: 'Home', href: '/' }, { label: 'Career' }]}
      />

      <main className={styles.main}>
        <section className={`container ${styles.application}`} id="career-application">
          <div className={styles.applicationGrid}>
            <div className={styles.imageWrap}>
              <Image
                src="https://vsmedu.com/wp-content/uploads/2025/11/2150917138.jpg"
                alt="Professionals collaborating in a modern workplace"
                width={800}
                height={1000}
                sizes="(max-width: 800px) 100vw, 42vw"
              />
              <div className={styles.imageCaption}>
                <span>Build your future</span>
                <strong>Grow with VSM</strong>
              </div>
            </div>
            <div className={styles.formPanel}>
              <h3>Apply for a position</h3>
              <p className={styles.formIntro}>Share your details and resume with our team.</p>
              <CareerApplicationForm />
            </div>
          </div>
        </section>

        <section className={styles.enquiry}>
          <div className={`container ${styles.enquiryInner}`}>
            <div>
              <span className={styles.eyebrow}>Your next step</span>
              <h2>Nothing Beats Good Education For The Betterment Of A Student’s Future</h2>
            </div>
            <Button variant="arrow" href={APPLY_PATH}>Enquire now</Button>
          </div>
        </section>
      </main>
    </>
  );
}
