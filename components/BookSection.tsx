'use client';

import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import Image from 'next/image';
import {
  StarIcon,
  BookOpenIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/solid';
import { BookInfoAccordion } from './BookInfoAccordion';

// Book features based on the new content
const bookFeatures = [
  'Break inherited financial limitations and mental barriers',
  'Cultivate a wealth-oriented mindset anchored in purpose and resilience',
  'Align personal ambition with community development',
  'Transform income into enduring assets and legacy',
];

// Sustainable wealth model pillars
const wealthPillars = [
  'Disciplined thinking',
  'Ethical wealth creation',
  'Long-term planning',
  'Generational impact',
];

// Why this book matters
const whyItMatters = [
  'Speaks directly to African realities, not imported financial clichés',
  'Combines psychology, culture, and wealth-building principles',
  'Offers a timeless framework for individuals and nations seeking lasting prosperity',
];

// Testimonials/Reviews
const testimonials = [
  {
    id: 1,
    content:
      "This book transformed the way I think about wealth and success. Kofi's insights on the psychology of money are profound yet practical. A must-read for anyone seeking sustainable prosperity.",
    author: 'Emmauel Tagbor',
    role: 'Entrepreneur, Accra',
    rating: 5,
    avatar: 'A',
  },
  {
    id: 2,
    content:
      "Rarely do you find a book that speaks directly to the African context. 'The Psychology of Sustainable Wealth' did exactly that. I've read it multiple times and discover something new each time.",
    author: 'Julius Nanor',
    role: 'Business Leader, Kumasi',
    rating: 5,
    avatar: 'K',
  },
  {
    id: 3,
    content:
      "Kofi's approach to wealth psychology is groundbreaking. This book is not just for investors—it's for anyone who understands that Africa's greatest resource is how we think about money.",
    author: 'Fatima Ibrahim',
    role: 'Author & Speaker, Lagos',
    rating: 5,
    avatar: 'F',
  },
];

function StarRating({ rating }: { readonly rating: number }) {
  const stars = Array.from({ length: 5 }, (_, i) => i);
  return (
    <div className="flex gap-1">
      {stars.map((index) => (
        <StarIcon
          key={`star-${index}`}
          className={`w-5 h-5 ${
            index < rating
              ? 'text-gold-500'
              : 'text-gray-300 dark:text-gray-600'
          }`}
        />
      ))}
    </div>
  );
}

export function BookSection() {
  const [headerRef, headerInView] = useInView({
    triggerOnce: true,
    threshold: 0.2,
  });

  const [bookRef, bookInView] = useInView({
    triggerOnce: true,
    threshold: 0.2,
  });

  const [reviewsRef, reviewsInView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  return (
    <section
      id="book"
      className="section-padding bg-gray-50 dark:bg-gray-900"
      aria-labelledby="book-heading"
    >
      <div className="section-container">
        {/* Section header */}
        <motion.div
          ref={headerRef}
          initial={{ opacity: 0, y: 30 }}
          animate={headerInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="inline-flex items-center gap-2 px-4 py-2 bg-gold-100 dark:bg-gold-900/30 text-gold-800 dark:text-gold-300 rounded-full text-sm font-semibold mb-6">
            <BookOpenIcon className="w-4 h-4" />
            The Book
          </span>
          <h2 id="book-heading" className="heading-lg text-gray-900 dark:text-white mb-6">
            The Psychology of Sustainable Wealth
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto mb-4">
            The Ghanaian Perspective
          </p>
          <p className="text-lg text-gray-500 dark:text-gray-400 max-w-3xl mx-auto italic">
            Wealth is not built by income alone, it is built by mindset, behavior, and values that endure.
          </p>
        </motion.div>

        {/* Book showcase and description */}
        <motion.div
          ref={bookRef}
          initial={{ opacity: 0, y: 40 }}
          animate={bookInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-start mb-20"
        >
          {/* Book cover with infinite swivel */}
          <div className="relative order-2 lg:order-1">
            <div className="relative max-w-md mx-auto">
              <motion.div 
                className="relative aspect-[3/4] rounded-lg shadow-2xl overflow-hidden"
                animate={{ 
                  rotate: [2, -2, 2],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                <Image
                  src="/images/book-cover.jpeg"
                  alt="The Psychology of Sustainable Wealth - The Ghanaian Perspective"
                  fill
                  className="object-cover"
                />
              </motion.div>
              <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-gold-200 dark:bg-gold-900/30 rounded-full filter blur-2xl -z-10" />
              <div className="absolute -top-6 -left-6 w-24 h-24 bg-primary-200 dark:bg-primary-800/30 rounded-full filter blur-2xl -z-10" />
            </div>
          </div>

          {/* Description */}
          <div className="order-1 lg:order-2 space-y-6">
            <div>
              <h3 className="heading-md text-gray-900 dark:text-white mb-4">
                About the Book
              </h3>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
                <strong>The Psychology of Sustainable Wealth</strong> goes beyond conventional financial advice to explore the mental frameworks, cultural beliefs, and behavioral patterns that determine why some individuals, families, and societies create lasting wealth while others remain trapped in cycles of struggle.
              </p>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                Rooted in psychology and grounded in the Ghanaian and broader African context, this book reveals how deeply held beliefs about money, success, risk, community, and responsibility shape financial outcomes over a lifetime.
              </p>
            </div>

            {/* Sustainable Wealth Model */}
            <div className="bg-primary-50 dark:bg-primary-950/30 rounded-xl p-6">
              <h4 className="font-semibold text-gray-900 dark:text-white mb-3">
                The Sustainable Wealth Model
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                Rather than promoting quick wins or speculative thinking, the book presents a sustainable wealth model, one that balances:
              </p>
              <ul className="space-y-2">
                {wealthPillars.map((pillar, index) => (
                  <li key={pillar} className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-200">
                    <CheckCircleIcon className="w-5 h-5 text-primary-600 dark:text-primary-400 flex-shrink-0 mt-0.5" />
                    <span>{pillar}</span>
                  </li>
                ))}
              </ul>
            </div>

            <a href="#payment" className="btn-gold inline-flex items-center">
              Get Your Copy Now
              <svg className="ml-2 w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </a>
          </div>
        </motion.div>

        {/* Key Quote */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-20"
        >
          <div className="max-w-4xl mx-auto bg-gradient-to-r from-primary-900 to-primary-950 dark:from-primary-950 dark:to-black rounded-2xl p-8 md:p-12 text-center">
            <p className="text-2xl md:text-3xl font-display font-bold text-white mb-6 leading-relaxed">
              &ldquo;This book is not just for investors or entrepreneurs, it is for professionals, leaders, families, young people, and policymakers who understand that Africa&apos;s greatest untapped resource is not money, but how we think about money.&rdquo;
            </p>
            <p className="text-xl text-primary-200 font-medium">
              Move from survival to strategy, from consumption to creation, and from short-term gains to generational prosperity.
            </p>
          </div>
        </motion.div>

        {/* Book Info Accordion */}
        <BookInfoAccordion 
          bookFeatures={bookFeatures}
          whyItMatters={whyItMatters}
        />

        {/* Testimonials */}
        <motion.div
          ref={reviewsRef}
          initial={{ opacity: 0, y: 30 }}
          animate={reviewsInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          <div className="text-center mb-12">
            <h3 className="heading-md text-gray-900 dark:text-white mb-4">
              What Readers Are Saying
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Join thousands of readers whose lives have been transformed
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={testimonial.id}
                initial={{ opacity: 0, y: 30 }}
                animate={reviewsInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: 0.1 * index }}
                className="card p-6 md:p-8"
              >
                <StarRating rating={testimonial.rating} />
                <p className="text-gray-700 dark:text-gray-300 mt-4 mb-6 leading-relaxed">
                  &ldquo;{testimonial.content}&rdquo;
                </p>
                <div className="flex items-center gap-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                  <div className="w-12 h-12 rounded-full bg-primary-100 dark:bg-primary-900/50 flex items-center justify-center">
                    <span className="text-primary-700 dark:text-primary-300 font-bold text-lg">
                      {testimonial.avatar}
                    </span>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {testimonial.author}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {testimonial.role}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
