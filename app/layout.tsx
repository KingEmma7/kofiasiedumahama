import type { Metadata } from 'next';
import { Inter, Poppins } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/components/ThemeProvider';
import { Analytics } from '@/components/Analytics';
import { SpeedInsights } from '@vercel/speed-insights/next';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const poppins = Poppins({
  subsets: ['latin'],
  variable: '--font-poppins',
  weight: ['400', '500', '600', '700', '800', '900'],
  display: 'swap',
});

// SEO Metadata - Update with your actual information
export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://kofiasiedumahama.com'),
  title: {
    default: 'Kofi Asiedu Mahama | Author & Thought Leader',
    template: '%s | Kofi Asiedu Mahama',
  },
  description: 'Discover the transformative journey through my book. Insights on success, resilience, and personal growth from Ghana to the world.',
  keywords: ['author', 'book', 'Ghana', 'personal development', 'success', 'leadership', 'Kofi Asiedu Mahama'],
  authors: [{ name: 'Kofi Asiedu Mahama' }],
  creator: 'Kofi Asiedu Mahama',
  publisher: 'Kofi Asiedu Mahama',
  
  // Open Graph
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: '/',
    siteName: 'Kofi Asiedu Mahama',
    title: 'Kofi Asiedu Mahama | Author & Thought Leader',
    description: 'Discover the transformative journey through my book. Insights on success, resilience, and personal growth.',
    images: [
      {
        url: '/og-image.jpg', // Create this image: 1200x630px
        width: 1200,
        height: 630,
        alt: 'Kofi Asiedu Mahama - Author',
      },
    ],
  },
  
  // Twitter
  twitter: {
    card: 'summary_large_image',
    title: 'Kofi Asiedu Mahama | Author & Thought Leader',
    description: 'Discover the transformative journey through my book.',
    images: ['/og-image.jpg'],
    creator: '@kofiasiedumahama', // Update with your Twitter handle
  },
  
  // Robots
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
  
  // Icons
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon-16x16.png',
    apple: '/apple-touch-icon.png',
  },
  
  // Manifest
  manifest: '/site.webmanifest',
};

// JSON-LD Schema for Book
const bookSchema = {
  '@context': 'https://schema.org',
  '@type': 'Book',
  name: 'Your Book Title', // Update with actual title
  author: {
    '@type': 'Person',
    name: 'Kofi Asiedu Mahama',
  },
  description: 'A transformative journey of success, resilience, and personal growth.',
  genre: 'Self-Help',
  inLanguage: 'en',
  publisher: {
    '@type': 'Organization',
    name: 'Kofi Asiedu Mahama',
  },
};

// JSON-LD Schema for Person
const personSchema = {
  '@context': 'https://schema.org',
  '@type': 'Person',
  name: 'Kofi Asiedu Mahama',
  url: process.env.NEXT_PUBLIC_SITE_URL || 'https://kofiasiedumahama.com',
  sameAs: [
    'https://twitter.com/kofiasiedumahama', // Update with actual links
    'https://linkedin.com/in/kofiasiedumahama',
    'https://instagram.com/kofiasiedumahama',
  ],
  jobTitle: 'Author',
  nationality: 'Ghanaian',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(bookSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(personSchema) }}
        />
        
        {/* Preconnect to external resources */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className={`${inter.variable} ${poppins.variable} font-sans bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100 transition-colors duration-300`}>
        <ThemeProvider>
          {children}
        </ThemeProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}

