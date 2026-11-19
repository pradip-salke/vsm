import { useEffect, useState } from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { api } from '../lib/api';
import { LoginPage, type AdminUser } from './LoginPage';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { DashboardPage } from './DashboardPage';
import { PlaceholderPage } from './PlaceholderPage';
import { findAdminPage, getAllAdminMenuLinks, type AdminMenuLink } from './navigation';
import { Icon } from './Icon';
import { HomeEditor } from './HomeEditor';
import { SliderMaster, type SupportedMasterKey } from './SliderMaster';
import { GlobalSettingsEditor } from './GlobalSettingsEditor';
import { ContactDetailsEditor } from './ContactDetailsEditor';
import { EnquireNowEditor } from './EnquireNowEditor';
import { FooterEditor } from './FooterEditor';
import { EnquiriesPage } from './EnquiriesPage';
import { homeMasterDefaults } from '@vsmedu/contracts/home';
import { academicsMasterDefaults, type AcademicsMasterKey } from '@vsmedu/contracts/academics';
import { aimaMasterDefaults, type AimaMasterKey } from '@vsmedu/contracts/academics-aima';
import { academicsSpecialisationIndex } from '@vsmedu/contracts/academics-specialisations';
import { AictePgdmPageEditor, AimaPgdmPageEditor, FacultyPageEditor } from './AcademicsPageEditor';
import { facultyMasterDefaults, type FacultyMasterKey } from '@vsmedu/contracts/academics-faculty';
import { SpecialisationPageEditor } from './SpecialisationPageEditor';
import { SpecialisationsHubPage } from './SpecialisationsHubPage';
import { ABOUT_CMS_PATH, BLOGS_CMS_PATH, BLOG_POSTS_PATH, CAREER_CMS_PATH, SitePageEditor, siteGroups, siteMasterPage, sitePageSlugs } from './sitePagesAdmin';
import { BlogPostsPage } from './BlogPostsPage';
import { BlogPostEditor } from './BlogPostEditor';
import { ACADEMICS_CMS_PATH, ADMISSIONS_CMS_PATH, AIMA_CMS_PATH, FACULTY_CMS_PATH, SPECIALISATIONS_HUB_PATH, admissionsCmsPath, PLACEMENTS_CMS_PATH, placementsCmsPath, EVENTS_CMS_PATH, eventsCmsPath } from './cmsPaths';
import { admissionsPageSlugs } from '@vsmedu/contracts/admissions';
import { AdmissionsPageEditor } from './AdmissionsPageEditor';
import { placementsMasterKeys, placementsPageSlugs } from '@vsmedu/contracts/placements';
import { PlacementsPageEditor } from './PlacementsPageEditor';
import { eventsMasterKeys, eventsPageSlugs } from '@vsmedu/contracts/events';
import { EventsPageEditor } from './EventsPageEditor';
import { ProfilePage } from './ProfilePage';
import { UsersPage } from './UsersPage';
import { SEO_STUDIO_PATH, SeoStudio, seoTabPath } from './seo/SeoStudio';
import { GuidedTour, type TourId } from './GuidedTour';
import { GalleryManagementPage } from './GalleryManagementPage';

function allPages(): AdminMenuLink[] {
  return getAllAdminMenuLinks();
}

export function App() {
  const location = useLocation();
  const [user, setUser] = useState<AdminUser | null>(null);
  const [checking, setChecking] = useState(true);
  const [collapsed, setCollapsed] = useState(() => localStorage.getItem('vsm-admin-sidebar-collapsed') === 'true');
  const [mobileOpen, setMobileOpen] = useState(false);
  const [logoutError, setLogoutError] = useState('');
  const [activeTour, setActiveTour] = useState<TourId | null>(null);
  const [tourRun, setTourRun] = useState(0);
  const homeTourMaster = location.pathname.match(/^\/masters\/(hero|recruiters|internships|testimonials|events|life)(?:\/|$)/)?.[1];
  const normalizedTourRoute = location.pathname.replace(/\/$/, '') || '/';
  const tourContext: TourId = normalizedTourRoute === '/' ? 'dashboard' : normalizedTourRoute === '/website/home-sections' ? 'home-cms' : homeTourMaster ? `home-master-${homeTourMaster}` : `page-${normalizedTourRoute.replace(/\d+/g, ':id').replace(/[^a-z0-9:/_-]+/gi, '-')}`;
  const isFormPage = /\/(?:new|\d+\/edit)$/.test(normalizedTourRoute);
  const tourPageTitle = findAdminPage(location.pathname)?.page.label ?? (normalizedTourRoute.split('/').filter(Boolean).pop()?.replace(/-/g, ' ') || 'CMS Workspace');

  useEffect(() => {
    let current = true;
    api<{ data: AdminUser }>('/auth/me').then((result) => { if (current) setUser(result.data); }).catch(() => { if (current) setUser(null); }).finally(() => { if (current) setChecking(false); });
    return () => { current = false; };
  }, []);

  useEffect(() => {
    setActiveTour(null);
  }, [location.pathname]);

  function startTour() {
    setActiveTour(null);
    setTourRun((run) => run + 1);
    window.requestAnimationFrame(() => setActiveTour(tourContext));
  }

  function toggleSidebar() {
    if (window.matchMedia('(max-width: 900px)').matches) setMobileOpen((open) => !open);
    else setCollapsed((value) => {
      const next = !value;
      localStorage.setItem('vsm-admin-sidebar-collapsed', String(next));
      return next;
    });
  }

  async function logout() {
    try { await api<void>('/auth/logout', { method: 'POST', body: '{}' }); }
    catch (cause) { setLogoutError(cause instanceof Error ? cause.message : 'Could not sign out. Please try again.'); return; }
    setUser(null);
    setLogoutError('');
  }

  if (checking) return <main className="session-check" aria-live="polite"><img src="/images/brand/vsm-logo.svg" alt="Valia School of Management" /><span className="button-spinner" />Checking secure session</main>;
  if (!user) return <LoginPage onLogin={setUser} />;

  const canEdit = user.permissions?.includes('pages.write') ?? false;

  return <div className={`admin-shell ${collapsed ? 'sidebar-is-collapsed' : ''}`}>
    <Sidebar collapsed={collapsed} mobileOpen={mobileOpen} onToggleCollapse={() => setCollapsed((value) => { const next = !value; localStorage.setItem('vsm-admin-sidebar-collapsed', String(next)); return next; })} onCloseMobile={() => setMobileOpen(false)} onLogout={() => void logout()} />
    <div className="admin-main-column"><Topbar user={user} onToggleSidebar={toggleSidebar} onLogout={() => void logout()} onStartTour={startTour} tourAvailable />
      <main className="admin-content" id="main-content" key={location.pathname}>
        {logoutError && <div className="inline-error" role="alert"><Icon name="shield" size={18} /><p>{logoutError}</p></div>}
        <Routes>
          <Route path="/" element={<DashboardPage name={user.name} />} />
          <Route path="/website/home-sections" element={<HomeEditor canEdit={canEdit} />} />
          {(['video-testimonials', 'written-testimonials'] as const).flatMap(master => {
            const targets = [
              { base: '/masters', scope: 'home' as const },
              { base: ACADEMICS_CMS_PATH, scope: 'academics' as const },
              { base: AIMA_CMS_PATH, scope: 'aima' as const },
              ...academicsSpecialisationIndex.map(({ slug }) => ({ base: `${SPECIALISATIONS_HUB_PATH}/page/${encodeURIComponent(slug)}`, scope: 'spec' as const, slug })),
            ];
            return targets.flatMap(target => {
              const base = `${target.base}/${master}`;
              const element = <SliderMaster master={master} scope={target.scope} specSlug={'slug' in target ? target.slug : undefined} canEdit={canEdit} />;
              return [<Route key={base} path={base} element={element} />, <Route key={`${base}/new`} path={`${base}/new`} element={element} />, <Route key={`${base}/edit`} path={`${base}/:slidePos/edit`} element={element} />];
            });
          })}
          <Route path="/masters/events/*" element={<Navigate to="/website/home-sections#section-events" replace />} />
          {(Object.keys(homeMasterDefaults).filter((key) => key !== 'life' && key !== 'events') as (keyof typeof homeMasterDefaults)[]).flatMap((key) => {
            const k = key;
            const el = <HomeEditor master={k} canEdit={canEdit} />;
            return [
              <Route key={`${String(k)}-list`} path={`/masters/${String(k)}`} element={el} />,
              <Route key={`${String(k)}-new`} path={`/masters/${String(k)}/new`} element={el} />,
              <Route key={`${String(k)}-edit`} path={`/masters/${String(k)}/:slidePos/edit`} element={el} />,
            ];
          })}
          <Route path={ACADEMICS_CMS_PATH} element={<AictePgdmPageEditor canEdit={canEdit} />} />
          <Route path={`${ACADEMICS_CMS_PATH}/program-videos/*`} element={<Navigate to="/website/events/videos-of-speakers/videos" replace />} />
          {(Object.keys(academicsMasterDefaults).filter((key) => key !== 'gallery' && key !== 'program-videos') as AcademicsMasterKey[]).flatMap((key) => {
            const el = <SliderMaster key={key} master={key} scope="academics" canEdit={canEdit} />;
            return [
              <Route key={`academics-${key}-list`} path={`${ACADEMICS_CMS_PATH}/${key}`} element={el} />,
              <Route key={`academics-${key}-new`} path={`${ACADEMICS_CMS_PATH}/${key}/new`} element={el} />,
              <Route key={`academics-${key}-edit`} path={`${ACADEMICS_CMS_PATH}/${key}/:slidePos/edit`} element={el} />,
            ];
          })}
          <Route path={AIMA_CMS_PATH} element={<AimaPgdmPageEditor canEdit={canEdit} />} />
          {(Object.keys(aimaMasterDefaults) as AimaMasterKey[]).flatMap((key) => {
            const el = <SliderMaster key={`aima-${key}`} master={key} scope="aima" canEdit={canEdit} />;
            return [
              <Route key={`aima-${key}-list`} path={`${AIMA_CMS_PATH}/${key}`} element={el} />,
              <Route key={`aima-${key}-new`} path={`${AIMA_CMS_PATH}/${key}/new`} element={el} />,
              <Route key={`aima-${key}-edit`} path={`${AIMA_CMS_PATH}/${key}/:slidePos/edit`} element={el} />,
            ];
          })}
          <Route path={FACULTY_CMS_PATH} element={<FacultyPageEditor canEdit={canEdit} />} />
          {(Object.keys(facultyMasterDefaults) as FacultyMasterKey[]).flatMap((key) => {
            const el = <SliderMaster key={`faculty-${key}`} master={key} scope="faculty" canEdit={canEdit} />;
            return [
              <Route key={`faculty-${key}-list`} path={`${FACULTY_CMS_PATH}/${key}`} element={el} />,
              <Route key={`faculty-${key}-new`} path={`${FACULTY_CMS_PATH}/${key}/new`} element={el} />,
              <Route key={`faculty-${key}-edit`} path={`${FACULTY_CMS_PATH}/${key}/:slidePos/edit`} element={el} />,
            ];
          })}
          <Route path={SPECIALISATIONS_HUB_PATH} element={<SpecialisationsHubPage />} />
          <Route path={`${SPECIALISATIONS_HUB_PATH}/page/:slug`} element={<SpecialisationPageEditor canEdit={canEdit} />} />
          {academicsSpecialisationIndex.flatMap(({ slug }) => {
            const el = <SliderMaster key={`spec-${slug}-hero`} master="hero" scope="spec" specSlug={slug} canEdit={canEdit} />;
            const internshipEl = <SliderMaster key={`spec-${slug}-internships`} master="internships" scope="spec" specSlug={slug} canEdit={canEdit} />;
            const testimonialsEl = <SliderMaster key={`spec-${slug}-testimonials`} master="testimonials" scope="spec" specSlug={slug} canEdit={canEdit} />;
            const base = `${SPECIALISATIONS_HUB_PATH}/page/${encodeURIComponent(slug)}`;
            return [
              <Route key={`spec-${slug}-hero-list`} path={`${base}/hero`} element={el} />,
              <Route key={`spec-${slug}-hero-new`} path={`${base}/hero/new`} element={el} />,
              <Route key={`spec-${slug}-hero-edit`} path={`${base}/hero/:slidePos/edit`} element={el} />,
              <Route key={`spec-${slug}-internships-list`} path={`${base}/internships`} element={internshipEl} />,
              <Route key={`spec-${slug}-internships-new`} path={`${base}/internships/new`} element={internshipEl} />,
              <Route key={`spec-${slug}-internships-edit`} path={`${base}/internships/:slidePos/edit`} element={internshipEl} />,
              <Route key={`spec-${slug}-testimonials-list`} path={`${base}/testimonials`} element={testimonialsEl} />,
              <Route key={`spec-${slug}-testimonials-new`} path={`${base}/testimonials/new`} element={testimonialsEl} />,
              <Route key={`spec-${slug}-testimonials-edit`} path={`${base}/testimonials/:slidePos/edit`} element={testimonialsEl} />,
            ];
          })}
          {admissionsPageSlugs.flatMap((slug) => {
            const base = admissionsCmsPath(slug);
            const el = <SliderMaster key={`admissions-${slug}-hero`} master="hero" scope="admissions" admissionsPage={slug} canEdit={canEdit} />;
            return [
              <Route key={`admissions-${slug}`} path={base} element={<AdmissionsPageEditor key={slug} page={slug} canEdit={canEdit} />} />,
              <Route key={`admissions-${slug}-hero-list`} path={`${base}/hero`} element={el} />,
              <Route key={`admissions-${slug}-hero-new`} path={`${base}/hero/new`} element={el} />,
              <Route key={`admissions-${slug}-hero-edit`} path={`${base}/hero/:slidePos/edit`} element={el} />,
            ];
          })}
          <Route path={ADMISSIONS_CMS_PATH} element={<Navigate to={admissionsCmsPath('mba-pgdm-admissions-process')} replace />} />
          {(['about', 'career', 'blogs'] as const).flatMap((group) =>
            sitePageSlugs(group).filter((slug) => !(group === 'blogs' && slug === 'detail')).flatMap((slug) => {
              const base = siteGroups[group].cms(slug);
              const sitePage = siteMasterPage(group, slug);
              return [
                <Route key={`${group}-${slug}`} path={base} element={<SitePageEditor key={`${group}-${slug}`} group={group} slug={slug} canEdit={canEdit} />} />,
                ...Object.keys(siteGroups[group].masters).filter((master) => !(group === 'blogs' && slug === 'detail' && master === 'hero')).flatMap((master) => {
                  const el = <SliderMaster key={`${group}-${slug}-${master}`} master={master as SupportedMasterKey} scope="site" sitePage={sitePage} canEdit={canEdit} />;
                  return [
                    <Route key={`${group}-${slug}-${master}-list`} path={`${base}/${master}`} element={el} />,
                    <Route key={`${group}-${slug}-${master}-new`} path={`${base}/${master}/new`} element={el} />,
                    <Route key={`${group}-${slug}-${master}-edit`} path={`${base}/${master}/:slidePos/edit`} element={el} />,
                  ];
                }),
              ];
            }),
          )}
          <Route path={ABOUT_CMS_PATH} element={<Navigate to={siteGroups.about.cms(sitePageSlugs('about')[0]!)} replace />} />
          <Route path={BLOGS_CMS_PATH} element={<Navigate to={BLOG_POSTS_PATH} replace />} />
          <Route path={`${BLOGS_CMS_PATH}/detail`} element={<Navigate to={BLOG_POSTS_PATH} replace />} />
          <Route path={BLOG_POSTS_PATH} element={<BlogPostsPage canEdit={canEdit} />} />
          <Route path={`${BLOG_POSTS_PATH}/new`} element={<BlogPostEditor key="new" canEdit={canEdit} />} />
          <Route path={`${BLOG_POSTS_PATH}/:id/edit`} element={<BlogPostEditor canEdit={canEdit} />} />
          {placementsPageSlugs.flatMap((slug) => {
            const base = placementsCmsPath(slug);
            return [
              <Route key={`placements-${slug}`} path={base} element={<PlacementsPageEditor key={slug} page={slug} canEdit={canEdit} />} />,
              ...placementsMasterKeys(slug).flatMap((master) => {
                const el = (
                  <SliderMaster
                    key={`placements-${slug}-${master}`}
                    master={master as SupportedMasterKey}
                    scope="placements"
                    placementsPage={slug}
                    canEdit={canEdit}
                  />
                );
                return [
                  <Route key={`placements-${slug}-${master}-list`} path={`${base}/${master}`} element={el} />,
                  <Route key={`placements-${slug}-${master}-new`} path={`${base}/${master}/new`} element={el} />,
                  <Route key={`placements-${slug}-${master}-edit`} path={`${base}/${master}/:slidePos/edit`} element={el} />,
                ];
              }),
            ];
          })}
          <Route path={PLACEMENTS_CMS_PATH} element={<Navigate to={placementsCmsPath('placements')} replace />} />
          {eventsPageSlugs.flatMap((slug) => {
            const base = eventsCmsPath(slug);
            return [
              <Route key={`events-${slug}`} path={base} element={<EventsPageEditor key={slug} page={slug} canEdit={canEdit} />} />,
              ...eventsMasterKeys(slug).filter((master) => master !== 'albums').flatMap((master) => {
                const el = (
                  <SliderMaster
                    key={`events-${slug}-${master}`}
                    master={master as SupportedMasterKey}
                    scope="events"
                    eventsPage={slug}
                    canEdit={canEdit}
                  />
                );
                return [
                  <Route key={`events-${slug}-${master}-list`} path={`${base}/${master}`} element={el} />,
                  <Route key={`events-${slug}-${master}-new`} path={`${base}/${master}/new`} element={el} />,
                  <Route key={`events-${slug}-${master}-edit`} path={`${base}/${master}/:slidePos/edit`} element={el} />,
                ];
              }),
            ];
          })}
          <Route path={EVENTS_CMS_PATH} element={<Navigate to={eventsCmsPath('gallery')} replace />} />
          <Route path="/masters/gallery/*" element={<GalleryManagementPage canEdit={canEdit} />} />
          <Route path="/masters/life/*" element={<Navigate to="/masters/gallery/life" replace />} />
          <Route path={`${ACADEMICS_CMS_PATH}/gallery/*`} element={<Navigate to="/masters/gallery/life" replace />} />
          <Route path={`${eventsCmsPath('gallery')}/albums/*`} element={<Navigate to="/masters/gallery/albums" replace />} />
          <Route path={`${eventsCmsPath('gallery-2')}/albums/*`} element={<Navigate to="/masters/gallery/albums" replace />} />
          <Route path="/masters/program-videos" element={<Navigate to={`${ACADEMICS_CMS_PATH}/program-videos`} replace />} />
          <Route path="/website/home-slider" element={<Navigate to="/masters/hero" replace />} />
          <Route path="/website/academics/program-videos" element={<Navigate to={`${ACADEMICS_CMS_PATH}/program-videos`} replace />} />
          <Route path="/settings/global" element={<GlobalSettingsEditor canEdit={canEdit} />} />
          <Route path="/settings/enquire-now" element={<EnquireNowEditor canEdit={canEdit} />} />
          <Route path="/settings/contact" element={<ContactDetailsEditor canEdit={canEdit} />} />
          <Route path="/settings/footer" element={<FooterEditor canEdit={canEdit} />} />
          <Route path="/settings/profile" element={<ProfilePage user={user} onUserUpdate={setUser} onLogout={() => void logout()} />} />
          <Route path="/access/users" element={<UsersPage />} />
          <Route path="/enquiries/career" element={<EnquiriesPage type="career" canEdit={canEdit} />} />
          <Route path="/enquiries/enquiry" element={<EnquiriesPage type="enquiry" canEdit={canEdit} />} />
          <Route path="/enquiries/application" element={<EnquiriesPage type="application" canEdit={canEdit} />} />
          <Route path="/enquiries" element={<Navigate to="/enquiries/enquiry" replace />} />
          {allPages().filter((page) => page.path !== '/' && page.path !== '/website/home-sections' && page.path !== '/settings/global' && page.path !== '/settings/enquire-now' && page.path !== '/settings/footer' && page.path !== '/settings/profile' && !page.path.startsWith('/masters/') && !page.path.startsWith(ACADEMICS_CMS_PATH) && !page.path.startsWith(AIMA_CMS_PATH) && !page.path.startsWith(FACULTY_CMS_PATH) && !page.path.startsWith(SPECIALISATIONS_HUB_PATH) && !page.path.startsWith(ADMISSIONS_CMS_PATH) && !page.path.startsWith(PLACEMENTS_CMS_PATH) && !page.path.startsWith(EVENTS_CMS_PATH) && !page.path.startsWith(ABOUT_CMS_PATH) && !page.path.startsWith(CAREER_CMS_PATH) && !page.path.startsWith(BLOGS_CMS_PATH) && !page.path.startsWith('/enquiries') && !page.path.startsWith(SEO_STUDIO_PATH)).map((page) => <Route key={page.path} path={page.path} element={<PlaceholderPage page={page} />} />)}
          <Route path={SEO_STUDIO_PATH} element={<Navigate to={seoTabPath('overview')} replace />} />
          <Route path={`${SEO_STUDIO_PATH}/:tab`} element={<SeoStudio canEdit={canEdit} />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <footer className="admin-content-footer"><span>VSM CMS</span><span>Secure administration workspace</span></footer>
      </main>
    </div>
    {activeTour && <GuidedTour key={`${activeTour}-${tourRun}`} tourId={activeTour} isFormPage={isFormPage} pageTitle={tourPageTitle} route={normalizedTourRoute} onEnd={() => setActiveTour(null)} />}
  </div>;
}
