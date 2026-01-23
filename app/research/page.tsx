import { Metadata } from 'next';
import { ResearchPageContent } from './ResearchPageContent';

export const metadata: Metadata = {
  title: 'Research & Publications',
  description: 'Explore academic research and thought leadership publications by Kofi Asiedu-Mahama on psychology, economics, and the human condition.',
  keywords: [
    'Kofi Asiedu-Mahama',
    'research',
    'publications',
    'AI',
    'job security',
    'psychology',
    'meta-analysis',
    'thought leadership',
  ],
  openGraph: {
    title: 'Research & Publications | Kofi Asiedu-Mahama',
    description: 'Explore academic research and thought leadership publications on psychology, economics, and the human condition.',
    type: 'website',
  },
};

export default function ResearchPage() {
  return <ResearchPageContent />;
}
