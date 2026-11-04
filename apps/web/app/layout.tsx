import type { Metadata, Viewport } from 'next';
import { Urbanist } from 'next/font/google';
import { SiteHeader } from '@/components/layout/SiteHeader';
import { SiteFooter } from '@/components/layout/SiteFooter';
import { EnquirySection } from '@/components/sections/EnquirySection';
import { BackToTop } from '@/components/layout/BackToTop';
import './globals.css';

const urbanist = Urbanist({ subsets: ['latin'], weight: ['100', '200', '300', '400', '500', '600', '700', '800', '900'], variable: '--font-urbanist', display: 'swap' });

export const metadata: Metadata = {
  title: { default: 'Valia School of Management', template: '%s | Valia School of Management' },
  description: 'Valia School of Management website.',
};

export const viewport: Viewport = { width: 'device-width', initialScale: 1, themeColor: '#272e6d' };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={urbanist.variable} data-scroll-behavior="smooth">
      <body>
        <a className="skip-link" href="#main">
          Skip to content
        </a>
        <SiteHeader />
        <main id="main">
          {children}
          <EnquirySection />
        </main>
        <SiteFooter />
        <BackToTop />
      </body>
    </html>
  );
}
