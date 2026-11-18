import type { Metadata } from 'next';
import { Button } from '@/components/ui/Button';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { AcademicClosingSections } from '@/components/sections/AcademicClosingSections';
import { FacultySection } from '@/components/sections/FacultySection';
import { IconList } from '@/components/sections/IconList';
import { MediaCarousel } from '@/components/sections/MediaCarousel';
import { PageHero } from '@/components/sections/PageHero';
import { WhyChoose } from '@/components/sections/WhyChoose';
import { academicsHero } from '@/content/academics';
import { APPLY_PATH, ENQUIRY_ANCHOR } from '@/content/site';
import { AboutProgram } from '@/features/academics/AboutProgram';
import { AcademicsTabs } from '@/features/academics/AcademicsTabs';
import { AtAGlance } from '@/features/academics/AtAGlance';
import { Curriculum } from '@/features/academics/Curriculum';
import blocks from '@/features/academics/AcademicsBlocks.module.css';
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
  const customSections = (academics.templateSections?.sections ?? []).map((section, index) => ({ section, index })).sort((a, b) => a.section.displayOrder - b.section.displayOrder || a.index - b.index);
  const sectionsAt = (position: number) => customSections.filter(({ section }) => Math.max(1, Math.min(12, section.displayOrder || 1)) === position).map(({ section, index }) => (
    <section key={`custom-${index}`} className={`${layout.block} ${section.sectionType === 'text' ? layout.customTextSection : ''}`}>
      {section.title && <SectionHeading title={section.title} />}
      <div className={blocks.prose}>
        <div className={section.sectionType === 'text' && section.imageUrl ? blocks.templateTextWithImage : undefined}><div className={blocks.templateRichText} dangerouslySetInnerHTML={{ __html: section.body }} />{section.sectionType === 'text' && section.imageUrl && <img className={blocks.templateTextImage} src={section.imageUrl} alt="" />}</div>
        {section.subsectionTitle && <h3>{section.subsectionTitle}</h3>}
        {section.items.length > 0 && <div className={section.items.length > 5 ? layout.customListViewport : undefined} role={section.items.length > 5 ? 'region' : undefined} aria-label={section.items.length > 5 ? `${section.title || 'Content'} list` : undefined} tabIndex={section.items.length > 5 ? 0 : undefined}><IconList items={section.items.slice().sort((a, b) => a.displayOrder - b.displayOrder)} divided className={layout.steps} /></div>}
      </div>
    </section>
  ));
  return (
    <div className={layout.page}>
      <PageHero
        size="inner"
        slideActions
        slides={masters.hero.items.filter(item => item.enabled !== false).map(item => ({ ...academicsHero, ...item }))}
        breadcrumb={academics.hero.breadcrumb}
        actions={
          <>
            <Button href={APPLY_PATH}>Apply Now</Button>
            <Button variant="arrow" href={ENQUIRY_ANCHOR}>
              Enquire now
            </Button>
          </>
        }
      />
      <AcademicsTabs tabs={academics.tabs.links.map(({ label, anchor }) => ({ label, id: anchor }))} />

      <div className={layout.layout}>
        <aside className={layout.sidebar} aria-label="Programme summary">
          <AtAGlance title={academics.glance.title} facts={academics.glance.facts} applyText={academics.glance.buttonText} applyHref={academics.glance.buttonHref} brochureText={academics.glance.brochureText} brochureHref={academics.glance.brochureHref} contactText={academics.glance.contactText} contactHref={academics.glance.contactHref} />
        </aside>

        <div className={layout.main}>
          {sectionsAt(1)}
          <div id="about-program" className={layout.block}>
            <AboutProgram about={academics.about} />
          </div>
          {sectionsAt(2)}
          <div id="program-videos" className={`${layout.block} ${layout.bleed}`}>
            <MediaCarousel id="program-videos-carousel" title={programVideos.title} items={programVideos.items} layout="video" variant="column" play />
          </div>
          {sectionsAt(3)}
          <div className={`${layout.block} ${layout.bleed} ${layout.why}`}>
            <WhyChoose id="why-vsm" image={academics.why.image} items={academics.why.items} variant="column" heading={{ ...academics.why, eyebrow: '', description: '' }} />
          </div>
          {sectionsAt(4)}
          <div id="gallery" className={`${layout.block} ${layout.bleed} ${layout.lifeBlock}`}>
            <MediaCarousel id="gallery-carousel" title={academics.gallery.title} items={(selected?.gallery ?? masters.gallery.items).filter((item) => item.enabled !== false)} layout="life" variant="column" galleryPopup galleryAlbums={eventGalleryAlbums} galleryFallbackSlug="infra" />
          </div>
          {sectionsAt(5)}
          <div id="events" className={`${layout.block} ${layout.bleed}`}>
            <MediaCarousel id="events-carousel" title={academics.events.title} items={masters.events.items.filter((item) => item.enabled !== false)} layout="events" variant="column" galleryPopup galleryAlbums={eventGalleryAlbums} />
          </div>
          {sectionsAt(6)}
          <div id="curriculum" className={`${layout.block} ${layout.beforeFacultyBlock}`}>
            <Curriculum content={academics.curriculum} />
          </div>
          {sectionsAt(7)}
          {(visibility.faculty || Boolean(selected?.faculty.length)) && <div className={`${layout.block} ${layout.bleed}`}>
            <FacultySection id="faculties" variant="column" heading={academics.faculty} items={selected?.faculty ?? common.masters.faculty.items.filter(item => item.enabled)} />
          </div>}
          {sectionsAt(8)}
          <div className={layout.block}>
            <Eligibility eligibility={academics.eligibility} />
          </div>
          {sectionsAt(9)}
          <div id="fees" className={layout.block}>
            <Fees fees={academics.fees} />
          </div>
          {sectionsAt(10)}
          <section id="admission-procedure" className={layout.block} aria-labelledby="admission-title">
            <SectionHeading id="admission-title" title={academics.admission.title} />
            <IconList items={academics.admission.steps} ordered divided className={layout.steps} />
          </section>
          {sectionsAt(11)}
          <section id="vsm-advantage" className={layout.block} aria-labelledby="advantage-title">
            <SectionHeading id="advantage-title" as="h3" size="h2" title={advantage.title} />
            <div className={layout.advantageListViewport}><IconList items={advantage.steps} divided className={layout.steps} /></div>
          </section>
          {sectionsAt(12)}
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
