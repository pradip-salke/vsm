import { FaqSection } from '@/components/sections/FaqSection';
import { Internships } from '@/components/sections/Internships';
import { Recruiters } from '@/components/sections/Recruiters';
import { Testimonials } from '@/components/sections/Testimonials';
import type { HomeContent, HomeMasters } from '@vsmedu/contracts/home';
import type { ImageAsset } from '@/content/types';

type Props = {
  /** Per-page FAQ from CMS (`academics.faq`, `academics-aima.faq`, or specialisation payload). Never Home FAQ. */
  faq: HomeContent['faq'];
  internships: (ImageAsset & { enabled?: boolean })[];
  internshipTitle: string;
  testimonials: HomeMasters['testimonials']['items'];
  testimonialHeading: HomeContent['testimonials'];
};

export function AcademicClosingSections({ faq, internships, internshipTitle, testimonials, testimonialHeading }: Props) {
  return (
    <>
      <Recruiters />
      <Internships variant="academic" items={internships.filter((item) => item.enabled !== false)} title={internshipTitle} />
      <Testimonials items={testimonials.filter((item) => item.enabled)} heading={testimonialHeading} />
      <FaqSection content={faq} />
    </>
  );
}
