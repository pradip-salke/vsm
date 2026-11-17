import type { Metadata, Viewport } from 'next';
import { Urbanist } from 'next/font/google';
import { SiteHeader } from '@/components/layout/SiteHeader';
import { SiteFooter } from '@/components/layout/SiteFooter';
import { BackToTop } from '@/components/layout/BackToTop';
import { EnquirySection } from '@/components/sections/EnquirySection';
import { SeoBodyEnd, SeoBodyStart, SeoHeadTags } from '@/components/seo/SeoTags';
import { globalSeoMetadata } from '@/lib/seo';
import { getPublicFooter } from '@/lib/site-brand';
import './globals.css';

const urbanist = Urbanist({ subsets: ['latin'], weight: ['100', '200', '300', '400', '500', '600', '700', '800', '900'], variable: '--font-urbanist', display: 'swap' });

const metadata: Metadata = {
  title: { default: 'Valia School of Management', template: '%s | Valia School of Management' },
  description: 'Valia School of Management website.',
};

export async function generateMetadata(): Promise<Metadata> {
  return globalSeoMetadata(metadata);
}

export const viewport: Viewport = { width: 'device-width', initialScale: 1, themeColor: '#272e6d' };

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const footerContent = await getPublicFooter();
  const websiteLogo = footerContent.about.logoUrl?.trim() || '/images/brand/vsm-logo.svg';
  return (
    <html lang="en" className={urbanist.variable} data-scroll-behavior="smooth">
      <head>
        <SeoHeadTags />
      </head>
      <body>
        <SeoBodyStart />
        <a className="skip-link" href="#main">
          Skip to content
        </a>
        <SiteHeader logoSrc={websiteLogo} socials={footerContent.socials} />
        <main id="main">
          {children}
          <EnquirySection socials={footerContent.socials} />
        </main>
        <SiteFooter logoSrc={websiteLogo} />
        <BackToTop />
        <SeoBodyEnd />
      </body>
    </html>
  );
}
