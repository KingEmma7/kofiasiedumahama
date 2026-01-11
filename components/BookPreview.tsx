'use client';

import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import Image from 'next/image';
import Link from 'next/link';
import { BookOpenIcon, ArrowRightIcon } from '@heroicons/react/24/solid';

export function BookPreview() {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.2,
  });

  return (
    <section
      id="book"
      className="section-padding bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-950 overflow-hidden"
      aria-labelledby="book-heading"
    >
      <div className="section-container">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 40 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center"
        >
          {/* Book cover with elegant presentation */}
          <div className="relative order-2 lg:order-1">
            <div className="relative max-w-sm mx-auto lg:mx-0">
              {/* Decorative elements */}
              <div className="absolute -inset-4 bg-gradient-to-r from-primary-500/20 via-gold-500/20 to-primary-500/20 rounded-3xl blur-2xl" />
              <div className="absolute -bottom-8 -right-8 w-48 h-48 bg-gold-200 dark:bg-gold-900/30 rounded-full filter blur-3xl opacity-60" />
              <div className="absolute -top-8 -left-8 w-32 h-32 bg-primary-200 dark:bg-primary-800/30 rounded-full filter blur-2xl opacity-60" />
              
              {/* Book image with subtle animation */}
              <motion.div 
                className="relative aspect-[3/4] rounded-2xl shadow-2xl overflow-hidden ring-1 ring-black/5 dark:ring-white/10"
                whileHover={{ 
                  scale: 1.02,
                  rotateY: 5,
                }}
                transition={{ duration: 0.4 }}
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
          <div className="order-1 lg:order-2 text-center lg:text-left">
            <motion.span 
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-gold-100 dark:bg-gold-900/30 text-gold-800 dark:text-gold-300 rounded-full text-sm font-semibold mb-6"
            >
              <BookOpenIcon className="w-4 h-4" />
              New Release
            </motion.span>

            <motion.h2 
              id="book-heading" 
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="heading-lg text-gray-900 dark:text-white mb-4"
            >
              The Psychology of Sustainable Wealth
            </motion.h2>

            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="text-xl text-primary-600 dark:text-primary-400 font-medium mb-6"
            >
              The Ghanaian Perspective
            </motion.p>

            <motion.blockquote 
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="text-lg md:text-xl text-gray-600 dark:text-gray-300 italic mb-8 border-l-4 border-gold-500 pl-6"
            >
              &ldquo;Wealth is not built by income alone—it is built by mindset, behavior, and values that endure.&rdquo;
            </motion.blockquote>

            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="text-gray-600 dark:text-gray-400 mb-10 max-w-xl mx-auto lg:mx-0"
            >
              A groundbreaking exploration of wealth creation rooted in psychology and the African context. Discover the mental frameworks that separate those who build lasting wealth from those who remain trapped in cycles of struggle.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
            >
              <Link 
                href="/book"
                className="btn-gold inline-flex items-center gap-3 text-lg group"
              >
                Learn More
                <ArrowRightIcon className="w-5 h-5 transition-transform group-hover:translate-x-1" />
              </Link>
              <button
                onClick={() => {
                  const paymentSection = document.getElementById('payment');
                  if (paymentSection) {
                    const offset = 80;
                    const elementPosition = paymentSection.getBoundingClientRect().top;
                    const offsetPosition = elementPosition + window.pageYOffset - offset;
                    window.scrollTo({
                      top: offsetPosition,
                      behavior: 'smooth',
                    });
                  }
                }}
                className="btn-primary inline-flex items-center gap-3 text-lg group"
                aria-label="Scroll to payment section to buy the book"
              >
                Buy Now
                <ArrowRightIcon className="w-5 h-5 transition-transform group-hover:translate-x-1" />
              </button>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
