import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/Providers";
import ToastContainer from "@/components/ToastContainer";
import { generateOrganizationSchema, generateWebApplicationSchema } from "@/lib/seo";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://vanquish.com'),
  title: {
    default: "Book Therapy Sessions Online UK | Qualified Counsellors & Mental Health Support",
    template: "%s | Vanquish"
  },
  description: "Book therapy sessions online with qualified UK counsellors. Connect with professional mental health support, book counselling sessions, and access comprehensive therapy services across the UK.",
  keywords: ["therapy", "counselling", "mental health", "therapy management", "counsellor booking", "therapy sessions", "mental health support", "therapy platform"],
  authors: [{ name: "Vanquish" }],
  creator: "Vanquish",
  publisher: "Vanquish",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  icons: {
    icon: '/favicon.ico',
    apple: '/favicon.ico',
  },
  manifest: '/manifest.json',
  openGraph: {
    type: 'website',
    locale: 'en_GB',
    url: '/',
    siteName: 'Vanquish',
    title: 'Book Therapy Sessions Online UK | Qualified Counsellors & Mental Health Support',
    description: 'Book therapy sessions online with qualified UK counsellors. Comprehensive mental health support and counselling services available now.',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Book Therapy Sessions Online UK | Vanquish',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Book Therapy Sessions Online UK | Qualified Counsellors & Mental Health Support',
    description: 'Book therapy sessions online with qualified UK counsellors. Comprehensive mental health support available now.',
    images: ['/og-image.jpg'],
    creator: '@vanquish',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    // Add verification codes when available
    // google: 'your-google-verification-code',
    // yandex: 'your-yandex-verification-code',
    // bing: 'your-bing-verification-code',
  },
  alternates: {
    canonical: '/',
  },
  category: 'healthcare',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>

      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(generateOrganizationSchema({
              name: 'Vanquish',
              description: 'Professional therapy management system connecting clients with qualified counsellors',
              contactPoint: {
                contactType: 'Customer Service',
                areaServed: 'GB',
              },
            })),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(generateWebApplicationSchema({
              name: 'Vanquish',
              description: 'Comprehensive therapy management system for booking sessions and managing consultations',
              applicationCategory: 'HealthApplication',
            })),
          }}
        />
        <Providers>
          {children}
          <ToastContainer />
        </Providers>
      </body>
    </html>
  );
}
