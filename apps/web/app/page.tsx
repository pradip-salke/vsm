import type { Metadata } from 'next';
import { Button } from '@/components/ui/Button';
import { EnquirySection } from '@/components/sections/EnquirySection';
import { FacultySection } from '@/components/sections/FacultySection';
import { FaqSection } from '@/components/sections/FaqSection';
import { Internships } from '@/components/sections/Internships';
import { Marquee } from '@/components/sections/Marquee';
import { MediaCarousel } from '@/components/sections/MediaCarousel';
import { PageHero } from '@/components/sections/PageHero';
import { Recruiters } from '@/components/sections/Recruiters';
import { Testimonials } from '@/components/sections/Testimonials';
import { WhyChoose } from '@/components/sections/WhyChoose';
import { heroSlides, homeEvents, homeLife, whyChooseImage } from '@/content/home';
import { APPLY_PATH, ENQUIRY_ANCHOR } from '@/content/site';
import { AboutSection } from '@/features/home/AboutSection';
import { CtaBanner } from '@/features/home/CtaBanner';
import { PgdmProgram } from '@/features/home/PgdmProgram';
import { Specialisations } from '@/features/home/Specialisations';
import { StatsBar } from '@/features/home/StatsBar';

export const metadata: Metadata = {
  title: { absolute: 'AICTE Approved PGDM College in Mumbai | Valia School of Management' },
  description:
    'Valia School of Management offers a 2-year full-time AICTE-approved PGDM in Mumbai with industry-led curriculum, internships and 100% placement assistance.',
};

export default function HomePage() {
  return (
    <>
      <PageHero
        slides={heroSlides}
        actions={
          <>
            <Button href={APPLY_PATH}>Apply Now</Button>
            <Button variant="arrow" href={ENQUIRY_ANCHOR}>
              Enquire now
            </Button>
          </>
        }
      />
      <StatsBar />
      <AboutSection />
      <Marquee />
      <PgdmProgram />
      <FacultySection />
      <WhyChoose image={whyChooseImage} />
      <Specialisations />
      <Recruiters />
      <Internships />
      <Testimonials />
      <Marquee />
      <MediaCarousel id="events" title="Upcoming Events" items={homeEvents} layout="events" />
      <MediaCarousel id="life-at-vsm" title="Life @ VSM" items={homeLife} layout="life" background="cream" />
      <FaqSection />
      <CtaBanner />
      <EnquirySection />
    </>
  );
}
