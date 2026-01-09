'use client';

import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import Image from 'next/image';
import Link from 'next/link';
import {
  ArrowLeftIcon,
  BookOpenIcon,
  StarIcon,
  CheckCircleIcon,
  SparklesIcon,
  GlobeAltIcon,
  AcademicCapIcon,
  UserGroupIcon,
} from '@heroicons/react/24/solid';
import { ThemeToggle } from '@/components/ThemeToggle';
import { PaymentSection } from '@/components/PaymentSection';
import { Footer } from '@/components/Footer';

// Book features
const bookFeatures = [
  'Break inherited financial limitations and mental barriers',
  'Cultivate a wealth-oriented mindset anchored in purpose and resilience',
  'Align personal ambition with community development',
  'Transform income into enduring assets and legacy',
];

// Sustainable wealth model pillars
const wealthPillars = [
  {
    title: 'Disciplined Thinking',
    description: 'Master the mental frameworks that drive wealth creation',
    icon: AcademicCapIcon,
  },
  {
    title: 'Ethical Wealth Creation',
    description: 'Build prosperity through integrity and value creation',
    icon: SparklesIcon,
  },
  {
    title: 'Long-term Planning',
    description: 'Strategic approaches for sustainable financial growth',
    icon: GlobeAltIcon,
  },
  {
    title: 'Generational Impact',
    description: 'Create wealth that benefits future generations',
    icon: UserGroupIcon,
  },
];

// Why this book matters
const whyItMatters = [
  'Speaks directly to African realities, not imported financial clichés',
  'Combines psychology, culture, and wealth-building principles',
  'Offers a timeless framework for individuals and nations seeking lasting prosperity',
];

// Testimonials
const testimonials = [
  {
    id: 1,
    content:
      "This book transformed the way I think about wealth and success. Kofi's insights on the psychology of money are profound yet practical. A must-read for anyone seeking sustainable prosperity.",
    author: 'Emmauel Tagbor',
    role: 'Entrepreneur, Accra',
    rating: 5,
    avatar: 'E',
  },
  {
    id: 2,
    content:
      "Rarely do you find a book that speaks directly to the African context. 'The Psychology of Sustainable Wealth' did exactly that. I've read it multiple times and discover something new each time.",
    author: 'Julius Nanor',
    role: 'Business Leader, Kumasi',
    rating: 5,
    avatar: 'J',
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

export function BookPageContent() {
  const [heroRef, heroInView] = useInView({ triggerOnce: true, threshold: 0.1 });
  const [featuresRef, featuresInView] = useInView({ triggerOnce: true, threshold: 0.1 });
  const [pillarsRef, pillarsInView] = useInView({ triggerOnce: true, threshold: 0.1 });
  const [reviewsRef, reviewsInView] = useInView({ triggerOnce: true, threshold: 0.1 });

  return (
    <main className="min-h-screen bg-white dark:bg-gray-900">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-b border-gray-200/50 dark:border-gray-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link 
              href="/"
              className="inline-flex items-center gap-2 text-gray-700 dark:text-gray-200 hover:text-primary-600 dark:hover:text-primary-400 transition-colors font-medium"
            >
              <ArrowLeftIcon className="w-5 h-5" />
              <span>Back to Home</span>
            </Link>
            <div className="flex items-center gap-4">
              <Link
                href="#purchase"
                className="hidden sm:inline-flex btn-gold text-sm"
              >
                Get Your Copy
              </Link>
              <ThemeToggle />
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-20 md:pt-40 md:pb-32 bg-gradient-to-b from-gray-50 to-white dark:from-gray-950 dark:to-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            ref={heroRef}
            initial={{ opacity: 0 }}
            animate={heroInView ? { opacity: 1 } : {}}
            transition={{ duration: 0.8 }}
            className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center"
          >
            {/* Book Cover */}
            <div className="relative order-2 lg:order-1">
              <div className="relative max-w-md mx-auto">
                {/* Decorative elements */}
                <div className="absolute -inset-8 bg-gradient-to-r from-primary-500/20 via-gold-500/20 to-primary-500/20 rounded-3xl blur-3xl" />
                <div className="absolute -bottom-12 -right-12 w-64 h-64 bg-gold-200 dark:bg-gold-900/40 rounded-full filter blur-3xl opacity-70" />
                <div className="absolute -top-12 -left-12 w-48 h-48 bg-primary-200 dark:bg-primary-800/40 rounded-full filter blur-3xl opacity-70" />
                
                <motion.div 
                  className="relative aspect-[3/4] rounded-2xl shadow-2xl overflow-hidden ring-1 ring-black/10 dark:ring-white/10"
                  initial={{ scale: 0.9, rotateY: -10 }}
                  animate={heroInView ? { scale: 1, rotateY: 0 } : {}}
                  transition={{ duration: 1, delay: 0.2 }}
                >
                  <Image
                    src="/images/book-cover.jpeg"
                    alt="The Psychology of Sustainable Wealth - The Ghanaian Perspective"
                    fill
                    className="object-cover"
                    priority
                  />
                </motion.div>
              </div>
            </div>

            {/* Content */}
            <div className="order-1 lg:order-2">
              <motion.span 
                initial={{ opacity: 0, y: 20 }}
                animate={heroInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="inline-flex items-center gap-2 px-4 py-2 bg-gold-100 dark:bg-gold-900/30 text-gold-800 dark:text-gold-300 rounded-full text-sm font-semibold mb-6"
              >
                <BookOpenIcon className="w-4 h-4" />
                By Kofi Asiedu-Mahama
              </motion.span>

              <motion.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={heroInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="text-4xl md:text-5xl lg:text-6xl font-display font-bold text-gray-900 dark:text-white mb-4"
              >
                The Psychology of Sustainable Wealth
              </motion.h1>

              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={heroInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="text-2xl text-primary-600 dark:text-primary-400 font-medium mb-8"
              >
                The Ghanaian Perspective
              </motion.p>

              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={heroInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="text-lg text-gray-600 dark:text-gray-300 mb-8 leading-relaxed"
              >
                This book goes beyond conventional financial advice to explore the mental frameworks, 
                cultural beliefs, and behavioral patterns that determine why some individuals, families, 
                and societies create lasting wealth while others remain trapped in cycles of struggle.
              </motion.p>

              <motion.blockquote 
                initial={{ opacity: 0, y: 20 }}
                animate={heroInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: 0.5 }}
                className="text-xl text-gray-700 dark:text-gray-200 italic border-l-4 border-gold-500 pl-6 mb-10"
              >
                &ldquo;Wealth is not built by income alone—it is built by mindset, behavior, and values that endure.&rdquo;
              </motion.blockquote>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={heroInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: 0.6 }}
                className="flex flex-col sm:flex-row gap-4"
              >
                <a href="#purchase" className="btn-gold text-lg">
                  Get Your Copy
                </a>
                <a href="#learn-more" className="btn-secondary text-lg">
                  Learn More
                </a>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* About the Book */}
      <section id="learn-more" className="py-20 md:py-32 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            ref={featuresRef}
            initial={{ opacity: 0, y: 40 }}
            animate={featuresInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-display font-bold text-gray-900 dark:text-white mb-6">
              What You&apos;ll Discover
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Rooted in psychology and grounded in the Ghanaian and broader African context, 
              this book reveals how deeply held beliefs about money, success, risk, community, 
              and responsibility shape financial outcomes over a lifetime.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-16">
            {bookFeatures.map((feature, index) => (
              <motion.div
                key={feature}
                initial={{ opacity: 0, x: index % 2 === 0 ? -30 : 30 }}
                animate={featuresInView ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.6, delay: 0.1 * index }}
                className="flex items-start gap-4 p-6 rounded-2xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700"
              >
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900/50 flex items-center justify-center">
                  <CheckCircleIcon className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                </div>
                <p className="text-lg text-gray-700 dark:text-gray-200">{feature}</p>
              </motion.div>
            ))}
          </div>

          {/* Why it matters */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={featuresInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="max-w-4xl mx-auto"
          >
            <div className="bg-gradient-to-r from-primary-900 to-primary-950 dark:from-primary-950 dark:to-black rounded-3xl p-8 md:p-12">
              <h3 className="text-2xl md:text-3xl font-display font-bold text-white mb-8 text-center">
                Why This Book Matters
              </h3>
              <div className="grid md:grid-cols-3 gap-6">
                {whyItMatters.map((item, index) => (
                  <div key={item} className="text-center">
                    <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center mx-auto mb-4">
                      <span className="text-2xl font-bold text-gold-400">{index + 1}</span>
                    </div>
                    <p className="text-primary-100">{item}</p>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* The Sustainable Wealth Model */}
      <section className="py-20 md:py-32 bg-gray-50 dark:bg-gray-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            ref={pillarsRef}
            initial={{ opacity: 0, y: 40 }}
            animate={pillarsInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-display font-bold text-gray-900 dark:text-white mb-6">
              The Sustainable Wealth Model
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Rather than promoting quick wins or speculative thinking, the book presents a 
              sustainable wealth model that balances these four essential pillars.
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {wealthPillars.map((pillar, index) => (
              <motion.div
                key={pillar.title}
                initial={{ opacity: 0, y: 30 }}
                animate={pillarsInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: 0.1 * index }}
                className="text-center p-8 rounded-3xl bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl transition-shadow border border-gray-100 dark:border-gray-700"
              >
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center mx-auto mb-6">
                  <pillar.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                  {pillar.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {pillar.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Key Quote */}
      <section className="py-20 md:py-32 bg-white dark:bg-gray-900">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative"
          >
            <div className="absolute -inset-4 bg-gradient-to-r from-gold-500/20 via-primary-500/20 to-gold-500/20 rounded-3xl blur-2xl" />
            <div className="relative bg-gradient-to-br from-gray-900 to-gray-950 dark:from-black dark:to-gray-900 rounded-3xl p-10 md:p-16 text-center">
              <p className="text-2xl md:text-3xl lg:text-4xl font-display font-bold text-white leading-relaxed mb-8">
                &ldquo;This book is not just for investors or entrepreneurs—it is for professionals, leaders, 
                families, young people, and policymakers who understand that Africa&apos;s greatest 
                untapped resource is not money, but how we think about money.&rdquo;
              </p>
              <div className="w-24 h-1 bg-gold-500 mx-auto mb-8" />
              <p className="text-xl text-primary-200">
                Move from survival to strategy, from consumption to creation, <br className="hidden md:inline" />
                and from short-term gains to generational prosperity.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 md:py-32 bg-gray-50 dark:bg-gray-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            ref={reviewsRef}
            initial={{ opacity: 0, y: 40 }}
            animate={reviewsInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-display font-bold text-gray-900 dark:text-white mb-6">
              What Readers Are Saying
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              Join thousands of readers whose lives have been transformed
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={testimonial.id}
                initial={{ opacity: 0, y: 30 }}
                animate={reviewsInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: 0.1 * index }}
                className="p-8 rounded-3xl bg-white dark:bg-gray-800 shadow-lg border border-gray-100 dark:border-gray-700"
              >
                <StarRating rating={testimonial.rating} />
                <p className="text-gray-700 dark:text-gray-300 mt-6 mb-8 leading-relaxed text-lg">
                  &ldquo;{testimonial.content}&rdquo;
                </p>
                <div className="flex items-center gap-4 pt-6 border-t border-gray-100 dark:border-gray-700">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center">
                    <span className="text-white font-bold text-xl">
                      {testimonial.avatar}
                    </span>
                  </div>
                  <div>
                    <p className="font-bold text-gray-900 dark:text-white text-lg">
                      {testimonial.author}
                    </p>
                    <p className="text-gray-500 dark:text-gray-400">
                      {testimonial.role}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Purchase Section */}
      <div id="purchase">
        <PaymentSection />
      </div>

      <Footer />
    </main>
  );
}
