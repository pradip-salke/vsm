# Home Page CMS

## Reference and scope

The local PHP reference's `PagesController::homePage`, `updateHomePage`, `saveHomeSlide`, `deleteHomeSlide`, and homepage/slide form views were inspected. The transferred operations are editable section headings and copy, button text/URLs, ordered repeatable cards, add/remove/edit, active/inactive slides, previews, and image upload/replacement. Rajco's copper-product copy and page-specific fields are not VSM content.

Website Pages → Home contains Home Slider and Home Page Sections. The sections editor follows the existing VSM homepage order; the shared marquee editor updates both occurrences. Other carousel content is managed independently in Slider Masters: Faculty, Recruiters, Internships, Testimonials, Upcoming Events and Life at VSM. The shared enquiry form logic and site-wide contact/social settings remain unchanged; home-specific enquiry headings, contact copy, telephone links and opening hours are editable in Home.

Home Slider uses a reference-style specifications form with main heading, sanitized rich-text subtitle, optional primary/secondary buttons, image preview/upload/path/alt text, sort order and status. Existing image dimensions and crop positioning are retained internally. Copper-specific badge/highlight/trust fields are omitted because they are not part of VSM's banner design. Legacy shared banner button values are read as defaults for old slides; each newly saved slide owns its buttons.

## Persistence and deployment

- Existing MySQL `website_settings` stores `home.<section>` and `home.master-<name>` documents. No destructive schema migration is required.
- Run `npm run build --workspace=@vsmedu/contracts`, then `npm run db:seed:home` once per database. Seeding never overwrites saved edits.
- Existing website copy and image metadata are imported baseline values, not the source of saved CMS edits. If the API is unavailable, the public website retains that baseline; the CMS shows load/save errors and does not claim a failed save succeeded.
- `GET /api/v1/public/home` provides published content with no caching. Home server rendering also uses `no-store`; reload the public homepage after saving.
- Authenticated `GET/PATCH /api/v1/admin/home/:key` require `pages.read` / `pages.write`. Saves are atomic, audited and reject outdated versions. Save removes deleted list entries and preserves the submitted order. At least one hero must remain enabled.
- `POST /api/v1/admin/home-media` accepts a raw image body and optional URL-encoded `X-File-Name`, up to 2 MB. Images are decoded, validated and written as WebP with intrinsic dimensions. Supported source formats: PNG, JPEG, WebP, AVIF and self-contained SVG. Active/external SVG content is rejected.
- Store uploads on persistent disk using optional absolute `MEDIA_ROOT`; default is repository `uploads/home`. Back up this directory together with MySQL. Existing media is retained on replacement to avoid breaking references.
- Next.js proxies `/cms-media/*` to `API_BASE_URL`. Keep this origin reachable from the Next server. Configure `VITE_API_BASE_URL` and `VITE_WEB_BASE_URL` for deployed CMS origins; Vite reads the repository environment directory and exposes only `VITE_` variables.
- Existing local image paths and `https://vsmedu.com/wp-content/uploads/` remain supported. Upload new images through CMS instead of entering unsupported external image hosts.

## Verification

`scripts/verify-home.ts` uses a temporary editor to verify all 23 stored documents, list add/remove/reorder, visibility, optimistic save conflicts, unauthorized reads, URL validation, image upload/replacement and public API updates. All edited content is restored. The temporary account is deleted unless `--keep-user` is supplied for browser verification.

`scripts/verify-home-browser.mjs` accepts an installed Playwright package directory as its optional argument. Run after `npx tsx scripts/verify-home.ts --keep-user`; it checks actual 1280×720, 1440×900, 768×1024 and 390×844 viewports, all seven masters, UI image upload/save and public homepage image rendering. Then run `npx tsx scripts/verify-home.ts --cleanup`. Test image assets are disposable; remove only the audit image records/files, after original references have been restored.
