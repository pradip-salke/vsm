import type { Metadata, Viewport } from 'next';
import { Manrope, Urbanist } from 'next/font/google';
import { SiteHeader } from '@/components/layout/SiteHeader';
import { SiteFooter } from '@/components/layout/SiteFooter';
import './globals.css';

const urbanist = Urbanist({ subsets: ['latin'], weight: ['500', '800'], variable: '--font-urbanist', display: 'swap' });
const manrope = Manrope({ subsets: ['latin'], weight: ['500', '700', '800'], variable: '--font-manrope', display: 'swap' });

export const metadata: Metadata = {
  title: { default: 'Valia School of Management', template: '%s | Valia School of Management' },
  description: 'Valia School of Management website.',
};

export const viewport: Viewport = { width: 'device-width', initialScale: 1, themeColor: '#272e6d' };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${urbanist.variable} ${manrope.variable}`}>
      <body>
        <a className="skip-link" href="#main">
          Skip to content
        </a>
        <SiteHeader />
        <main id="main">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
