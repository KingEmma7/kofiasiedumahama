import { Metadata } from 'next';
import { BookPageContent } from './BookPageContent';

export const metadata: Metadata = {
  title: 'The Psychology of Sustainable Wealth | Kofi Asiedu-Mahama',
  description:
    'Discover "The Psychology of Sustainable Wealth - The Ghanaian Perspective" by Kofi Asiedu-Mahama. A groundbreaking exploration of wealth creation rooted in psychology and the African context.',
  keywords: [
    'The Psychology of Sustainable Wealth',
    'Kofi Asiedu-Mahama',
    'wealth psychology',
    'Ghana',
    'financial mindset',
    'book',
  ],
  openGraph: {
    title: 'The Psychology of Sustainable Wealth | Kofi Asiedu-Mahama',
    description:
      'A groundbreaking exploration of wealth creation rooted in psychology and the African context.',
    images: ['/images/book-cover.jpeg'],
  },
};

export default function BookPage() {
  return <BookPageContent />;
}
