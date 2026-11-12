import { Fragment, type ReactNode } from 'react';
import { SEO_TRACKING_PATTERNS } from '@vsmedu/contracts/seo';
import { currentPath, getSeo, type SeoPayload } from '@/lib/seo';

const json = (value: unknown) => JSON.stringify(value).replace(/</g, '\\u003c');
const absolute = (siteUrl: string, url: string) => (/^https?:\/\//.test(url) ? url : `${siteUrl.replace(/\/+$/, '')}${url.startsWith('/') ? url : `/${url}`}`);

function trackingIds({ tracking }: SeoPayload) {
  const valid = (key: keyof typeof SEO_TRACKING_PATTERNS) => (SEO_TRACKING_PATTERNS[key].test(tracking[key]) ? tracking[key] : '');
  return { ga: valid('googleAnalyticsId'), gtm: valid('gtmContainerId'), pixel: valid('metaPixelId'), clarity: valid('clarityProjectId') };
}

const ATTRIBUTE_NAMES: Record<string, string> = { class: 'className', charset: 'charSet', 'http-equiv': 'httpEquiv', crossorigin: 'crossOrigin', referrerpolicy: 'referrerPolicy', nomodule: 'noModule', fetchpriority: 'fetchPriority' };
const BOOLEAN_ATTRIBUTES = new Set(['async', 'defer', 'nomodule']);

function props(source: string): Record<string, string | boolean> {
  const result: Record<string, string | boolean> = {};
  for (const match of source.matchAll(/([a-zA-Z_:][-a-zA-Z0-9_:.]*)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+)))?/g)) {
    const name = match[1]!.toLowerCase();
    if (name.startsWith('on')) continue;
    const value = match[2] ?? match[3] ?? match[4];
    result[ATTRIBUTE_NAMES[name] ?? name] = BOOLEAN_ATTRIBUTES.has(name) ? true : (value ?? '');
  }
  return result;
}

/** Turns a trusted admin snippet into head elements (script, style, noscript, meta, link). Other markup is not valid in <head>. */
function headElements(html: string, keyPrefix: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  const pattern = /<(script|style|noscript)\b([^>]*)>([\s\S]*?)<\/\1\s*>|<(meta|link)\b([^>]*?)\/?>/gi;
  let index = 0;
  for (const match of html.matchAll(pattern)) {
    const key = `${keyPrefix}-${index++}`;
    const tag = (match[1] ?? match[4] ?? '').toLowerCase();
    const attrs = props(match[2] ?? match[5] ?? '');
    const body = match[3] ?? '';
    if (tag === 'meta') nodes.push(<meta key={key} {...attrs} />);
    else if (tag === 'link') nodes.push(<link key={key} {...attrs} />);
    else if (tag === 'script') nodes.push(body.trim() ? <script key={key} {...attrs} dangerouslySetInnerHTML={{ __html: body }} /> : <script key={key} {...attrs} />);
    else if (tag === 'style') nodes.push(<style key={key} {...attrs} dangerouslySetInnerHTML={{ __html: body }} />);
    else nodes.push(<noscript key={key} {...attrs} dangerouslySetInnerHTML={{ __html: body }} />);
  }
  return nodes;
}

function BodyCode({ html, slot }: { html: string; slot: string }) {
  if (!html.trim()) return null;
  return <div data-seo-code={slot} style={{ display: 'contents' }} suppressHydrationWarning dangerouslySetInnerHTML={{ __html: html }} />;
}

/** Analytics snippets and custom head code. Render inside the root layout's <head>. */
export async function SeoHeadTags() {
  const seo = await getSeo(await currentPath());
  const { ga, gtm, pixel, clarity } = trackingIds(seo);
  return (
    <>
      {gtm && <script id="seo-gtm" dangerouslySetInnerHTML={{ __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer',${json(gtm)});` }} />}
      {ga && <script id="seo-ga4-src" async src={`https://www.googletagmanager.com/gtag/js?id=${ga}`} />}
      {ga && <script id="seo-ga4" dangerouslySetInnerHTML={{ __html: `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config',${json(ga)});` }} />}
      {pixel && <script id="seo-meta-pixel" dangerouslySetInnerHTML={{ __html: `!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init',${json(pixel)});fbq('track','PageView');` }} />}
      {clarity && <script id="seo-clarity" dangerouslySetInnerHTML={{ __html: `(function(c,l,a,r,i,t,y){c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);})(window,document,"clarity","script",${json(clarity)});` }} />}
      {headElements(seo.tracking.customHeadCode, 'seo-head')}
    </>
  );
}

/** Tag Manager / Pixel noscript fallbacks, custom code after <body>, and JSON-LD structured data. */
export async function SeoBodyStart() {
  const path = await currentPath();
  const seo = await getSeo(path);
  const { gtm, pixel } = trackingIds(seo);
  const { global, siteUrl } = seo;
  const schemas: unknown[] = [];
  if (path === '/' && global.enableOrgSchema && global.orgName) {
    schemas.push({
      '@context': 'https://schema.org',
      '@type': 'EducationalOrganization',
      name: global.orgName,
      url: global.websiteUrl || siteUrl,
      ...(global.orgLogo ? { logo: absolute(siteUrl, global.orgLogo) } : {}),
      ...(global.contactEmail ? { email: global.contactEmail } : {}),
      ...(global.contactPhone ? { telephone: global.contactPhone } : {}),
      ...(global.socialUrls ? { sameAs: global.socialUrls.split('\n').filter(Boolean) } : {}),
    });
    if (global.enableSitelinksSearchbox && global.siteSearchUrl) {
      schemas.push({
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: global.orgName,
        url: global.websiteUrl || siteUrl,
        potentialAction: { '@type': 'SearchAction', target: { '@type': 'EntryPoint', urlTemplate: global.siteSearchUrl }, 'query-input': 'required name=search_term_string' },
      });
    }
  }
  if (seo.page?.schemaJson) {
    try {
      schemas.push(JSON.parse(seo.page.schemaJson));
    } catch {
      // Saved JSON is validated by the API; ignore anything unparsable rather than break the page.
    }
  }
  return (
    <>
      {gtm && <noscript><iframe src={`https://www.googletagmanager.com/ns.html?id=${gtm}`} height="0" width="0" style={{ display: 'none', visibility: 'hidden' }} title="Google Tag Manager" /></noscript>}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      {pixel && <noscript><img height="1" width="1" style={{ display: 'none' }} alt="" src={`https://www.facebook.com/tr?id=${pixel}&ev=PageView&noscript=1`} /></noscript>}
      {schemas.map((schema, index) => (
        <Fragment key={index}>
          <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: json(schema) }} />
        </Fragment>
      ))}
      <BodyCode html={seo.tracking.customBodyStartCode} slot="body-start" />
    </>
  );
}

/** Custom code before </body>. */
export async function SeoBodyEnd() {
  const seo = await getSeo(await currentPath());
  return <BodyCode html={seo.tracking.customBodyEndCode} slot="body-end" />;
}
