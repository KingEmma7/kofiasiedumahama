import { Metadata } from 'next';
import {
  Hero,
  AboutSection,
  BookPreview,
  NewsletterSection,
  SocialMediaSection,
  Footer,
  BackToTop,
} from '@/components';

export const metadata: Metadata = {
  title: 'Kofi Asiedu-Mahama | The Psychology of Sustainable Wealth',
  description:
    'Discover "The Psychology of Sustainable Wealth - The Ghanaian Perspective" by Kofi Asiedu-Mahama. Transform your financial mindset and build lasting wealth.',
  keywords: [
    'Kofi Asiedu-Mahama',
    'wealth psychology',
    'Ghana',
    'financial mindset',
    'sustainable wealth',
    'book',
    'author',
  ],
  authors: [{ name: 'Kofi Asiedu-Mahama' }],
  openGraph: {
    type: 'website',
    locale: 'en_GH',
    url: 'https://kofiasiedumahama.com',
    siteName: 'Kofi Asiedu-Mahama',
    title: 'Kofi Asiedu-Mahama | The Psychology of Sustainable Wealth',
    description:
      'Discover "The Psychology of Sustainable Wealth - The Ghanaian Perspective" by Kofi Asiedu-Mahama.',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Kofi Asiedu-Mahama - The Psychology of Sustainable Wealth',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@kasiedumahama',
    creator: '@kasiedumahama',
    title: 'Kofi Asiedu-Mahama | The Psychology of Sustainable Wealth',
    description:
      'Discover "The Psychology of Sustainable Wealth - The Ghanaian Perspective" by Kofi Asiedu-Mahama.',
    images: ['/og-image.jpg'],
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
    google: 'YOUR_GOOGLE_VERIFICATION_CODE', // Add your verification code
  },
};

export default function Home() {
  return (
    <main className="min-h-screen bg-white dark:bg-gray-900">
      {/* Structured Data for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Book',
            name: 'The Psychology of Sustainable Wealth',
            alternateName: 'The Psychology of Sustainable Wealth - The Ghanaian Perspective',
            author: {
              '@type': 'Person',
              name: 'Kofi Asiedu-Mahama',
              url: 'https://kofiasiedumahama.com',
              sameAs: [
                'https://www.linkedin.com/in/kofi-asiedu-mahama-4209181ba/',
                'https://www.instagram.com/kofiasiedumahama/',
                'https://www.facebook.com/emmanuel.nyamekye.39/',
                'https://www.youtube.com/@kofiasiedumahama',
                'https://www.tiktok.com/@kofi.asiedumahama',
                'https://x.com/kasiedumahama',
              ],
            },
            description:
              'A groundbreaking exploration of wealth creation and financial psychology tailored for the Ghanaian context.',
            inLanguage: 'en-GH',
            bookFormat: 'https://schema.org/Hardcover',
            offers: {
              '@type': 'Offer',
              price: '99',
              priceCurrency: 'GHS',
              availability: 'https://schema.org/InStock',
              seller: {
                '@type': 'Person',
                name: 'Kofi Asiedu-Mahama',
              },
            },
          }),
        }}
      />

      <Hero />
      <AboutSection />
      <BookPreview />
      <NewsletterSection />
      <SocialMediaSection />
      <Footer />
      <BackToTop />
    </main>
  );
}
