import { useCallback, useEffect, useLayoutEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { Icon } from './Icon';

export type TourId = 'dashboard' | 'home-cms' | `home-master-${string}` | `page-${string}`;
type TourStep = { target?: string; title: string; description: string; placement?: 'top' | 'bottom' | 'left' | 'right' | 'center'; padding?: number };

const tours: Record<'dashboard' | 'home-cms', TourStep[]> = {
  dashboard: [
    { title: 'Welcome to VSM Admin', description: 'This short tour introduces the main dashboard and the tools available in your VSM workspace.', placement: 'center' },
    { target: '[data-tour="brand"]', title: 'Return to Dashboard', description: 'Use the VSM logo at any time to return to the main dashboard.', placement: 'right', padding: 8 },
    { target: '[data-tour="menu-search"]', title: 'Search the Menu', description: 'Find a CMS module quickly by typing its name in the sidebar search.', placement: 'right', padding: 6 },
    { target: '[data-tour="sidebar-toggle"]', title: 'Collapse or Expand Navigation', description: 'Toggle the sidebar to create more workspace or bring the full menu back.', placement: 'bottom', padding: 6 },
    { target: '[data-tour="global-search"]', title: 'Global Search and Voice Search', description: 'Search for CMS pages and modules here, or use the microphone for voice search.', placement: 'bottom', padding: 6 },
    { target: '[data-tour="topbar-actions"]', title: 'Website and Account Actions', description: 'Open the live website, replay this tour, and manage your admin account from this area.', placement: 'bottom', padding: 8 },
    { target: '[data-tour="dashboard-metrics"]', title: 'Website Overview', description: 'Review key totals for pages, programmes, enquiries, and active users.', placement: 'bottom', padding: 10 },
    { target: '[data-tour="dashboard-enquiries"]', title: 'Recent Enquiries', description: 'See the latest enquiry activity and open the enquiries workspace to follow up.', placement: 'top', padding: 8 },
    { target: '[data-tour="dashboard-quick-actions"]', title: 'Quick Actions', description: 'Jump directly to Home Page CMS or SEO Studio from these shortcuts.', placement: 'top', padding: 8 },
    { target: '[data-tour="topbar-tour"]', title: 'Replay a Tour Anytime', description: 'You’re all set. Use the Tour button whenever you want to revisit this walkthrough.', placement: 'bottom', padding: 6 },
  ],
  'home-cms': [
    { title: 'Home Page CMS', description: 'This tour shows how the Home Page CMS is organized and where to update its content.', placement: 'center' },
    { target: '[data-tour="home-editor-heading"]', title: 'Home Page Overview', description: 'The page heading identifies this editor. Use “View Live Homepage” to open the public Home page in another tab.', placement: 'bottom', padding: 8 },
    { target: '#section-stats', title: 'Homepage Sections', description: 'Home page sections are listed in live-page order. Expand a section to edit its content; this first section contains the programme metrics.', placement: 'bottom', padding: 8 },
    { target: '#section-about', title: 'About Us Content', description: 'Update the introductory Home page story and its supporting content here.', placement: 'bottom', padding: 8 },
    { target: '#section-faculty', title: 'Faculty Section', description: 'Edit the faculty introduction and use its slider link to manage faculty items.', placement: 'bottom', padding: 8 },
    { target: '[data-tour="home-save"]', title: 'Save Home Page Changes', description: 'Save all modified Home page sections together with “Update Home Page”.', placement: 'top', padding: 8 },
    { target: '[data-tour="topbar-tour"]', title: 'Replay This Tour', description: 'You’re ready to edit the Home page. Reopen this walkthrough from the Tour button whenever you need it.', placement: 'bottom', padding: 6 },
  ],
};

const homeMasterNames: Record<string, string> = {
  hero: 'Home Slider',
  recruiters: 'Recruiter Logos',
  internships: 'Summer Internships',
  testimonials: 'Student Testimonials',
  events: 'Upcoming Events',
  life: 'Life at VSM',
};

function getSteps(tourId: TourId, isFormPage: boolean, pageTitle: string, route: string): TourStep[] {
  if (tourId === 'dashboard' || tourId === 'home-cms') return tours[tourId];
  if (tourId.startsWith('page-')) {
    const title = pageTitle || 'CMS Workspace';
    const normalizedRoute = route.toLowerCase();
    const routeWithoutForm = normalizedRoute.replace(/\/(?:new|\d+\/edit)$/, '');
    const routeParts = routeWithoutForm.split('/').filter(Boolean);
    const masterKey = routeParts.at(-1) ?? '';
    const pageSegmentIndex = routeParts.indexOf('page');
    const isNestedPageEditor = pageSegmentIndex >= 0 && routeParts.length === pageSegmentIndex + 2;
    const isMasterManager = normalizedRoute.startsWith('/masters/') || (normalizedRoute.startsWith('/website/') && routeParts.length >= 4 && !normalizedRoute.startsWith('/website/blogs/posts') && !isNestedPageEditor);
    const steps: TourStep[] = [
      { title: `Welcome to ${title}`, description: `This walkthrough highlights the main tools and content areas in ${title}. Use Next to move through each step, or close the tour at any time.`, placement: 'center' },
      { target: 'header.page-heading, header.cms-master-heading, header.seo-header', title: `${title} Overview`, description: 'Review the page title, context, and available primary actions here.', placement: 'bottom', padding: 8 },
    ];

    if (isMasterManager && isFormPage) {
      steps.push(
        { target: '[data-tour="master-heading"]', title: 'Item Editor', description: 'Confirm the section and item you are editing before making changes.', placement: 'bottom', padding: 8 },
        { target: '[data-tour="master-form"]', title: 'Edit Content', description: 'Update the item fields, display order, and image or media details in this form.', placement: 'bottom', padding: 8 },
        { target: '[data-tour="master-save"]', title: 'Save the Item', description: 'Save your changes to publish the updated item on its page.', placement: 'top', padding: 6 },
      );
    } else if (isMasterManager) {
      steps.push(
        ...(masterKey === 'hero' || masterKey === 'faculty' ? [] : [{ target: '[data-tour="master-section-settings"]', title: 'Section Settings', description: 'Update the shared heading and introductory content when this section provides settings.', placement: 'bottom' as const, padding: 8 }]),
        { target: '[data-tour="master-add"]', title: 'Add an Item', description: 'Create a new banner, profile, event, or media item for this page.', placement: 'bottom', padding: 6 },
        { target: '[data-tour="master-table-toolbar"]', title: 'Find Items', description: 'Search the list or change how many items appear on each page.', placement: 'bottom', padding: 6 },
        { target: '[data-tour="master-table"]', title: 'Manage Existing Items', description: 'Review each item and use its row actions to edit or remove it.', placement: 'top', padding: 8 },
      );
    } else if (normalizedRoute.startsWith('/enquiries/')) {
      steps.push(
        { target: '.cms-filter-card, .cms-table-controls-bar', title: 'Filter and Search Records', description: 'Narrow the records by date or search terms, then use the export controls when you need a report.', placement: 'bottom', padding: 8 },
        { target: '.cms-table-card', title: 'Review Submissions', description: 'Browse, sort, and open the records in this table. The table tools work independently of the page navigation.', placement: 'top', padding: 8 },
      );
    } else if (normalizedRoute.startsWith('/seo')) {
      steps.push(
        { target: '.seo-tabs', title: 'SEO Sections', description: 'Switch between the SEO tools from these tabs. Each tab manages a different part of the site’s search setup.', placement: 'bottom', padding: 8 },
        { target: '.seo-pane, .seo-overview-grid, .seo-two-col, .seo-editor-card, .seo-audit-card, .seo-card', title: 'Current SEO Workspace', description: 'Review the information and controls for the selected SEO section here.', placement: 'top', padding: 8 },
      );
    } else if (normalizedRoute.startsWith('/website/') && normalizedRoute !== '/website/approvals' && !normalizedRoute.includes('/blogs/posts')) {
      steps.push(
        { target: '.cms-sections-stream > .cms-section-card:first-child', title: 'Page Sections', description: 'Edit the page’s content section by section. Each card groups the fields that appear together on the live page.', placement: 'bottom', padding: 8 },
        { target: '.cms-sections-stream > .cms-section-card:nth-child(2), .cms-section-card[aria-labelledby="heading-shared"]', title: 'More Page Content', description: 'Continue through the page’s sections and shared content links. Each section saves as part of this page update.', placement: 'bottom', padding: 8 },
        { target: '.cms-bulk-save-bar', title: 'Save Page Changes', description: 'Save all modified page sections together from the action bar at the bottom.', placement: 'top', padding: 8 },
      );
    } else if (normalizedRoute.startsWith('/website/blogs/posts')) {
      if (isFormPage) {
        steps.push(
          { target: '.cms-sections-stream', title: 'Blog Post Details', description: 'Edit the article content, publication details, categories, and search metadata in the grouped fields.', placement: 'bottom', padding: 8 },
          { target: '.cms-sections-stream .cms-save-bar', title: 'Save the Blog Post', description: 'Save the post or return to the posts list from these form actions.', placement: 'top', padding: 6 },
        );
      } else {
        steps.push(
          { target: '.cms-table-toolbar', title: 'Filter Blog Posts', description: 'Filter posts by status or category, adjust the page size, and search by title, slug, or author.', placement: 'bottom', padding: 8 },
          { target: '.cms-table-card', title: 'Manage Blog Posts', description: 'Review publication status and use row actions to edit or publish posts.', placement: 'top', padding: 8 },
        );
      }
    } else if (normalizedRoute === '/settings/footer') {
      steps.push(
        { target: '.cms-footer-card:first-of-type', title: 'Footer Content', description: 'Footer content is organized into cards for branding, links, contact details, social channels, and legal information.', placement: 'bottom', padding: 8 },
        { target: '.cms-footer-save-bar', title: 'Save Footer Changes', description: 'Review the save status and apply footer updates from this action bar.', placement: 'top', padding: 8 },
      );
    } else if (normalizedRoute === '/settings/profile') {
      steps.push(
        { target: '.cms-profile-form .cms-section-card', title: 'Admin Profile', description: 'Update your display name and username, or change your password in this profile form.', placement: 'bottom', padding: 8 },
        { target: '.cms-profile-actions', title: 'Profile Actions', description: 'Save profile updates or sign out using the actions at the bottom of the form.', placement: 'top', padding: 8 },
      );
    } else if (normalizedRoute === '/settings/enquire-now') {
      steps.push(
        { target: '.cms-global-form .cms-section-card', title: 'Enquiry Form Settings', description: 'Manage the shared enquiry form content and options in this section.', placement: 'bottom', padding: 8 },
        { target: '.cms-global-form .cms-bulk-save-bar', title: 'Save Form Settings', description: 'Save your changes from the action bar at the bottom of the form.', placement: 'top', padding: 8 },
      );
    } else if (normalizedRoute === '/settings/global') {
      steps.push(
        { target: '.cms-global-settings-editor .seo-card', title: 'Website Branding', description: 'Update the website logo used in the public header, mobile menu, and footer.', placement: 'bottom', padding: 8 },
        { target: '.cms-global-settings-editor .seo-sticky-bar', title: 'Save Global Settings', description: 'Apply logo changes with the save action in this bar.', placement: 'top', padding: 8 },
      );
    } else if (normalizedRoute === '/website/approvals' || normalizedRoute === '/settings/contact') {
      steps.push({ target: '.phase-card', title: 'Module Overview', description: 'This page explains the current workspace status and where its future management tools will appear.', placement: 'bottom', padding: 8 });
    } else if (normalizedRoute.startsWith('/settings/') && normalizedRoute !== '/settings/contact') {
      steps.push(
        { target: '.cms-section-card:first-of-type, .cms-settings-card:first-of-type, .seo-card:first-of-type', title: 'Settings and Content Fields', description: 'Related settings are grouped into clear sections. Update the fields here while keeping the website-wide context in mind.', placement: 'bottom', padding: 8 },
        { target: '.cms-save-bar, .cms-bulk-save-bar, .cms-save-actions, .cms-profile-actions, .cms-footer-save-bar, .seo-sticky-bar', title: 'Save Settings', description: 'Use the page’s save action to apply your updates. Unsaved changes are indicated before you leave.', placement: 'top', padding: 8 },
      );
    } else {
      steps.push(
        { target: '.cms-section-card:first-of-type, .cms-table-card, .phase-card', title: 'Main Workspace', description: 'This area contains the page’s primary content, records, or configuration controls.', placement: 'bottom', padding: 8 },
        { target: '.cms-save-bar, .cms-bulk-save-bar, .cms-table-toolbar', title: 'Page Actions', description: 'Use the available actions here to save changes, find content, or move through the records.', placement: 'top', padding: 8 },
      );
    }

    steps.push({ target: '[data-tour="topbar-tour"]', title: 'Replay This Tour', description: 'You’re all set. Open the Tour button in the top bar whenever you want to revisit this walkthrough.', placement: 'bottom', padding: 6 });
    return steps;
  }
  const masterKey = tourId.slice('home-master-'.length);
  const name = homeMasterNames[masterKey] ?? 'Home Page Content';
  if (isFormPage) return [
    { title: `${name} Editor`, description: `This guided tour shows how to add or edit ${name.toLowerCase()} content.`, placement: 'center' },
    { target: '[data-tour="master-heading"]', title: 'Editor Overview', description: 'Confirm the item and section you are editing before updating its content.', placement: 'bottom', padding: 8 },
    { target: '[data-tour="master-form"]', title: 'Edit Content', description: 'Use these fields to update the selected Home page item. Existing content and image controls are preserved.', placement: 'bottom', padding: 8 },
    { target: '[data-tour="master-save"]', title: 'Save Your Changes', description: 'Save the item to publish the update to the Home page.', placement: 'top', padding: 6 },
    { target: '[data-tour="topbar-tour"]', title: 'Replay This Tour', description: 'You’re ready to edit this item. Reopen the tour from the top bar whenever you need it.', placement: 'bottom', padding: 6 },
  ];
  return [
    { title: `${name} CMS`, description: `Manage the ${name.toLowerCase()} content shown on the VSM Home page. This tour points out the section settings, item list, and editing controls.`, placement: 'center' },
    { target: '[data-tour="master-heading"]', title: 'Section Overview', description: 'Review the section name and open the live Home page link to see these items in context.', placement: 'bottom', padding: 8 },
    ...(masterKey === 'hero' ? [] : [{ target: '[data-tour="master-section-settings"]', title: 'Section Settings', description: `Update the shared heading and introductory content for ${name}.`, placement: 'bottom' as const, padding: 8 }]),
    { target: '[data-tour="master-add"]', title: 'Add an Item', description: `Create a new ${name.toLowerCase()} item. You can edit its fields and display order before saving.`, placement: 'bottom', padding: 6 },
    { target: '[data-tour="master-table-toolbar"]', title: 'Search and Filter', description: 'Search the list or adjust how many items are shown on each page.', placement: 'bottom', padding: 6 },
    { target: '[data-tour="master-table"]', title: 'Manage Existing Items', description: 'Review each item, its active status, and use the row actions to edit or remove it.', placement: 'top', padding: 8 },
    { target: '[data-tour="topbar-tour"]', title: 'Replay This Tour', description: 'You’re all set. Reopen this tour from the top bar whenever you need help with this Home section.', placement: 'bottom', padding: 6 },
  ];
}

type Rect = { top: number; left: number; width: number; height: number; padding: number };

export function GuidedTour({ tourId, onEnd, isFormPage = false, pageTitle = 'CMS Workspace', route = '/' }: { tourId: TourId; onEnd: () => void; isFormPage?: boolean; pageTitle?: string; route?: string }) {
  const steps = useMemo(() => getSteps(tourId, isFormPage, pageTitle, route), [tourId, isFormPage, pageTitle, route]);
  const [stepIndex, setStepIndex] = useState(0);
  const [rect, setRect] = useState<Rect | null>(null);
  const step = steps[stepIndex];

  const positionTarget = useCallback((scroll = false) => {
    if (!step?.target) { setRect(null); return; }
    const target = document.querySelector<HTMLElement>(step.target);
    if (!target) { setRect(null); return; }
    if (scroll) target.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' });
    const box = target.getBoundingClientRect();
    setRect({ top: box.top, left: box.left, width: box.width, height: box.height, padding: step.padding ?? 6 });
  }, [step]);

  useLayoutEffect(() => {
    const target = step?.target ? document.querySelector<HTMLElement>(step.target) : null;
    if (target) target.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' });
    const frame = window.requestAnimationFrame(() => positionTarget(false));
    return () => window.cancelAnimationFrame(frame);
  }, [positionTarget, step]);

  useEffect(() => {
    document.body.classList.add('vsm-tour-active');
    let didScrollToTarget = Boolean(step?.target && document.querySelector(step.target));
    const update = () => {
      if (step?.target && !didScrollToTarget) {
        const target = document.querySelector<HTMLElement>(step.target);
        if (target) {
          target.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' });
          didScrollToTarget = true;
        }
      }
      positionTarget(false);
    };
    window.addEventListener('resize', update);
    window.addEventListener('scroll', update, true);
    const observer = new MutationObserver(update);
    observer.observe(document.body, { childList: true, subtree: true });
    const timer = window.setTimeout(update, 300);
    return () => {
      window.clearTimeout(timer);
      observer.disconnect();
      window.removeEventListener('resize', update);
      window.removeEventListener('scroll', update, true);
      document.body.classList.remove('vsm-tour-active');
    };
  }, [positionTarget, step]);

  const finish = useCallback(() => {
    localStorage.setItem(`vsm-tour-${tourId}-completed`, 'true');
    onEnd();
  }, [onEnd, tourId]);

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key === 'Escape') { finish(); return; }
      if (event.key === 'ArrowRight' || event.key === 'Enter') { event.preventDefault(); setStepIndex((n) => n >= steps.length - 1 ? n : n + 1); }
      if (event.key === 'ArrowLeft') { event.preventDefault(); setStepIndex((n) => Math.max(0, n - 1)); }
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [finish, steps.length]);

  if (!step) return null;
  const padding = rect?.padding ?? 0;
  const highlight = rect ? { top: rect.top - padding, left: rect.left - padding, width: rect.width + padding * 2, height: rect.height + padding * 2 } : null;
  const viewportW = window.innerWidth;
  const viewportH = window.innerHeight;
  const popoverW = Math.min(390, viewportW - 32);
  const targetCenterX = rect ? rect.left + rect.width / 2 : viewportW / 2;
  const targetCenterY = rect ? rect.top + rect.height / 2 : viewportH / 2;
  const placement = step.placement ?? 'bottom';
  let popoverLeft = Math.max(16, Math.min(viewportW - popoverW - 16, targetCenterX - popoverW / 2));
  let popoverTop = Math.max(16, Math.min(viewportH - 290, placement === 'top' ? (rect?.top ?? targetCenterY) - 292 : placement === 'left' || placement === 'right' ? targetCenterY - 145 : (rect?.top ?? targetCenterY) + (rect?.height ?? 0) + 16));
  if (placement === 'center' || !rect) { popoverLeft = (viewportW - popoverW) / 2; popoverTop = Math.max(18, (viewportH - 280) / 2); }
  if (placement === 'left' && rect) popoverLeft = Math.max(16, rect.left - popoverW - 18);
  if (placement === 'right' && rect) popoverLeft = Math.min(viewportW - popoverW - 16, rect.left + rect.width + 18);

  return createPortal(<div className="vsm-tour-layer" role="presentation">
    {highlight ? <>
      <div className="vsm-tour-shade" style={{ inset: `0 0 auto`, height: Math.max(0, highlight.top) }} />
      <div className="vsm-tour-shade" style={{ top: Math.max(0, highlight.top), left: 0, width: Math.max(0, highlight.left), height: Math.max(0, highlight.height) }} />
      <div className="vsm-tour-shade" style={{ top: Math.max(0, highlight.top), left: Math.max(0, highlight.left + highlight.width), right: 0, height: Math.max(0, highlight.height) }} />
      <div className="vsm-tour-shade" style={{ top: Math.max(0, highlight.top + highlight.height), left: 0, right: 0, bottom: 0 }} />
      <div className="vsm-tour-spotlight" style={{ top: highlight.top, left: highlight.left, width: highlight.width, height: highlight.height }} />
    </> : <button type="button" className="vsm-tour-full-shade" aria-label="Close tour" onClick={finish} />}
    <section className={`vsm-tour-card ${placement === 'center' || !rect ? 'is-centered' : ''}`} style={{ left: popoverLeft, top: popoverTop, width: popoverW }} role="dialog" aria-modal="true" aria-labelledby="vsm-tour-title" aria-describedby="vsm-tour-description">
      <div className="vsm-tour-card-top"><span className="vsm-tour-step-count">STEP {stepIndex + 1} OF {steps.length}</span><button type="button" className="vsm-tour-close" aria-label="Close tour" onClick={finish}><Icon name="x" size={16} /></button></div>
      <h2 id="vsm-tour-title">{step.title}</h2><p id="vsm-tour-description">{step.description}</p>
      <div className="vsm-tour-progress" aria-label={`Step ${stepIndex + 1} of ${steps.length}`}>{steps.map((_, index) => <button key={index} type="button" aria-label={`Go to step ${index + 1}`} aria-current={index === stepIndex ? 'step' : undefined} className={index === stepIndex ? 'is-active' : ''} onClick={() => setStepIndex(index)} />)}</div>
      <div className="vsm-tour-footer"><button type="button" className="vsm-tour-skip" onClick={finish}>Skip tour</button><div><button type="button" className="vsm-tour-back" disabled={stepIndex === 0} onClick={() => setStepIndex((n) => Math.max(0, n - 1))}>Back</button><button type="button" className="vsm-tour-next" onClick={() => stepIndex === steps.length - 1 ? finish() : setStepIndex((n) => n + 1)}>{stepIndex === steps.length - 1 ? 'Finish' : 'Next'} <Icon name={stepIndex === steps.length - 1 ? 'check' : 'arrow'} size={15} /></button></div></div>
    </section>
  </div>, document.body);
}
