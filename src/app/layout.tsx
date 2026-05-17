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
  title: {
    default: 'AddisReview — Discover the Best Businesses in Ethiopia',
    template: '%s | AddisReview',
  },
  description: 'Find and review the best restaurants, hotels, cafes, spas and businesses across Ethiopia. Trusted reviews from real Ethiopians.',
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://addisreview.co'),
  keywords: ['Ethiopia businesses', 'Addis Ababa restaurants', 'Ethiopia hotels', 'Addis Ababa reviews', 'best restaurants Ethiopia', 'AddisReview'],
  authors: [{ name: 'AddisReview' }],
  creator: 'AddisReview',
  publisher: 'AddisReview',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    title: 'AddisReview — Discover the Best Businesses in Ethiopia',
    description: 'Find and review the best restaurants, hotels, cafes, spas and businesses across Ethiopia. Trusted reviews from real Ethiopians.',
    type: 'website',
    locale: 'en_US',
    url: 'https://addisreview.co',
    siteName: 'AddisReview',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'AddisReview — Discover Ethiopia',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AddisReview — Discover the Best Businesses in Ethiopia',
    description: 'Find and review the best restaurants, hotels, cafes and businesses across Ethiopia.',
    images: ['/og-image.png'],
  },
  alternates: {
    canonical: 'https://addisreview.co',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${playfair.variable} ${dmSans.variable}`}>
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <meta name="theme-color" content="#1a5c3a" />
      </head>
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
