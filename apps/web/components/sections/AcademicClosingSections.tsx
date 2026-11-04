import { FaqSection } from '@/components/sections/FaqSection';
import { Internships } from '@/components/sections/Internships';
import { Recruiters } from '@/components/sections/Recruiters';
import { Testimonials } from '@/components/sections/Testimonials';

/** Shared closing sequence used by every academic programme page. */
export function AcademicClosingSections() {
  return (
    <>
      <Recruiters />
      <Internships variant="academic" />
      <Testimonials />
      <FaqSection />
    </>
  );
}
