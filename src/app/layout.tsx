import type { Metadata } from 'next';
import { Playfair_Display, DM_Sans } from 'next/font/google';
import { Toaster } from 'react-hot-toast';
import './globals.css';

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-serif',
  display: 'swap',
  weight: ['400', '700', '900'],
  style: ['normal', 'italic'],
});

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
  weight: ['300', '400', '500', '600', '700'],
});

export const metadata: Metadata = {
  title: { default: 'AddisReview — Discover Ethiopia', template: '%s | AddisReview' },
  description: 'Find and review the best restaurants, hotels, and businesses across Ethiopia.',
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://addisreview.co'),
  openGraph: {
    title: 'AddisReview — Discover Ethiopia',
    description: 'Find and review the best restaurants, hotels, and businesses across Ethiopia.',
    type: 'website',
    locale: 'en_US',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${playfair.variable} ${dmSans.variable}`}>
      <body className="font-sans bg-warm-white text-charcoal overflow-x-hidden min-h-screen">
        {children}
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              background: '#1a5c3a',
              color: '#fff',
              fontFamily: 'DM Sans, sans-serif',
              fontWeight: 600,
              borderRadius: '12px',
              padding: '14px 20px',
            },
            error: { style: { background: '#c0392b' } },
          }}
        />
      </body>
    </html>
  );
}
