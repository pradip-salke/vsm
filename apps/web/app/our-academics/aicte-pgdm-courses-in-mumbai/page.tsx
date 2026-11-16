import type { Metadata } from 'next';
import { Button } from '@/components/ui/Button';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { AcademicClosingSections } from '@/components/sections/AcademicClosingSections';
import { FacultySection } from '@/components/sections/FacultySection';
import { IconList } from '@/components/sections/IconList';
import { MediaCarousel } from '@/components/sections/MediaCarousel';
import { PageHero } from '@/components/sections/PageHero';
import { WhyChoose } from '@/components/sections/WhyChoose';
import {
  academicsBreadcrumb,
  academicsHero,
} from '@/content/academics';
import { APPLY_PATH, ENQUIRY_ANCHOR } from '@/content/site';
import { AboutProgram } from '@/features/academics/AboutProgram';
import { AcademicsTabs } from '@/features/academics/AcademicsTabs';
import { AtAGlance } from '@/features/academics/AtAGlance';
import { Curriculum } from '@/features/academics/Curriculum';
import { Eligibility } from '@/features/academics/Eligibility';
import { Fees } from '@/features/academics/Fees';
import layout from '@/features/academics/AcademicsLayout.module.css';
import { getAcademicsContent } from '@/lib/academics-content';
import { withSeo } from '@/lib/seo';
import { getProgramVideoContent } from '@/lib/video-content';
import { eventGalleryAlbums } from '@/content/events';
import { academicsDefaults } from '@vsmedu/contracts/academics';
import { getSliderVisibility } from '@/lib/slider-visibility';
import { getCommonSlides } from '@/lib/common-slides';
import { getHomeContent } from '@/lib/home-content';

const metadata: Metadata = {
  title: { absolute: 'PGDM Courses in Mumbai | AICTE Approved PGDM College | VSM' },
  description:
    'AICTE-approved 2-year PGDM in Mumbai at Valia School of Management: curriculum, eligibility, fees, faculty and admission procedure.',
  alternates: { canonical: '/our-academics/aicte-pgdm-courses-in-mumbai/' },
};

export async function generateMetadata(): Promise<Metadata> {
  return withSeo('/our-academics/aicte-pgdm-courses-in-mumbai/', metadata);
}

export default async function AictePgdmPage() {
  const [{ sections: academics, masters }, programVideos] = await Promise.all([getAcademicsContent(), getProgramVideoContent()]);
  const [visibility, common] = await Promise.all([getSliderVisibility('aicte'), getHomeContent()]);
  const selected = await getCommonSlides('aicte');
  const advantage = academics.advantage ?? academicsDefaults.advantage;
  const advantageBody = advantage.body.replace(
    /<(ul|ol)(\b[^>]*)>([\s\S]*?)<\/\1>/gi,
    (_match, tag: string, attributes: string, items: string) =>
      `<div class="${layout.advantageListViewport}"><${tag}${attributes}>${items}</${tag}></div>`,
  );
  return (
    <div className={layout.page}>
      <PageHero
        size="inner"
        slides={masters.hero.items.filter(item => item.enabled !== false).map(item => ({ ...academicsHero, ...item }))}
        breadcrumb={academicsBreadcrumb}
        actions={
          <>
            <Button href={APPLY_PATH}>Apply Now</Button>
            <Button variant="arrow" href={ENQUIRY_ANCHOR}>
              Enquire now
            </Button>
          </>
        }
      />
      <AcademicsTabs />

      <div className={layout.layout}>
        <aside className={layout.sidebar} aria-label="Programme summary">
          <AtAGlance />
        </aside>

        <div className={layout.main}>
          <div id="about-program" className={layout.block}>
            <AboutProgram about={academics.about} />
          </div>
          <div id="program-videos" className={`${layout.block} ${layout.bleed}`}>
            <MediaCarousel id="program-videos-carousel" title={programVideos.title} items={programVideos.items} layout="video" variant="column" play />
          </div>
          <div className={`${layout.block} ${layout.bleed} ${layout.why}`}>
            <WhyChoose id="why-vsm" image={academics.why.image} items={academics.why.items} variant="column" />
          </div>
          <div id="gallery" className={`${layout.block} ${layout.bleed} ${layout.lifeBlock}`}>
            <MediaCarousel id="gallery-carousel" title={academics.gallery.title} items={masters.gallery.items.filter((item) => item.enabled !== false)} layout="life" variant="column" galleryPopup galleryAlbums={eventGalleryAlbums} galleryFallbackSlug="infra" />
          </div>
          <div id="events" className={`${layout.block} ${layout.bleed}`}>
            <MediaCarousel id="events-carousel" title={academics.events.title} items={masters.events.items.filter((item) => item.enabled !== false)} layout="events" variant="column" galleryPopup galleryAlbums={eventGalleryAlbums} />
          </div>
          <div id="curriculum" className={`${layout.block} ${layout.beforeFacultyBlock}`}>
            <Curriculum notes={academics.curriculum.years} />
          </div>
          {(visibility.faculty || Boolean(selected?.faculty.length)) && <div className={`${layout.block} ${layout.bleed}`}>
            <FacultySection id="faculties" variant="column" items={selected?.faculty ?? common.masters.faculty.items.filter(item => item.enabled)} />
          </div>}
          <div className={layout.block}>
            <Eligibility eligibility={academics.eligibility} />
          </div>
          <div id="fees" className={layout.block}>
            <Fees />
          </div>
          <section id="admission-procedure" className={layout.block} aria-labelledby="admission-title">
            <SectionHeading id="admission-title" title={academics.admission.title} />
            <IconList items={academics.admission.steps} ordered divided className={layout.steps} />
          </section>
          <section id="vsm-advantage" className={layout.block} aria-labelledby="advantage-title">
            <SectionHeading id="advantage-title" as="h3" size="h2" title={advantage.title} />
            <div className={layout.advantageContent} dangerouslySetInnerHTML={{ __html: advantageBody }} />
          </section>
        </div>
      </div>

      <AcademicClosingSections
        scope="aicte"
        faq={academics.faq}
        internships={masters.internships.items}
        internshipTitle={academics.internships.title}
        testimonials={masters.testimonials.items}
        testimonialHeading={academics.testimonials}
      />
    </div>
  );
}
