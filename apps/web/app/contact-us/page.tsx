import type { Metadata } from 'next';
import { Button } from '@/components/ui/Button';
import { PageHero } from '@/components/sections/PageHero';
import { academicsHero } from '@/content/academics';
import { APPLY_PATH } from '@/content/site';
import styles from './ContactPage.module.css';

export const metadata: Metadata = {
  title: 'Contact Us | Valia School of Management',
  description: 'Get in touch with Valia School of Management with your questions, suggestions, and feedback.',
  alternates: { canonical: '/contact-us/' },
};

const contactMapUrl = 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d15077.700395413956!2d72.81570538587455!3d19.132860685866014!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3be7c90a5cf14ec3%3A0x43e2ef0e96af06f9!2sValia%20School%20of%20Management!5e0!3m2!1sen!2sin!4v1739169921810!5m2!1sen!2sin';

export default function ContactUsPage() {
  const slide = { ...academicsHero, title: 'Get in Touch with VSM', subtitle: "We're Here to Answer Your Queries" };

  return (
    <>
      <PageHero
        size="inner"
        slides={[slide]}
        actions={<>
          <Button href={APPLY_PATH}>Apply Now</Button>
          <Button variant="arrow" href="mailto:admissions@vsmedu.in">Enquire now</Button>
        </>}
        breadcrumb={[{ label: 'Home', href: '/' }, { label: 'Contact' }]}
      />
      <div className={styles.main}>
        <section className={`container ${styles.section}`} aria-label="Contact introduction">
          <p className={styles.intro}>
            At Valia School of Management, we’re always open to your questions, suggestions, and feedback. Whether you’re a prospective student, a parent, or just curious about our programs, our team is here to provide you with the information you need. Reach out to us within our working hours, and we’ll be more than happy to assist you.
          </p>
          
          <p className={styles.closing}>
            Feel free to contact us during our working hours, and we’ll ensure your queries are addressed promptly. Your journey towards excellence in management education starts here, and we’re excited to guide you through every step of the way.
          </p>
        </section>
      </div>
      <section className={styles.mapSection} aria-label="Location">
        <div className={styles.mapFrame}>
          <iframe
            title="Valia School of Management on Google Maps"
            src={contactMapUrl}
            width="600"
            height="450"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            allowFullScreen
          />
        </div>
      </section>
    </>
  );
}
