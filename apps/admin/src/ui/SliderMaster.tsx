import { useEffect, useRef, useState, type FormEvent } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { facultyProfileHtml, homeDefaults, homeMasterDefaults, type HomeMasterKey } from '@vsmedu/contracts/home';
import { academicsDefaults, academicsMasterDefaults, type AcademicsMasterKey } from '@vsmedu/contracts/academics';
import { aimaDefaults, aimaMasterDefaults, aimaMasterLabels } from '@vsmedu/contracts/academics-aima';
import {
  academicsSpecialisationDefaults,
  academicsSpecialisationMasterDefaults,
  academicsSpecialisationIndex,
} from '@vsmedu/contracts/academics-specialisations';
import {
  facultyMasterDefaults,
  facultyMasterLabels,
  facultyPageDefaults,
  type FacultyMasterKey,
} from '@vsmedu/contracts/academics-faculty';
import { admissionsPages, type AdmissionsPageSlug } from '@vsmedu/contracts/admissions';
import { placementsPages, type PlacementsPageSlug } from '@vsmedu/contracts/placements';
import { eventsPages, type EventsPageSlug } from '@vsmedu/contracts/events';
import { api } from '../lib/api';
import { Field, blank, preview, type Value } from './ContentFields';
import { Icon } from './Icon';
import { HeroSlideFields } from './HeroSlideFields';
import { RichSubtitle } from './RichSubtitle';
import { ACADEMICS_PAGE_PATH, AIMA_PAGE_PATH, FACULTY_PAGE_PATH } from './cmsPaths';
import './master-status.css';

const SPEC_PAGES_BASE = '/our-academics/in-demand-specialisations/';
const GALLERY_PAGE_OPTIONS = [
  { slug: 'home', navTitle: 'Home' },
  { slug: 'aicte', navTitle: 'AICTE PGDM' },
  { slug: 'aima', navTitle: 'AIMA PGDM' },
  ...academicsSpecialisationIndex,
];
const ALBUM_PAGE_OPTIONS = [
  { slug: 'events-gallery', navTitle: 'Photo Gallery' },
  { slug: 'events-gallery-2', navTitle: 'Photo Gallery (Page 2)' },
];

type PlacementsMasterKey = 'hero' | 'recruiters' | 'records' | 'placements' | 'internships';
type EventsMasterKey = 'hero' | 'albums' | 'photos' | 'speakers' | 'videos';
export type SupportedMasterKey = HomeMasterKey | AcademicsMasterKey | FacultyMasterKey | PlacementsMasterKey | EventsMasterKey | 'gallery-items' | 'gallery-albums' | 'video-testimonials' | 'written-testimonials';
export type MasterScope = 'home' | 'academics' | 'aima' | 'spec' | 'faculty' | 'admissions' | 'placements' | 'events' | 'site' | 'gallery';
/** Page groups (Placements, Events, About Us, Career, Blogs) whose pages each define their own sections and masters. */
export type PageGroupMeta = {
  path: string;
  navTitle: string;
  sections: Record<string, unknown>;
  masters: Record<string, { items: unknown[] }>;
  masterLabels: Record<string, string>;
  masterSections: Record<string, string>;
};
const GROUP_ITEM_NOUNS: Partial<Record<string, string>> = {
  recruiters: 'Logo',
  records: 'Image',
  placements: 'Image',
  internships: 'Image',
  albums: 'Album',
  photos: 'Photo',
  speakers: 'Speaker',
  videos: 'Video',
};
type Item = Record<string, Value>;
type MasterDocument = { content: { items: Item[] }; updatedAt: string | null };
const homeTitles: Record<HomeMasterKey, string> = {
  hero: 'Home Slider',
  faculty: 'Faculty Slider',
  recruiters: 'Recruiter Logos',
  internships: 'Summer Internships',
  testimonials: 'Student Testimonials',
  events: 'Upcoming Events',
  life: 'Life at VSM',
};
const academicsTitles: Record<AcademicsMasterKey, string> = {
  hero: 'AICTE PGDM – Page Banner',
  'program-videos': 'AICTE PGDM – Program Videos',
  gallery: 'AICTE PGDM – Life @ VSM Gallery',
  events: 'AICTE PGDM – Upcoming Events',
  internships: 'Academic Pages - Summer Internships',
  testimonials: 'Academic Pages - Student Testimonials',
};
const WEB_BASE = import.meta.env.VITE_WEB_BASE_URL ?? 'http://localhost:3000';
const heading = (item: Item, index: number, masterKey: SupportedMasterKey) => {
  if (masterKey === 'events') {
    const asset = item.image && typeof item.image === 'object' && !Array.isArray(item.image) ? item.image : item;
    const alt = typeof (asset as { alt?: unknown }).alt === 'string' ? String((asset as { alt: string }).alt) : '';
    return alt.trim() || `Slide ${index + 1}`;
  }
  return String(item.title || item.name || item.caption || item.alt || `Slide ${index + 1}`);
};
function image(item: Item) {
  const asset = item.image && typeof item.image === 'object' && !Array.isArray(item.image) ? item.image : item;
  return typeof asset.src === 'string' ? asset.src : '';
}

type FacultyDetail = { label: string; value: string };

function facultyDetails(item: Item): FacultyDetail[] {
  return Array.isArray(item.details) ? (item.details as FacultyDetail[]) : [];
}

type FacultyImage = { src?: string; alt?: string; width?: number; height?: number };

function FacultyDetailsEditor({ item, readOnly, onChange, upload }: { item: Item; readOnly: boolean; onChange: (item: Item) => void; upload: (file: File) => Promise<{ src: string; alt: string; width: number; height: number }> }) {
  const update = (key: string, val: Value) => onChange({ ...item, [key]: val });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [imgError, setImgError] = useState('');
  const asset = (item.image && typeof item.image === 'object' && !Array.isArray(item.image) ? item.image : {}) as FacultyImage;
  const details = facultyDetails(item);
  async function replaceImage(file: File) {
    setImgError('');
    try {
      const img = await upload(file);
      update('image', { src: img.src, alt: img.alt, width: img.width, height: img.height } as Value);
    } catch (cause) { setImgError(cause instanceof Error ? cause.message : 'Image upload failed'); }
  }
  return <>
    <div className="cms-compact-image cms-faculty-image">
      {asset.src ? (
        <div className="cms-compact-image-wrap">
          <img className="cms-compact-image-thumb" src={preview(String(asset.src))} alt={String(asset.alt ?? '')} />
          <button
            type="button"
            className="cms-compact-image-replace"
            disabled={readOnly}
            onClick={() => fileInputRef.current?.click()}
            title="Replace image"
          >
            Replace
          </button>
          <input
            ref={fileInputRef}
            type="file"
            className="cms-visually-hidden"
            accept="image/png,image/jpeg,image/webp,image/avif,image/svg+xml"
            disabled={readOnly}
            onChange={e => { if (e.target.files?.[0]) void replaceImage(e.target.files[0]); } }
          />
        </div>
      ) : (
        <div className="cms-compact-image-empty">
          <button
            type="button"
            className="cms-compact-image-choose"
            disabled={readOnly}
            onClick={() => fileInputRef.current?.click()}
            title="Choose image"
          >
            Upload profile image
          </button>
          <input
            ref={fileInputRef}
            type="file"
            className="cms-visually-hidden"
            accept="image/png,image/jpeg,image/webp,image/avif,image/svg+xml"
            disabled={readOnly}
            onChange={e => { if (e.target.files?.[0]) void replaceImage(e.target.files[0]); } }
          />
        </div>
      )}
      {imgError && <small className="cms-compact-image-error" role="alert">{imgError}</small>}
      <small>PNG, JPG, WebP, AVIF, SVG · maximum 2 MB</small>
    </div>
    <label className="cms-field"><span>Name</span><input value={String(item.name ?? '')} disabled={readOnly} onChange={event => update('name', event.target.value)} /></label>
    <label className="cms-field"><span>Designation</span><input value={String(item.role ?? '')} disabled={readOnly} onChange={event => update('role', event.target.value)} /></label>
    <label className="cms-field"><span>Short designation</span><input value={String(item.shortRole ?? '')} disabled={readOnly} onChange={event => update('shortRole', event.target.value)} /></label>
    <div className="cms-field"><span>Profile details</span>
      <RichSubtitle value={typeof item.profileHtml === 'string' ? item.profileHtml : facultyProfileHtml(details)} disabled={readOnly} onChange={html => update('profileHtml', html)} />
    </div>
    <label className="cms-field cms-checkbox"><span>Show on website</span><input type="checkbox" disabled={readOnly} checked={item.enabled !== false} onChange={event => update('enabled', event.target.checked)} /></label>
  </>;
}

export function SliderMaster({
  master,
  canEdit,
  scope: routeScope = 'home',
  specSlug: routeSpecSlug,
  admissionsPage,
  placementsPage,
  eventsPage,
  sitePage,
}: {
  master: SupportedMasterKey;
  canEdit: boolean;
  scope?: MasterScope;
  /** Required when `scope` is `spec` (in-demand specialisation landing page). */
  specSlug?: string;
  /** Required when `scope` is `admissions`. */
  admissionsPage?: AdmissionsPageSlug;
  /** Required when `scope` is `placements`. */
  placementsPage?: PlacementsPageSlug;
  /** Required when `scope` is `events`. */
  eventsPage?: EventsPageSlug;
  /** Required when `scope` is `site` (About Us, Career, Blogs pages). */
  sitePage?: { label: string; api: string; meta: PageGroupMeta };
}) {
  const navigate = useNavigate();
  const location = useLocation();
  const centralMaster = routeScope === 'home' && (master === 'internships' || master === 'testimonials');
  const pageParam = new URLSearchParams(location.search).get('page') ?? 'home';
  const validPage = ['home', 'aicte', 'aima', ...academicsSpecialisationIndex.map(item => item.slug)].includes(pageParam) ? pageParam : 'home';
  const scope: MasterScope = centralMaster ? validPage === 'aicte' ? 'academics' : validPage === 'aima' ? 'aima' : validPage === 'home' ? 'home' : 'spec' : routeScope;
  const specSlug = centralMaster && scope === 'spec' ? validPage : routeSpecSlug;
  const { slidePos: slidePosParam } = useParams<{ slidePos?: string }>();
  /** Listing URL: strip /:n/edit then /new suffix from current path */
  const listPath = location.pathname.replace(/\/\d+\/edit$/, '').replace(/\/new$/, '');
  const isFormRoute = location.pathname === `${listPath}/new` || Boolean(slidePosParam && location.pathname === `${listPath}/${slidePosParam}/edit`);
  const isAddRoute = location.pathname === `${listPath}/new`;
  const isEditRoute = Boolean(slidePosParam && location.pathname === `${listPath}/${slidePosParam}/edit`);

  const isAcademics = scope === 'academics';
  const isAima = scope === 'aima';
  const isSpec = scope === 'spec';
  const testimonialKind = master === 'testimonials' ? (new URLSearchParams(location.search).get('tab') === 'written' ? 'written' : 'video') : master === 'video-testimonials' ? 'video' : master === 'written-testimonials' ? 'written' : null;
  const currentQuery = new URLSearchParams();
  if (centralMaster && validPage !== 'home') currentQuery.set('page', validPage);
  if (master === 'testimonials') currentQuery.set('tab', testimonialKind ?? 'video');
  const testimonialQuery = currentQuery.size ? `?${currentQuery}` : '';
  const specMeta =
    isSpec && specSlug ? academicsSpecialisationIndex.find((p) => p.slug === specSlug) : undefined;
  const isFaculty = scope === 'faculty';
  const admissionsMeta = scope === 'admissions' && admissionsPage ? admissionsPages[admissionsPage] : undefined;
  const isAdmissions = Boolean(admissionsMeta);
  const pageGroup =
    scope === 'placements' && placementsPage
      ? { label: 'Placements', api: `/admin/placements/${placementsPage}`, meta: placementsPages[placementsPage] as unknown as PageGroupMeta }
      : scope === 'events' && eventsPage
        ? { label: 'Events', api: `/admin/events/${eventsPage}`, meta: eventsPages[eventsPage] as unknown as PageGroupMeta }
        : scope === 'site'
          ? sitePage
          : undefined;
  const groupMeta = pageGroup?.meta;
  const groupSection = groupMeta?.masterSections[master];
  const anyAcademics = isAcademics || isAima || isSpec || isFaculty || isAdmissions || Boolean(groupMeta);
  const isFacultyProfiles = isFaculty && master === 'profiles';
  const itemNoun = routeScope === 'gallery' ? master === 'gallery-albums' ? 'Album' : 'Gallery image' : isFacultyProfiles ? 'Profile' : master === 'testimonials' || testimonialKind ? 'Testimonial' : (groupMeta && GROUP_ITEM_NOUNS[master]) || 'Slide';
  const livePageUrl = (() => {
    if (groupMeta) return groupMeta.path;
    if (isSpec && specSlug) return `${SPEC_PAGES_BASE}${specSlug}/`;
    if (isAima) return AIMA_PAGE_PATH;
    if (isAcademics) return ACADEMICS_PAGE_PATH;
    if (isFaculty) return FACULTY_PAGE_PATH;
    if (admissionsMeta) return admissionsMeta.path;
    return '/';
  })();
  const livePageAnchor = master === 'hero' ? 'banner' : isFacultyProfiles ? 'our-faculty' : master;

  const saveContextHint = isAcademics
    ? 'AICTE PGDM page CMS'
    : isAima
      ? 'AIMA PGDM page CMS'
      : isSpec
        ? `${specMeta?.navTitle ?? 'specialisation'} page CMS`
        : isFaculty
          ? 'Faculty page CMS'
          : admissionsMeta
            ? `Admissions ${admissionsMeta.navTitle} page CMS`
            : pageGroup
              ? `${pageGroup.label === pageGroup.meta.navTitle ? pageGroup.label : `${pageGroup.label} ${pageGroup.meta.navTitle}`} page CMS`
              : 'homepage';

  const title = (() => {
    if (routeScope === 'gallery') return master === 'gallery-albums' ? 'Gallery Albums' : 'Life @ VSM Gallery';
    if (testimonialKind) return master === 'testimonials' ? 'Student Testimonials' : testimonialKind === 'video' ? 'Video Testimonials' : 'Written Testimonials';
    if (groupMeta) return `${groupMeta.navTitle} – ${groupMeta.masterLabels[master] ?? master}`;
    if (admissionsMeta) return `${admissionsMeta.navTitle} – Page Banner`;
    if (isFaculty) return facultyMasterLabels[master as FacultyMasterKey];
    if (isSpec && specMeta && master === 'hero') return `${specMeta.navTitle} – Page Banner`;
    if (isSpec && specMeta && master === 'internships') return `${specMeta.navTitle} – Summer Internships`;
    if (isAima) return aimaMasterLabels[master as keyof typeof aimaMasterLabels];
    if (isAcademics) return academicsTitles[master as AcademicsMasterKey];
    return homeTitles[master as HomeMasterKey];
  })();

  const masterPath = (() => {
    if (routeScope === 'gallery') return `/admin/gallery/${master === 'gallery-albums' ? 'albums' : 'life'}`;
    if (testimonialKind) return `/admin/testimonials/${isSpec ? encodeURIComponent(specSlug ?? '') : isAcademics ? 'aicte' : isAima ? 'aima' : 'home'}/${testimonialKind}`;
    if (admissionsMeta) return `/admin/admissions/${admissionsPage}/master-${master}`;
    if (pageGroup) return `${pageGroup.api}/master-${master}`;
    if (scope === 'home') return `/admin/home/master-${master}`;
    if (isAcademics) return `/admin/academics/master-${master}`;
    if (isAima) return `/admin/academics/aima/master-${master}`;
    if (isFaculty) return `/admin/academics/teaching-faculty/master-${master}`;
    if (isSpec && specSlug)
      return `/admin/academics/specialisations/page/${encodeURIComponent(specSlug)}/master-${master}`;
    return `/admin/home/master-${master}`;
  })();

  const staticPath = (() => {
    if (admissionsMeta) return `/admin/admissions/${admissionsPage}/${master}`;
    if (pageGroup) return `${pageGroup.api}/${groupSection ?? master}`;
    if (scope === 'home') return `/admin/home/${master}`;
    if (isAcademics) return `/admin/academics/${master}`;
    if (isAima) return `/admin/academics/aima/${master}`;
    if (isFaculty) return '/admin/academics/teaching-faculty/intro';
    if (isSpec && specSlug)
      return `/admin/academics/specialisations/page/${encodeURIComponent(specSlug)}/${master}`;
    return `/admin/home/${master}`;
  })();
  /** Home hero has no static block; AICTE page banner matches that (breadcrumbs live on Page Sections). */
  const hasStatic = routeScope === 'gallery' ? false : groupMeta
    ? Boolean(groupSection)
    : isFaculty
      ? isFacultyProfiles
      : (master === 'testimonials' || !testimonialKind) && master !== 'hero' && master !== 'faculty';
  const [document, setDocument] = useState<MasterDocument | null>(null);
  const [staticDocument, setStaticDocument] = useState<{ content: Value; updatedAt: string | null } | null>(null);
  const [staticDirty, setStaticDirty] = useState(false);
  const visibilityMaster = ['faculty', 'recruiters', 'internships', 'testimonials'].includes(master) && (routeScope === 'home' || isAcademics || isAima || isSpec) ? master : null;
  const [visibility, setVisibility] = useState<{ pages: string[]; updatedAt: string | null } | null>(null);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const [uploads, setUploads] = useState(0);
  const [query, setQuery] = useState('');
  const [size, setSize] = useState(10);
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState<{ key: 'order' | 'heading' | 'status'; direction: 1 | -1 }>({ key: 'order', direction: 1 });
  const [editing, setEditing] = useState<{ index: number | null; item: Item; position: number } | null>(null);
  const [deleting, setDeleting] = useState<number | null>(null);
  const deleteRef = useRef<HTMLDialogElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const template = (() => {
    if (routeScope === 'gallery') return (master === 'gallery-albums' ? eventsPages.gallery.masters.albums.items[0] : homeMasterDefaults.life.items[0]) as unknown as Item;
    if (testimonialKind) return homeMasterDefaults.testimonials.items[0] as unknown as Item;
    if (admissionsMeta) return admissionsMeta.masters.hero.items[0] as unknown as Item;
    if (groupMeta) return (groupMeta.masters[master] ?? groupMeta.masters.hero).items[0] as Item;
    if (isFaculty) return facultyMasterDefaults[master as FacultyMasterKey].items[0] as unknown as Item;
    if (isSpec && specSlug && master in academicsSpecialisationMasterDefaults[specSlug as keyof typeof academicsSpecialisationMasterDefaults]) {
      return academicsSpecialisationMasterDefaults[specSlug as keyof typeof academicsSpecialisationMasterDefaults][master as keyof (typeof academicsSpecialisationMasterDefaults)[string]].items[0] as unknown as Item;
    }
    if (isAima && master in aimaMasterDefaults) return aimaMasterDefaults[master as keyof typeof aimaMasterDefaults].items[0] as unknown as Item;
    if (isAcademics) return academicsMasterDefaults[master as AcademicsMasterKey].items[0] as unknown as Item;
    return homeMasterDefaults[master as HomeMasterKey].items[0] as unknown as Item;
  })();

  const staticTemplate = (() => {
    if (routeScope === 'gallery') return {} as Value;
    if (groupMeta) return (groupSection ? groupMeta.sections[groupSection] : {}) as Value;
    if (isFaculty) return facultyPageDefaults.intro as unknown as Value;
    if (isSpec && specSlug && master in academicsSpecialisationDefaults[specSlug as keyof typeof academicsSpecialisationDefaults]) {
      return academicsSpecialisationDefaults[specSlug as keyof typeof academicsSpecialisationDefaults][master as keyof (typeof academicsSpecialisationDefaults)[string]] as unknown as Value;
    }
    if (isAima && master in aimaMasterDefaults) {
      if (master === 'internships' || master === 'testimonials') return aimaDefaults[master] as unknown as Value;
      return aimaMasterDefaults[master as keyof typeof aimaMasterDefaults] as unknown as Value;
    }
    if (isAcademics) return academicsDefaults[master as AcademicsMasterKey] as unknown as Value;
    return homeDefaults[master as keyof typeof homeDefaults] as unknown as Value;
  })();
  const items = document?.content.items ?? [];
  const readOnly = !canEdit || busy || uploads > 0;

  async function load() {
    setError('');
    try { setDocument((await api<{ data: MasterDocument }>(masterPath)).data); }
    catch (cause) { setError(cause instanceof Error ? cause.message : 'Could not load slides'); }
    if (hasStatic) {
      try {
        const staticResult = await api<{ data: { content: Value; updatedAt: string | null } }>(staticPath);
        setStaticDocument(staticResult.data);
        setStaticDirty(false);
      } catch {
        // Static content may not exist yet; that's OK
      }
    }
  }
  useEffect(() => {
    setDocument(null);
    setStaticDocument(null);
    void load();
  }, [masterPath, staticPath]);
  useEffect(() => {
    if (!visibilityMaster) return;
    api<{ data: { pages: string[]; updatedAt: string | null } }>(`/admin/slider-visibility/${visibilityMaster}`)
      .then(result => setVisibility(result.data))
      .catch(cause => setError(cause instanceof Error ? cause.message : 'Could not load page visibility'));
  }, [visibilityMaster]);
  useEffect(() => {
    if (deleting !== null && !deleteRef.current?.open) deleteRef.current?.showModal();
    else if (deleting === null) deleteRef.current?.close();
  }, [deleting]);
  useEffect(() => { if (isFormRoute) headingRef.current?.focus(); }, [isFormRoute, isAddRoute, slidePosParam]);

  const addFormSeeded = useRef(false);
  const lastEditKey = useRef<string>('');
  useEffect(() => {
    if (!isFormRoute) {
      setEditing(null);
      addFormSeeded.current = false;
      lastEditKey.current = '';
      return;
    }
    if (!document) return;
    const slideItems = document.content.items;
    if (isAddRoute) {
      if (!addFormSeeded.current) {
        addFormSeeded.current = true;
        setEditing({
          index: null,
          item: {
            ...blank(template) as Item,
            ...(routeScope === 'gallery' ? { pages: master === 'gallery-albums' ? ['events-gallery'] : ['home'] } : {}),
            ...(master === 'hero' ? { imagePosition: String(template.imagePosition ?? ''), mobileImagePosition: String(template.mobileImagePosition ?? '') } : {}),
            ...((isAdmissions || scope === 'site') && master === 'hero' ? { image: structuredClone(template.image) } : {}),
          },
          position: slideItems.length + 1,
        });
      }
      return;
    }
    if (isEditRoute && slidePosParam) {
      const editKey = `${slidePosParam}|${document.updatedAt ?? ''}`;
      const pos = Number(slidePosParam);
      if (!Number.isFinite(pos) || pos < 1) {
        navigate(`${listPath}${testimonialQuery}`, { replace: true });
        return;
      }
      const index = pos - 1;
      if (index >= 0 && index < slideItems.length) {
        if (lastEditKey.current !== editKey) {
          lastEditKey.current = editKey;
          setEditing({ index, item: structuredClone(slideItems[index]), position: pos });
        }
      } else {
        navigate(`${listPath}${testimonialQuery}`, { replace: true });
      }
    }
  }, [isFormRoute, isAddRoute, isEditRoute, slidePosParam, document, listPath, master, navigate, template]);

  useEffect(() => {
    if (!isFormRoute) return;
    const warn = (event: BeforeUnloadEvent) => event.preventDefault();
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [isFormRoute]);

  async function persist(next: Item[]) {
    if (!document) return false;
    setBusy(true); setError(''); setMessage('');
    try {
      const result = await api<{ data: MasterDocument }>(masterPath, { method: 'PATCH', body: JSON.stringify({ content: { items: next }, updatedAt: document.updatedAt }) });
      setDocument(result.data);
      setMessage(routeScope === 'gallery' ? 'Saved. Gallery changes are live on the selected pages.' : anyAcademics ? `Saved to the ${saveContextHint}.` : 'Saved. Changes are live on the homepage.');
      return true;
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'Could not save slides'); return false; }
    finally { setBusy(false); }
  }
  async function toggleActive(index: number) {
    if (!document || !canEdit || busy) return;
    const current = items[index];
    if (!current) return;
    // Legacy internship records may not have an enabled flag. Treat them as
    // active until explicitly disabled so the CMS and public pages agree.
    const wasActive = current.enabled !== false;
    const next = items.map((item, itemIndex) => itemIndex === index ? { ...item, enabled: !wasActive } : item);
    // Update the row immediately, then let the shared master save path persist it.
    setDocument({ ...document, content: { ...document.content, items: next } });
    if (!await persist(next)) setDocument(document);
  }
  async function persistStatic(next: Value) {
    if (!staticDocument) return false;
    setBusy(true); setError(''); setMessage('');
    try {
      const result = await api<{ data: { content: Value; updatedAt: string | null } }>(staticPath, { method: 'PATCH', body: JSON.stringify({ content: next, updatedAt: staticDocument.updatedAt }) });
      setStaticDocument(result.data);
      setStaticDirty(false);
      setMessage(anyAcademics ? `Section settings saved to the ${saveContextHint}.` : 'Section settings saved. Changes are live on the homepage.');
      return true;
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'Could not save section settings'); return false; }
    finally { setBusy(false); }
  }
  async function save(event: FormEvent) {
    event.preventDefault();
    if (!editing || !document) return;
    const pageManaged = routeScope === 'gallery' || (['faculty', 'recruiters', 'internships', 'testimonials'].includes(master) && (routeScope === 'home' || isAcademics || isAima || isSpec));
    const selectedPages = Array.isArray(editing.item.pages) ? editing.item.pages : editing.index === null ? [] : master === 'faculty' || master === 'recruiters' ? visibility?.pages ?? [] : [isAcademics ? 'aicte' : isAima ? 'aima' : isSpec ? specSlug ?? '' : 'home'];
    if (pageManaged && selectedPages.length === 0 && master !== 'faculty') { setError('Select at least one page for this item.'); return; }
    const next = items.filter((_, index) => index !== editing.index);
    next.splice(Math.max(0, Math.min(next.length, editing.position - 1)), 0, pageManaged ? { ...editing.item, pages: selectedPages } : editing.item);
    if (await persist(next)) navigate(`${listPath}${testimonialQuery}`);
  }
  async function remove() {
    if (deleting === null) return;
    const deletedIndex = deleting;
    const ok = await persist(items.filter((_, index) => index !== deleting));
    if (ok) {
      setDeleting(null);
      if (isEditRoute && slidePosParam && Number(slidePosParam) === deletedIndex + 1) navigate(`${listPath}${testimonialQuery}`, { replace: true });
    }
  }
  async function upload(file: File) {
    if (file.type.startsWith('video/')) {
      if (file.size > 100 * 1024 * 1024) throw new Error('Video must be less than 100 MB');
      setUploads(count => count + 1);
      try { return (await api<{ data: { src: string } }>('/admin/academics/video-media', { method: 'POST', body: file, headers: { 'Content-Type': file.type, 'X-File-Name': encodeURIComponent(file.name) } })).data as { src: string; alt: string; width: number; height: number }; }
      finally { setUploads(count => count - 1); }
    }
    if (file.size > 2 * 1024 * 1024) throw new Error('Image must be less than 2 MB');
    setUploads(count => count + 1);
    try { return (await api<{ data: { src: string; alt: string; width: number; height: number } }>('/admin/home-media', { method: 'POST', body: file, headers: { 'Content-Type': file.type, 'X-File-Name': encodeURIComponent(file.name) } })).data; }
    finally { setUploads(count => count - 1); }
  }
  function changeSort(key: typeof sort.key) { setSort({ key, direction: sort.key === key && sort.direction === 1 ? -1 : 1 }); setPage(1); }
  const filtered = items.map((item, index) => ({ item, index })).filter(({ item, index }) => `${heading(item, index, master)} ${item.subtitle ?? ''} ${item.role ?? ''} ${(item.enabled !== false) ? 'active' : 'inactive'}`.toLowerCase().includes(query.toLowerCase())).sort((a, b) => {
    const comparison = sort.key === 'order' ? a.index - b.index : sort.key === 'status' ? Number(b.item.enabled !== false) - Number(a.item.enabled !== false) : heading(a.item, a.index, master).trim().localeCompare(heading(b.item, b.index, master).trim(), undefined, { numeric: true, sensitivity: 'base' });
    return comparison * sort.direction || a.index - b.index;
  });
  const pages = Math.max(1, Math.ceil(filtered.length / size));
  const currentPage = Math.min(page, pages);
  const rows = filtered.slice((currentPage - 1) * size, currentPage * size);
  const sortLabel = (key: typeof sort.key) => sort.key === key ? sort.direction === 1 ? 'ascending' : 'descending' : 'none';
  const sortIcon = (key: typeof sort.key) => sort.key === key ? sort.direction === 1 ? '↑' : '↓' : '↕';
  const formHeading = isAddRoute
    ? `Add ${itemNoun}`
    : editing && isEditRoute && slidePosParam
      ? `Edit ${itemNoun}: ${heading(editing.item, Number(slidePosParam) - 1, master)}`
      : title;

  return <div className="cms-editor cms-master">
    <header className="cms-master-heading" data-tour="master-heading">
      <div>
        {isAcademics && !isFormRoute && master !== 'hero' && (
          <nav className="cms-breadcrumbs" aria-label="Breadcrumb">
            <span>Website Pages</span>
            <span className="cms-breadcrumb-sep">/</span>
            <span>Our Academics</span>
            <span className="cms-breadcrumb-sep">/</span>
            <span className="cms-breadcrumb-current">AICTE PGDM</span>
          </nav>
        )}
        {isAima && !isFormRoute && master !== 'hero' && (
          <nav className="cms-breadcrumbs" aria-label="Breadcrumb">
            <span>Website Pages</span>
            <span className="cms-breadcrumb-sep">/</span>
            <span>Our Academics</span>
            <span className="cms-breadcrumb-sep">/</span>
            <span className="cms-breadcrumb-current">AIMA PGDM</span>
          </nav>
        )}
        {isFaculty && (
          <nav className="cms-breadcrumbs" aria-label="Breadcrumb">
            <span>Website Pages</span>
            <span className="cms-breadcrumb-sep">/</span>
            <span>Our Academics</span>
            <span className="cms-breadcrumb-sep">/</span>
            <span>Faculty</span>
            <span className="cms-breadcrumb-sep">/</span>
            <span className="cms-breadcrumb-current">{master === 'hero' ? 'Page Banner' : 'Faculty Profiles'}</span>
          </nav>
        )}
        {groupMeta && (
          <nav className="cms-breadcrumbs" aria-label="Breadcrumb">
            <span>Website Pages</span>
            <span className="cms-breadcrumb-sep">/</span>
            <span>{pageGroup?.label}</span>
            <span className="cms-breadcrumb-sep">/</span>
            <span>{groupMeta.navTitle}</span>
            <span className="cms-breadcrumb-sep">/</span>
            <span className="cms-breadcrumb-current">{groupMeta.masterLabels[master] ?? master}</span>
          </nav>
        )}
        {admissionsMeta && (
          <nav className="cms-breadcrumbs" aria-label="Breadcrumb">
            <span>Website Pages</span>
            <span className="cms-breadcrumb-sep">/</span>
            <span>Admissions</span>
            <span className="cms-breadcrumb-sep">/</span>
            <span>{admissionsMeta.navTitle}</span>
            <span className="cms-breadcrumb-sep">/</span>
            <span className="cms-breadcrumb-current">Page Banner</span>
          </nav>
        )}
        {isSpec && specMeta && (
          <nav className="cms-breadcrumbs" aria-label="Breadcrumb">
            <span>Website Pages</span>
            <span className="cms-breadcrumb-sep">/</span>
            <span>Our Academics</span>
            <span className="cms-breadcrumb-sep">/</span>
            <span>{specMeta.navTitle}</span>
            <span className="cms-breadcrumb-sep">/</span>
            <span className="cms-breadcrumb-current">Page Banner</span>
          </nav>
        )}
        <h1 ref={headingRef} tabIndex={-1}>{isFormRoute ? formHeading : title}</h1>
        {isFormRoute && master === 'hero' && <p className="page-description">Update slide content, calls-to-action and background image.</p>}
        {!isFormRoute && anyAcademics && (
          <p className="page-description">
            Manage the {master === 'hero' ? 'page banner' : isFacultyProfiles ? 'faculty profile cards' : groupMeta ? title.replace(/^[^–]+–\s*/, '').toLowerCase() : `${title.replace(/^[^–]+–\s*/, '')} carousel`} on{' '}
            <a href={`${WEB_BASE}${livePageUrl}#${livePageAnchor}`} target="_blank" rel="noopener noreferrer">
              {livePageUrl}#{livePageAnchor} ↗
            </a>
          </p>
        )}
      </div>
      {isFormRoute ? (
        <button type="button" className="cms-secondary" disabled={busy || uploads > 0} onClick={() => { navigate(`${listPath}${testimonialQuery}`); setError(''); }}>← Back to {title}</button>
      ) : (
        <button type="button" data-tour="master-add" className="cms-primary" disabled={!canEdit || !document || items.length >= 100} onClick={() => { navigate(`${listPath}/new${testimonialQuery}`); setMessage(''); setError(''); }}><span aria-hidden="true">＋</span> Add {itemNoun}</button>
      )}
    </header>
    {error && <div className="cms-error" role="alert">{error} {!isFormRoute && <button type="button" onClick={() => void load()}>Reload</button>}</div>}
    <p className="cms-master-message" role="status">{message}</p>
    {centralMaster && !isFormRoute && <label className="cms-field" style={{ marginBottom: 24 }}><span>Manage content for page</span><select value={validPage} disabled={readOnly} onChange={event => { const params = new URLSearchParams(currentQuery); if (event.target.value === 'home') params.delete('page'); else params.set('page', event.target.value); setPage(1); setMessage(''); setError(''); navigate(`${listPath}${params.size ? `?${params}` : ''}`); }}>{[{ slug: 'home', navTitle: 'Home' }, { slug: 'aicte', navTitle: 'AICTE PGDM' }, { slug: 'aima', navTitle: 'AIMA PGDM' }, ...academicsSpecialisationIndex].map(item => <option key={item.slug} value={item.slug}>{item.navTitle}</option>)}</select></label>}
    {hasStatic && staticDocument && !isFormRoute && (
      <section className="cms-section-card cms-master-section-settings" data-tour="master-section-settings" style={{ marginBottom: 24 }}>
        <div className="cms-section-card-header">
          <div className="cms-section-card-title-group">
            <div>
              <h2 className="cms-section-card-heading">Section Settings</h2>
              <p className="cms-section-card-subheading">
                {isFacultyProfiles
                  ? 'Edit the “Meet Our Faculty” heading block shown above the faculty cards.'
                  : groupMeta
                  ? `Edit the heading shown above these items on ${groupMeta.path}. Also editable in Page Sections.`
                  : anyAcademics
                  ? 'Edit the section heading shown above this carousel on the academic page.'
                  : 'Edit static section content (title, eyebrow, etc.) displayed on the homepage.'}
              </p>
            </div>
          </div>
        </div>
        <div className="cms-section-card-body cms-master-section-settings-fields">
          <Field
            name={title}
            value={staticDocument.content}
            template={staticTemplate}
            readOnly={!canEdit || busy}
            onUpload={() => { throw new Error('Image uploads not supported for static content.'); }}
            onChange={(content) => {
              setStaticDocument({ ...staticDocument, content: content as Value });
              setStaticDirty(true);
              setMessage('');
            }}
          />
        </div>
        <div className="cms-master-section-settings-footer cms-save-bar">
          {staticDirty && (
            <button type="button" className="cms-secondary" disabled={busy} onClick={() => { void load(); setStaticDirty(false); }}>
              Discard changes
            </button>
          )}
          <button
            type="button"
            className="cms-primary"
            disabled={!canEdit || !staticDirty || busy}
            onClick={() => { if (staticDocument) { void persistStatic(staticDocument.content); setStaticDirty(false); } }}
          >
            {busy ? 'Saving…' : '✓ Update Section Settings'}
          </button>
        </div>
      </section>
    )}
    {master === 'testimonials' && !isFormRoute && <div className="cms-testimonial-tabs" role="tablist" aria-label="Testimonial type">{(['video', 'written'] as const).map(kind => <button key={kind} type="button" role="tab" aria-selected={testimonialKind === kind} className={testimonialKind === kind ? 'cms-primary' : 'cms-secondary'} onClick={() => { setDocument(null); setError(''); setMessage(''); setPage(1); const params = new URLSearchParams(currentQuery); params.set('tab', kind); navigate(`${listPath}?${params}`); }}>{kind === 'video' ? 'Video Testimonials' : 'Written Testimonials'}</button>)}</div>}
    {isFormRoute && editing ? <form className={`cms-slide-editor ${master === 'hero' ? 'cms-hero-editor' : ''}`} data-tour="master-form" onSubmit={save}>
      {((routeScope === 'gallery' && (master === 'gallery-items' || master === 'gallery-albums')) || (['faculty', 'recruiters', 'internships', 'testimonials'].includes(master) && (routeScope === 'home' || isAcademics || isAima || isSpec))) && <fieldset className="cms-field"><legend>Show this item on</legend>{(routeScope === 'gallery' ? master === 'gallery-albums' ? ALBUM_PAGE_OPTIONS : GALLERY_PAGE_OPTIONS : GALLERY_PAGE_OPTIONS).map(page => { const selected = Array.isArray(editing.item.pages) ? editing.item.pages as string[] : editing.index === null ? [] : master === 'faculty' || master === 'recruiters' ? visibility?.pages ?? [] : [isAcademics ? 'aicte' : isAima ? 'aima' : isSpec ? specSlug ?? '' : 'home']; return <label key={page.slug} style={{ display: 'block', marginTop: 8 }}><input type="checkbox" checked={selected.includes(page.slug)} disabled={readOnly} onChange={event => setEditing({ ...editing, item: { ...editing.item, pages: event.target.checked ? [...selected, page.slug] : selected.filter(value => value !== page.slug) } })} /> {page.navTitle}</label>; })}</fieldset>}
      {master === 'hero' ? <HeroSlideFields value={editing.item} onChange={item => setEditing({ ...editing, item })} disabled={readOnly} upload={upload} position={editing.position} maxPosition={items.length + (editing.index === null ? 1 : 0)} onPositionChange={position => setEditing({ ...editing, position })} /> : master === 'faculty' ? <>
        <label className="cms-field cms-slide-order"><span>Display order</span><input type="number" required min={1} max={items.length + (editing.index === null ? 1 : 0)} value={editing.position} disabled={readOnly} onChange={event => setEditing({ ...editing, position: Number(event.target.value) })} /></label>
        <FacultyDetailsEditor item={editing.item} readOnly={readOnly} onChange={item => setEditing({ ...editing, item })} upload={upload} />
      </> : <>
        <label className="cms-field cms-slide-order"><span>Display order</span><input type="number" required min={1} max={items.length + (editing.index === null ? 1 : 0)} value={editing.position} disabled={readOnly} onChange={event => setEditing({ ...editing, position: Number(event.target.value) })} /></label>
        <Field name={`${itemNoun} details`} value={Object.fromEntries(Object.entries(editing.item).filter(([key]) => key !== 'pages' && (!testimonialKind || (testimonialKind === 'video' ? ['batch', 'videoLink', 'image', 'enabled'] : ['name', 'batch', 'quote', 'avatar', 'enabled']).includes(key)))) as Item} template={template} onChange={item => setEditing({ ...editing, item: { ...editing.item, ...(item as Item) } })} readOnly={readOnly} onUpload={upload} />
      </>}
      <div className="cms-save-bar"><button type="button" className="cms-secondary" disabled={busy || uploads > 0} onClick={() => { navigate(`${listPath}${testimonialQuery}`); setError(''); }}>Cancel</button><button data-tour="master-save" className="cms-primary" type="submit" disabled={!canEdit || busy || uploads > 0}>{busy ? 'Saving…' : master === 'hero' ? `${editing.index === null ? 'Create' : '✓ Update'} ${anyAcademics ? 'Banner' : 'Home'} Slide` : itemNoun !== 'Slide' ? `${editing.index === null ? 'Create' : '✓ Update'} ${itemNoun}` : 'Save slide'}</button></div>
    </form> : !isFormRoute ? <>
      <div className="cms-table-toolbar" data-tour="master-table-toolbar"><label>Show <select aria-label="Entries per page" value={size} onChange={event => { setSize(Number(event.target.value)); setPage(1); }}>{[10, 25, 50, 100].map(number => <option key={number}>{number}</option>)}</select> entries</label><label>Search: <input type="search" aria-label="Search slides" value={query} onChange={event => { setQuery(event.target.value); setPage(1); }} /></label></div>
      <div className="cms-table-card" data-tour="master-table"><div className="cms-table-overflow"><table className="cms-slides-table"><thead><tr>
        <th scope="col" aria-sort={sortLabel('order')}><button type="button" onClick={() => changeSort('order')}># <span className={sort.key === 'order' ? 'is-sorted' : undefined}>{sortIcon('order')}</span></button></th>
        <th scope="col">{`${itemNoun} image`}</th>
        <th scope="col" aria-sort={sortLabel('heading')}><button type="button" onClick={() => changeSort('heading')}>Heading <span className={sort.key === 'heading' ? 'is-sorted' : undefined}>{sortIcon('heading')}</span></button></th>
        <th scope="col" aria-sort={sortLabel('status')}><button type="button" onClick={() => changeSort('status')}>Status <span className={sort.key === 'status' ? 'is-sorted' : undefined}>{sortIcon('status')}</span></button></th>
        <th scope="col">Action</th>
      </tr></thead><tbody>
        {!document ? <tr><td colSpan={5}>{error ? 'Slides could not be loaded.' : 'Loading slides…'}</td></tr> : rows.length === 0 ? <tr><td colSpan={5}>No {itemNoun.toLowerCase()}s found.</td></tr> : rows.map(({ item, index }) => <tr key={index}>
          <td>{index + 1}</td><td>{image(item) ? <img className="cms-slide-thumbnail" src={preview(image(item))} alt={String(item.alt || item.name || item.title || 'Slide preview')} /> : <span className="cms-no-image">No image</span>}</td>
          <td><strong>{heading(item, index, master)}</strong>{(item.subtitle || item.role || item.batch) && <p>{String(item.subtitle || item.role || item.batch)}</p>}</td>
          <td><button type="button" className={`cms-status ${item.enabled !== false ? 'is-active' : 'is-inactive'}`} aria-pressed={item.enabled !== false} aria-label={`${item.enabled !== false ? 'Deactivate' : 'Activate'} ${itemNoun.toLowerCase()} ${index + 1}`} title={`Click to ${item.enabled !== false ? 'deactivate' : 'activate'}`} disabled={!canEdit || busy} onClick={() => void toggleActive(index)}><span aria-hidden="true" />{item.enabled !== false ? 'Active' : 'Inactive'}</button></td>
          <td><div className="cms-row-actions"><button type="button" className="cms-edit-action" disabled={!canEdit || busy} aria-label={`Edit ${itemNoun.toLowerCase()} ${index + 1}`} title={`Edit ${itemNoun.toLowerCase()}`} onClick={() => { navigate(`${listPath}/${index + 1}/edit${testimonialQuery}`); setError(''); setMessage(''); }}><Icon name="edit" size={18} /></button><button type="button" className="cms-delete-action" disabled={!canEdit || busy} aria-label={`Delete ${itemNoun.toLowerCase()} ${index + 1}`} title={`Delete ${itemNoun.toLowerCase()}`} onClick={() => setDeleting(index)}><Icon name="trash" size={18} /></button></div></td>
        </tr>)}
      </tbody></table></div>
      <footer className="cms-table-footer"><span>Showing {filtered.length ? (currentPage - 1) * size + 1 : 0} to {Math.min(currentPage * size, filtered.length)} of {filtered.length} entries{query && ` (filtered from ${items.length} total entries)`}</span><nav aria-label="Slide pagination"><button type="button" disabled={currentPage === 1} onClick={() => setPage(currentPage - 1)}>Previous</button>{Array.from({ length: pages }, (_, i) => i + 1).map(number => <button key={number} type="button" aria-label={`Page ${number}`} aria-current={currentPage === number ? 'page' : undefined} onClick={() => setPage(number)}>{number}</button>)}<button type="button" disabled={currentPage === pages} onClick={() => setPage(currentPage + 1)}>Next</button></nav></footer>
      </div>
    </> : null}
    <dialog className="cms-delete-dialog" ref={deleteRef} onCancel={() => setDeleting(null)} aria-labelledby="delete-slide-title"><h2 id="delete-slide-title">Delete this {itemNoun.toLowerCase()}?</h2><p>{deleting !== null && items[deleting] ? heading(items[deleting], deleting, master) : ''}</p><p>This removes it from the {anyAcademics && master === 'hero' ? `page banner carousel on ${livePageUrl}` : isFacultyProfiles ? `faculty directory on ${livePageUrl}` : groupMeta ? `${title.replace(/^[^–]+–\s*/, '')} on ${livePageUrl}` : anyAcademics ? `${title.replace(/^[^–]+–\s*/, '')} carousel on ${livePageUrl}` : 'homepage carousel'}.</p><div className="cms-save-bar"><button type="button" className="cms-danger" disabled={busy} onClick={() => void remove()}>{busy ? 'Deleting…' : `Delete ${itemNoun.toLowerCase()}`}</button><button type="button" className="cms-secondary" disabled={busy} onClick={() => setDeleting(null)}>Cancel</button></div>{error && <p className="cms-error" role="alert">{error}</p>}</dialog>
  </div>;
}
