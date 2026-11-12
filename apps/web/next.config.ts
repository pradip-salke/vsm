import type { NextConfig } from 'next';

// Next's dev runtime needs eval (source maps) and a websocket for HMR; production stays strict.
const isDev = process.env.NODE_ENV !== 'production';
const portArgIndex = process.argv.findIndex((argument) => argument === '-p' || argument === '--port');
const devPort = portArgIndex >= 0 ? process.argv[portArgIndex + 1] : process.env.PORT ?? '3000';
// Analytics hosts used by the SEO Studio tracking codes (GA4, Tag Manager, Meta Pixel, Clarity).
const trackingScriptHosts = 'https://www.googletagmanager.com https://www.google-analytics.com https://connect.facebook.net https://www.clarity.ms https://*.clarity.ms';
const scriptSrc = `script-src 'self' 'unsafe-inline' ${trackingScriptHosts}${isDev ? " 'unsafe-eval'" : ''}`;
const apiBase = process.env.API_BASE_URL ?? 'http://localhost:4000';
const connectSrc = `connect-src 'self' http://localhost:4000 https:${isDev ? ' ws:' : ''}`;

const config: NextConfig = {
  // Isolate each dev server by port so parallel local instances cannot delete each other's route output.
  distDir: isDev ? `.next-dev-${devPort}` : '.next',
  poweredByHeader: false,
  reactStrictMode: true,
  transpilePackages: ['@vsmedu/contracts'],
  async rewrites() {
    return [
      { source: '/cms-media/:path*', destination: `${apiBase}/cms-media/:path*` },
      { source: '/robots.txt', destination: `${apiBase}/api/v1/public/seo/robots.txt` },
      { source: '/sitemap.xml', destination: `${apiBase}/api/v1/public/seo/sitemap.xml` },
      { source: '/blog-sitemap.xml', destination: `${apiBase}/api/v1/public/seo/blog-sitemap.xml` },
      { source: '/gallery-sitemap.xml', destination: `${apiBase}/api/v1/public/seo/gallery-sitemap.xml` },
    ];
  },
  images: {
    formats: ['image/webp'],
    minimumCacheTTL: 60 * 60 * 24 * 7,
    remotePatterns: [
      { protocol: 'https', hostname: 'vsmedu.com', pathname: '/wp-content/uploads/**' },
    ],
  },
  async headers() {
    return [{ source: '/:path*', headers: [
      { key: 'X-Content-Type-Options', value: 'nosniff' },
      { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
      { key: 'X-Frame-Options', value: 'DENY' },
      { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
      { key: 'Content-Security-Policy', value: `default-src 'self'; ${scriptSrc}; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; media-src 'self' https://vsmedu.com https://youtube.com https://www.youtube.com; frame-src https://www.google.com https://www.googletagmanager.com https://www.youtube.com https://www.youtube-nocookie.com; ${connectSrc}; object-src 'none'; base-uri 'self'; frame-ancestors 'none'` },
    ] }];
  },
};
export default config;
