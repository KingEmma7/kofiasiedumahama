'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import {
  ArrowDownTrayIcon,
  DocumentTextIcon,
  AcademicCapIcon,
  ShareIcon,
  ArrowLeftIcon,
  BeakerIcon,
  LightBulbIcon,
  BookOpenIcon,
} from '@heroicons/react/24/outline';
import { Footer } from '@/components/Footer';
import { ThemeToggle } from '@/components/ThemeToggle';
import { trackEvent } from '@/components/Analytics';

// Research publications data
const publications = [
  {
    id: 'ai-job-security',
    title: 'AI, Job Security, and the Human Condition: A Psychological and Historical Comparison',
    type: 'Meta-Analysis',
    date: '2024',
    downloadPath: '/books/ai-job-security-human-condition.pdf',
    abstract: `This meta-analysis explores the psychological impact of artificial intelligence on job security, drawing parallels with historical technological revolutions. By examining the Industrial Revolution, the Digital Age, and the current AI era, this paper investigates how humans have historically adapted to disruptive technologies and what lessons can be applied to our current moment.

The study synthesizes findings from over 50 peer-reviewed papers across psychology, economics, and sociology to understand the complex interplay between technological advancement and human wellbeing. Key themes include anxiety patterns, adaptation mechanisms, policy responses, and the unique psychological resilience that has allowed humanity to not only survive but thrive through periods of technological upheaval.

Central to this analysis is the recognition that while AI presents unprecedented challenges to traditional employment paradigms, historical precedent suggests that human adaptability, coupled with thoughtful policy intervention, can transform potential displacement into opportunity. The paper concludes with evidence-based recommendations for individuals, organizations, and policymakers navigating this transition.`,
    keywords: ['Artificial Intelligence', 'Job Security', 'Psychological Impact', 'Historical Analysis', 'Technological Disruption', 'Human Adaptation'],
    citation: 'Asiedu-Mahama, K. (2024). AI, Job Security, and the Human Condition: A Psychological and Historical Comparison.',
  },
];

function PublicationCard({ publication }: { publication: typeof publications[0] }) {
  const handleDownload = () => {
    // Download is tracked server-side via /api/download-research route
    // No need to track here to avoid double counting
  };

  const handleShare = async () => {
    const shareUrl = `${window.location.origin}/research#${publication.id}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: publication.title,
          text: `Check out this research paper by Kofi Asiedu-Mahama: ${publication.title}`,
          url: shareUrl,
        });
        trackEvent('research_share', 'engagement', publication.id);
      } catch {
        // User cancelled or share failed
      }
    } else {
      // Fallback: copy to clipboard
      await navigator.clipboard.writeText(shareUrl);
      alert('Link copied to clipboard!');
      trackEvent('research_share_copy', 'engagement', publication.id);
    }
  };

  return (
    <motion.article
      id={publication.id}
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl overflow-hidden border border-gray-100 dark:border-gray-800"
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-primary-600 via-primary-700 to-primary-800 p-6 md:p-8">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-3">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/20 text-white text-xs font-semibold rounded-full">
                <BeakerIcon className="w-3.5 h-3.5" />
                {publication.type}
              </span>
              <span className="text-white/80 text-sm">{publication.date}</span>
            </div>
            <h2 className="text-xl md:text-2xl lg:text-3xl font-bold text-white leading-tight">
              {publication.title}
            </h2>
          </div>
          <DocumentTextIcon className="w-12 h-12 text-white/30 flex-shrink-0 hidden md:block" />
        </div>
      </div>

      {/* Content */}
      <div className="p-6 md:p-8">
        {/* Abstract */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <BookOpenIcon className="w-5 h-5 text-primary-600" />
            Abstract
          </h3>
          <div className="prose prose-gray dark:prose-invert max-w-none">
            {publication.abstract.split('\n\n').map((paragraph) => (
              <p key={paragraph.slice(0, 50)} className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4 last:mb-0">
                {paragraph}
              </p>
            ))}
          </div>
        </div>

        {/* Keywords */}
        <div className="mb-8">
          <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
            Keywords
          </h3>
          <div className="flex flex-wrap gap-2">
            {publication.keywords.map((keyword) => (
              <span
                key={keyword}
                className="px-3 py-1.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 
                         text-sm rounded-lg border border-gray-200 dark:border-gray-700"
              >
                {keyword}
              </span>
            ))}
          </div>
        </div>

        {/* Citation */}
        <div className="mb-8 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
          <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
            How to Cite
          </h3>
          <p className="text-gray-600 dark:text-gray-300 text-sm font-mono">
            {publication.citation}
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4">
          <a
            href={`/api/download-research?id=${publication.id}`}
            download
            onClick={handleDownload}
            className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3.5 
                     bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-xl
                     transition-all duration-200 shadow-lg shadow-primary-600/25 hover:shadow-primary-600/40"
          >
            <ArrowDownTrayIcon className="w-5 h-5" />
            Download PDF (Free)
          </a>
          <button
            onClick={handleShare}
            className="inline-flex items-center justify-center gap-2 px-6 py-3.5 
                     bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 
                     text-gray-700 dark:text-gray-200 font-semibold rounded-xl
                     transition-all duration-200 border border-gray-200 dark:border-gray-700"
          >
            <ShareIcon className="w-5 h-5" />
            Share
          </button>
        </div>
      </div>
    </motion.article>
  );
}

export function ResearchPageContent() {
  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Header */}
      <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
            >
              <ArrowLeftIcon className="w-5 h-5" />
              <span className="font-medium">Back to Home</span>
            </Link>
            <div className="flex items-center gap-4">
              <Link href="/" className="hidden sm:block">
                <Image
                  src="/images/kofi-logo-transparent.png"
                  alt="Kofi Asiedu-Mahama"
                  width={120}
                  height={60}
                  className="h-10 w-auto dark:invert"
                />
              </Link>
              <ThemeToggle />
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 py-20 md:py-28">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }} />
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600/20 text-primary-300 rounded-full text-sm font-semibold mb-6">
              <AcademicCapIcon className="w-5 h-5" />
              Academic Research & Thought Leadership
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
              Research & Publications
            </h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
              Exploring the intersection of psychology, economics, and human potential. 
              Download and share these research papers freely to advance knowledge and understanding.
            </p>
          </motion.div>

          {/* Stats/Features */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto"
          >
            <div className="flex items-center justify-center gap-3 px-6 py-4 bg-white/5 rounded-xl border border-white/10">
              <DocumentTextIcon className="w-6 h-6 text-primary-400" />
              <span className="text-white font-medium">Peer-Reviewed Quality</span>
            </div>
            <div className="flex items-center justify-center gap-3 px-6 py-4 bg-white/5 rounded-xl border border-white/10">
              <ArrowDownTrayIcon className="w-6 h-6 text-green-400" />
              <span className="text-white font-medium">Free Downloads</span>
            </div>
            <div className="flex items-center justify-center gap-3 px-6 py-4 bg-white/5 rounded-xl border border-white/10">
              <LightBulbIcon className="w-6 h-6 text-gold-400" />
              <span className="text-white font-medium">Original Insights</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Publications List */}
      <section className="py-16 md:py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-8">
            {publications.map((publication) => (
              <PublicationCard key={publication.id} publication={publication} />
            ))}
          </div>

          {/* More Coming Soon */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mt-16 text-center"
          >
            <div className="inline-flex items-center gap-3 px-6 py-4 bg-gray-100 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
              <BeakerIcon className="w-6 h-6 text-primary-600 dark:text-primary-400" />
              <span className="text-gray-600 dark:text-gray-300 font-medium">
                More publications coming soon. Stay tuned!
              </span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Interested in More Insights?
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
            Explore my book on wealth psychology and sustainable financial success from a Ghanaian perspective.
          </p>
          <Link
            href="/book"
            className="inline-flex items-center gap-2 px-8 py-4 bg-primary-600 hover:bg-primary-700 
                     text-white font-semibold rounded-xl transition-all duration-200 
                     shadow-lg shadow-primary-600/25 hover:shadow-primary-600/40"
          >
            <BookOpenIcon className="w-5 h-5" />
            Explore The Book
          </Link>
        </div>
      </section>

      <Footer />
    </main>
  );
}
