import { academicsSpecialisationIndex } from '@vsmedu/contracts/academics-specialisations';
import { readHome } from './home.service.js';
import { readAcademics } from './academics.service.js';
import { readAima } from './academics-aima.service.js';
import { readSpecialisationPage } from './academics-specialisations.service.js';
import { readTestimonialMaster } from './testimonial-masters.service.js';
import { readSliderVisibility } from './slider-visibility.service.js';
import { readPublicGallery } from './gallery.service.js';
import { HttpError } from '../../middleware/errors.js';

const scopes = ['home', 'aicte', 'aima', ...academicsSpecialisationIndex.map(item => item.slug)];
type Item = { enabled?: boolean; pages?: string[] };

/** Legacy records retain their source page or the previous shared visibility. */
export async function readCommonSlides(scope: string) {
  if (!scopes.includes(scope)) throw new HttpError(404, 'PAGE_NOT_FOUND', 'Unknown page');
  const [home, academics, aima, ...specialisations] = await Promise.all([
    readHome(), readAcademics(), readAima(), ...scopes.slice(3).map(readSpecialisationPage),
  ]);
  const [facultyVisibility, recruiterVisibility, internshipVisibility, testimonialVisibility] = await Promise.all([
    readSliderVisibility('faculty'), readSliderVisibility('recruiters'), readSliderVisibility('internships'), readSliderVisibility('testimonials'),
  ]);
  const gallery = await readPublicGallery(scope);
  const shared = <T extends Item>(items: T[], oldPages: string[]) => items.filter(item => item.enabled !== false && (item.pages ?? oldPages).includes(scope));
  const sourced = <T extends Item>(items: T[], source: string, oldPages: string[]) => items.filter(item => item.enabled !== false && (item.pages ?? (oldPages.includes(source) ? [source] : [])).includes(scope));
  const internshipSources = [home.masters.internships.items, academics.masters.internships.items, aima.masters.internships.items, ...specialisations.map(page => page.internships.items)] as Item[][];
  const testimonials = await Promise.all(scopes.map(async source => Promise.all(['video', 'written'].map(kind => readTestimonialMaster(source, kind)))));
  const byKind = (kind: number) => testimonials.flatMap((entries, index) => {
    const data = entries[kind]!.content as { items: Item[] };
    return sourced(data.items, scopes[index]!, testimonialVisibility.pages);
  });
  return {
    gallery,
    faculty: shared(home.masters.faculty.items, facultyVisibility.pages),
    recruiters: shared(home.masters.recruiters.items, recruiterVisibility.pages),
    internships: internshipSources.flatMap((items, index) => sourced(items, scopes[index]!, internshipVisibility.pages)),
    video: byKind(0), written: byKind(1),
  };
}
