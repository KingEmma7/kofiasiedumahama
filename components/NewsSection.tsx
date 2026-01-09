'use client';

import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import Image from 'next/image';
import {
  NewspaperIcon,
  CalendarIcon,
  ArrowRightIcon,
} from '@heroicons/react/24/outline';

// News/Updates data - replace with actual content
const newsArticles = [
  {
    id: 1,
    title: 'Speaking at the Africa Leadership Conference 2025',
    summary:
      'Excited to announce my keynote speech on "Purpose-Driven Leadership" at the upcoming Africa Leadership Conference in Accra.',
    date: 'January 15, 2025',
    category: 'Events',
    image: null, // Add image path when available
    link: '#',
  },
  {
    id: 2,
    title: 'The Path to Purpose Hits 10,000 Copies Sold',
    summary:
      'Grateful for the incredible response to the book. Thank you to every reader who has joined this journey of transformation.',
    date: 'December 20, 2024',
    category: 'Milestone',
    image: null,
    link: '#',
  },
  {
    id: 3,
    title: 'New Chapter Available: Finding Clarity in Chaos',
    summary:
      'A bonus chapter exploring how to maintain focus and purpose during uncertain times. Free for all book owners.',
    date: 'November 28, 2024',
    category: 'Content',
    image: null,
    link: '#',
  },
];

function NewsCard({
  article,
  index,
}: {
  article: (typeof newsArticles)[0];
  index: number;
}) {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  return (
    <motion.article
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      className="card card-hover group"
    >
      {/* Image placeholder */}
      <div className="relative h-48 bg-gradient-to-br from-primary-100 to-primary-200 dark:from-primary-900 dark:to-primary-800 overflow-hidden">
        {article.image ? (
          <Image
            src={article.image}
            alt={article.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <NewspaperIcon className="w-16 h-16 text-primary-400 dark:text-primary-600" />
          </div>
        )}
        {/* Category badge */}
        <span className="absolute top-4 left-4 px-3 py-1 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm rounded-full text-xs font-semibold text-primary-700 dark:text-primary-300">
          {article.category}
        </span>
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Date */}
        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-3">
          <CalendarIcon className="w-4 h-4" />
          {article.date}
        </div>

        {/* Title */}
        <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-3 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors line-clamp-2">
          {article.title}
        </h3>

        {/* Summary */}
        <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed mb-4 line-clamp-3">
          {article.summary}
        </p>

        {/* Read more link */}
        <a
          href={article.link}
          className="inline-flex items-center gap-2 text-primary-600 dark:text-primary-400 font-medium text-sm group-hover:gap-3 transition-all"
        >
          Read More
          <ArrowRightIcon className="w-4 h-4" />
        </a>
      </div>
    </motion.article>
  );
}

// Twitter/X Embed placeholder component
function SocialEmbed() {
  return (
    <div className="card p-6 text-center">
      <h4 className="font-semibold text-gray-900 dark:text-white mb-4">
        Follow on X (Twitter)
      </h4>
      <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">
        Stay updated with the latest insights and announcements
      </p>
      {/* Replace with actual Twitter embed or timeline widget */}
      <a
        href="https://twitter.com/kofiasiedumahama" // Update with actual handle
        target="_blank"
        rel="noopener noreferrer"
        className="btn-secondary text-sm py-2 px-4"
      >
        @kofiasiedumahama
      </a>
      {/* 
      To embed Twitter timeline, add this script to layout.tsx:
      <script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script>
      
      Then use:
      <a 
        className="twitter-timeline" 
        data-height="400"
        data-theme="light"
        href="https://twitter.com/kofiasiedumahama"
      >
        Tweets by kofiasiedumahama
      </a>
      */}
    </div>
  );
}

export function NewsSection() {
  const [headerRef, headerInView] = useInView({
    triggerOnce: true,
    threshold: 0.2,
  });

  return (
    <section
      id="news"
      className="section-padding bg-gray-50 dark:bg-gray-950"
      aria-labelledby="news-heading"
    >
      <div className="section-container">
        {/* Section header */}
        <motion.div
          ref={headerRef}
          initial={{ opacity: 0, y: 30 }}
          animate={headerInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <span className="inline-flex items-center gap-2 px-4 py-2 bg-primary-100 dark:bg-primary-900/30 text-primary-800 dark:text-primary-300 rounded-full text-sm font-semibold mb-6">
            <NewspaperIcon className="w-4 h-4" />
            News & Updates
          </span>
          <h2 id="news-heading" className="heading-lg text-gray-900 dark:text-white mb-4">
            Latest from the Journey
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Stay connected with announcements, events, and new content
          </p>
        </motion.div>

        {/* News grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {newsArticles.map((article, index) => (
            <NewsCard key={article.id} article={article} index={index} />
          ))}
        </div>

        {/* Social embed section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-md mx-auto"
        >
          <SocialEmbed />
        </motion.div>
      </div>
    </section>
  );
}

