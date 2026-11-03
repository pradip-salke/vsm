import type { Metadata } from 'next';
import { Button } from '@/components/ui/Button';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { FacultySection } from '@/components/sections/FacultySection';
import { FaqSection } from '@/components/sections/FaqSection';
import { IconList } from '@/components/sections/IconList';
import { Internships } from '@/components/sections/Internships';
import { MediaCarousel } from '@/components/sections/MediaCarousel';
import { PageHero } from '@/components/sections/PageHero';
import { Recruiters } from '@/components/sections/Recruiters';
import { Testimonials } from '@/components/sections/Testimonials';
import { WhyChoose } from '@/components/sections/WhyChoose';
import {
  academicsBreadcrumb,
  academicsAdvantages,
  academicsEvents,
  academicsGallery,
  academicsHero,
  academicsVideos,
  academicsWhyImage,
  admissionSteps,
} from '@/content/academics';
import { APPLY_PATH, ENQUIRY_ANCHOR } from '@/content/site';
import { AboutProgram } from '@/features/academics/AboutProgram';
import { AcademicsTabs } from '@/features/academics/AcademicsTabs';
import { AtAGlance } from '@/features/academics/AtAGlance';
import { Curriculum } from '@/features/academics/Curriculum';
import { Eligibility } from '@/features/academics/Eligibility';
import { Fees } from '@/features/academics/Fees';
import layout from '@/features/academics/AcademicsLayout.module.css';

export const metadata: Metadata = {
  title: { absolute: 'PGDM Courses in Mumbai | AICTE Approved PGDM College | VSM' },
  description:
    'AICTE-approved 2-year PGDM in Mumbai at Valia School of Management: curriculum, eligibility, fees, faculty and admission procedure.',
  alternates: { canonical: '/our-academics/aicte-pgdm-courses-in-mumbai/' },
};

export default function AictePgdmPage() {
  return (
    <div className={layout.page}>
      <PageHero
        size="inner"
        slides={[academicsHero]}
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
            <AboutProgram />
          </div>
          <div id="program-videos" className={`${layout.block} ${layout.bleed}`}>
            <MediaCarousel id="program-videos-carousel" title="PGDM Program Video" items={academicsVideos} layout="video" variant="column" />
          </div>
          <div className={`${layout.block} ${layout.bleed} ${layout.why}`}>
            <WhyChoose id="why-vsm" image={academicsWhyImage} items={academicsAdvantages} variant="column" />
          </div>
          <div id="gallery" className={`${layout.block} ${layout.bleed}`}>
            <MediaCarousel id="gallery-carousel" title="Life @ VSM" items={academicsGallery} layout="life" variant="column" />
          </div>
          <div id="events" className={`${layout.block} ${layout.bleed}`}>
            <MediaCarousel id="events-carousel" title="Upcoming Events" items={academicsEvents} layout="video" variant="column" uppercase play />
          </div>
          <div id="curriculum" className={layout.block}>
            <Curriculum />
          </div>
          <div className={`${layout.block} ${layout.bleed}`}>
            <FacultySection id="faculties" variant="column" />
          </div>
          <div className={layout.block}>
            <Eligibility />
          </div>
          <div id="fees" className={layout.block}>
            <Fees />
          </div>
          <section id="admission-procedure" className={layout.block} aria-labelledby="admission-title">
            <SectionHeading id="admission-title" title="PGDM Admission Procedure" />
            <IconList items={admissionSteps} ordered divided className={layout.steps} />
          </section>
        </div>
      </div>

      <Recruiters />
      <Internships />
      <Testimonials />
      <FaqSection />
    </div>
  );
}
