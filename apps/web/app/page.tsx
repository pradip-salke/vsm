import type { Metadata } from 'next';
import { Button } from '@/components/ui/Button';
import { FacultySection } from '@/components/sections/FacultySection';
import { FaqSection } from '@/components/sections/FaqSection';
import { Internships } from '@/components/sections/Internships';
import { Marquee } from '@/components/sections/Marquee';
import { MediaCarousel } from '@/components/sections/MediaCarousel';
import { PageHero } from '@/components/sections/PageHero';
import { Recruiters } from '@/components/sections/Recruiters';
import { Testimonials } from '@/components/sections/Testimonials';
import { WhyChoose } from '@/components/sections/WhyChoose';
import { AboutSection } from '@/features/home/AboutSection';
import { CtaBanner } from '@/features/home/CtaBanner';
import { PgdmProgram } from '@/features/home/PgdmProgram';
import { Specialisations } from '@/features/home/Specialisations';
import { StatsBar } from '@/features/home/StatsBar';
import styles from './page.module.css';
import { getHomeContent } from '@/lib/home-content';
import { withSeo } from '@/lib/seo';
import { eventGalleryAlbums } from '@/content/events';
import { getTestimonialMasters } from '@/lib/testimonial-masters';
import { getSliderVisibility } from '@/lib/slider-visibility';
import { getCommonSlides } from '@/lib/common-slides';

const metadata: Metadata = {
  title: { absolute: 'AICTE Approved PGDM College in Mumbai | Valia School of Management' },
  description:
    'Valia School of Management offers a 2-year full-time AICTE-approved PGDM in Mumbai with industry-led curriculum, internships and 100% placement assistance.',
};

export async function generateMetadata(): Promise<Metadata> {
  return withSeo('/', metadata);
}

export default async function HomePage() {
  const { sections: content, masters } = await getHomeContent();
  const testimonialMasters = await getTestimonialMasters('home', masters.testimonials.items);
  const visibility = await getSliderVisibility('home');
  const commonSlides = await getCommonSlides('home');
  const enabled = <T extends { enabled: boolean }>(items: T[]) => items.filter(item => item.enabled);
  return (
    <div className={styles.homePage}>
      <PageHero
        slides={enabled(masters.hero.items)}
        actions={
          <>
            <Button href={content.hero.primaryHref}>{content.hero.primaryText}</Button>
            <Button variant="arrow" href={content.hero.secondaryHref}>
              {content.hero.secondaryText}
            </Button>
          </>
        }
      />
      <StatsBar items={content.stats.items} />
      <AboutSection content={content.about} />
      <Marquee items={content.marquee.items} />
      <PgdmProgram content={content.program} />
      {(visibility.faculty || Boolean(commonSlides?.faculty.length)) && <FacultySection items={commonSlides?.faculty ?? enabled(masters.faculty.items)} heading={content.faculty} />}
      <WhyChoose image={content.why.image} items={content.why.items} heading={content.why} />
      <Specialisations content={content.specialisations} />
      {(visibility.recruiters || Boolean(commonSlides?.recruiters.length)) && <Recruiters home items={commonSlides?.recruiters ?? enabled(masters.recruiters.items)} title={content.recruiters.title} />}
      {(visibility.internships || Boolean(commonSlides?.internships.length)) && <Internships items={commonSlides?.internships ?? masters.internships.items.filter(item => item.enabled !== false)} title={content.internships.title} />}
      {(visibility.testimonials || Boolean(commonSlides && (commonSlides.video.length || commonSlides.written.length))) && <Testimonials videoItems={commonSlides?.video ?? enabled(testimonialMasters.video)} writtenItems={commonSlides?.written ?? enabled(testimonialMasters.written)} heading={content.testimonials} reduceBottomPadding />}
      <Marquee items={content.marquee.items} />
      {(commonSlides?.galleryEvents ?? enabled(masters.events.items)).length > 0 && <MediaCarousel id="events" title={content.events.title} items={commonSlides?.galleryEvents ?? enabled(masters.events.items)} layout="events" homeEventSpacing galleryPopup galleryAlbums={eventGalleryAlbums} moreLink={{ href: '/events/gallery/', label: 'View More' }} />}
      {(commonSlides?.gallery ?? enabled(masters.life.items)).length > 0 && <MediaCarousel id="life-at-vsm" title={content.life.title} items={commonSlides?.gallery ?? enabled(masters.life.items)} layout="life" background="cream" galleryPopup galleryAlbums={eventGalleryAlbums} galleryFallbackSlug="infra" />}
      <FaqSection content={content.faq} />
      <CtaBanner content={content.cta} />
    </div>
  );
}
