import type { Metadata } from 'next';
import { Button } from '@/components/ui/Button';
import { PageHero } from '@/components/sections/PageHero';
import { CmsHtml } from '@/components/ui/CmsHtml';
import { getPublicFooter } from '@/lib/site-brand';
import styles from './ContactPage.module.css';
import { withSeo } from '@/lib/seo';

const metadata: Metadata = {
  title: 'Contact Us | Valia School of Management',
  description: 'Get in touch with Valia School of Management with your questions, suggestions, and feedback.',
  alternates: { canonical: '/contact-us/' },
};

export async function generateMetadata(): Promise<Metadata> {
  return withSeo('/contact-us/', metadata);
}

export default async function ContactUsPage() {
  const { contactPage } = await getPublicFooter();
  const slide = {
    image: contactPage.hero.image,
    imagePosition: contactPage.hero.imagePosition,
    mobileImagePosition: contactPage.hero.mobileImagePosition,
    title: contactPage.hero.title,
    subtitle: contactPage.hero.subtitle,
  };

  return (
    <>
      <PageHero
        size="inner"
        slides={[slide]}
        actions={<>
          {contactPage.hero.applyText && contactPage.hero.applyHref && <Button href={contactPage.hero.applyHref}>{contactPage.hero.applyText}</Button>}
          {contactPage.hero.enquireText && contactPage.hero.enquireHref && <Button variant="arrow" href={contactPage.hero.enquireHref}>{contactPage.hero.enquireText}</Button>}
        </>}
        breadcrumb={[{ label: 'Home', href: '/' }, { label: contactPage.breadcrumbLabel }]}
      />
      <div className={styles.main}>
        <section className={`container ${styles.section}`} aria-label="Contact introduction">
          {contactPage.intro && <CmsHtml className={styles.intro} html={contactPage.intro} />}
          {contactPage.closing && <CmsHtml className={styles.closing} html={contactPage.closing} />}
        </section>
      </div>
      <section className={styles.mapSection} aria-label="Location">
        <div className={styles.mapFrame}>
          <iframe
            title="Valia School of Management on Google Maps"
            src={contactPage.mapEmbedUrl}
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
