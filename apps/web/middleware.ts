import { NextResponse, type NextRequest } from 'next/server';

/** Exposes the request path to server components (SEO structured data and tracking per URL). */
export function middleware(request: NextRequest) {
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-vsm-pathname', request.nextUrl.pathname);
  return NextResponse.next({ request: { headers: requestHeaders } });
}

export const config = {
  matcher: ['/((?!_next/|cms-media/|images/|robots\\.txt|[\\w-]*sitemap\\.xml|favicon\\.ico|icon\\.png).*)'],
};
