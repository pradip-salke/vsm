import { FaqSection } from '@/components/sections/FaqSection';
import { Internships } from '@/components/sections/Internships';
import { Recruiters } from '@/components/sections/Recruiters';
import { Testimonials } from '@/components/sections/Testimonials';
import type { HomeContent, HomeMasters } from '@vsmedu/contracts/home';
import type { ImageAsset } from '@/content/types';
import { getTestimonialMasters } from '@/lib/testimonial-masters';
import { getSliderVisibility } from '@/lib/slider-visibility';
import { FacultySection } from '@/components/sections/FacultySection';
import { getHomeContent } from '@/lib/home-content';
import { getCommonSlides } from '@/lib/common-slides';

type Props = {
  scope: string;
  /** Per-page FAQ from CMS (`academics.faq`, `academics-aima.faq`, or specialisation payload). Never Home FAQ. */
  faq: HomeContent['faq'];
  internships: (ImageAsset & { enabled?: boolean })[];
  internshipTitle: string;
  testimonials: HomeMasters['testimonials']['items'];
  testimonialHeading: HomeContent['testimonials'];
};

export async function AcademicClosingSections({ scope, faq, internships, internshipTitle, testimonials, testimonialHeading }: Props) {
  const masters = await getTestimonialMasters(scope, testimonials);
  const visibility = await getSliderVisibility(scope);
  const common = await getHomeContent();
  const selected = await getCommonSlides(scope);
  return (
    <>
      {scope !== 'aicte' && (visibility.faculty || Boolean(selected?.faculty.length)) && <FacultySection items={selected?.faculty ?? common.masters.faculty.items.filter(item => item.enabled)} heading={common.sections.faculty} />}
      {(visibility.recruiters || Boolean(selected?.recruiters.length)) && <Recruiters items={selected?.recruiters ?? common.masters.recruiters.items.filter(item => item.enabled)} title={common.sections.recruiters.title} />}
      {(visibility.internships || Boolean(selected?.internships.length)) && <Internships variant="academic" items={selected?.internships ?? internships.filter((item) => item.enabled !== false)} title={internshipTitle} />}
      {(visibility.testimonials || Boolean(selected && (selected.video.length || selected.written.length))) && <Testimonials videoItems={selected?.video ?? masters.video.filter(item => item.enabled)} writtenItems={selected?.written ?? masters.written.filter(item => item.enabled)} heading={testimonialHeading} />}
      <FaqSection content={faq} />
    </>
  );
}
