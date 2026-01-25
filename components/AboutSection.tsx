'use client';

import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import Image from 'next/image';
import {
  BookOpenIcon,
  AcademicCapIcon,
} from '@heroicons/react/24/outline';
import Link from 'next/link';

export function AboutSection() {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.2,
  });

  return (
    <section
      id="about"
      className="section-padding bg-gray-50 dark:bg-gray-900"
      aria-labelledby="about-heading"
    >
      <div className="section-container">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Image side */}
          <motion.div
            ref={ref}
            initial={{ opacity: 0, x: -50 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8 }}
            className="relative"
          >
            <div className="relative aspect-[4/5] rounded-2xl overflow-hidden shadow-2xl">
              <Image
                src="/images/kofi-book-coming.png"
                alt="Kofi Asiedu-Mahama"
                fill
                className="object-cover"
              />
            </div>
            {/* Decorative elements */}
            <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-gold-200 dark:bg-gold-900/30 rounded-full filter blur-3xl -z-10" />
            <div className="absolute -top-6 -left-6 w-24 h-24 bg-primary-200 dark:bg-primary-800/30 rounded-full filter blur-3xl -z-10" />
          </motion.div>

          {/* Content side */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <span className="inline-block px-4 py-2 bg-primary-100 dark:bg-primary-900/30 text-primary-800 dark:text-primary-300 rounded-full text-sm font-semibold mb-6 uppercase tracking-wider">
              About the Author
            </span>
            
            <h2 id="about-heading" className="heading-lg text-gray-900 dark:text-white mb-6">
              Meet <br />
              <span className="text-primary-600 dark:text-primary-400">Kofi Asiedu-Mahama</span>
            </h2>

            <div className="space-y-4 text-gray-600 dark:text-gray-300 leading-relaxed">
              <p className="text-lg">
                Kofi Asiedu-Mahama is a thought leader, author, and wealth psychology expert dedicated to transforming how Ghanaians and Africans approach financial success and sustainable wealth creation.
              </p>
              
              <p>
                With years of research and real-world experience, Kofi bridges the gap between traditional wisdom and modern financial principles, offering a uniquely Ghanaian perspective on building and maintaining lasting wealth.
              </p>

              <p>
                His work focuses on the psychological barriers and cultural nuances that impact financial decision-making in Ghana, providing practical strategies for individuals and businesses seeking sustainable prosperity.
              </p>
            </div>

            {/* Key highlights */}
            <div className="mt-8 grid sm:grid-cols-2 gap-6">
              {[
                {
                  icon: BookOpenIcon,
                  title: 'Published Author',
                  description: 'Expert on wealth psychology',
                },
                {
                  icon: AcademicCapIcon,
                  title: 'Thought Leader',
                  description: 'Speaking & consulting',
                },
              ].map((item, index) => (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={inView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.6, delay: 0.4 + index * 0.1 }}
                  className="flex gap-4"
                >
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                      <item.icon className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                      {item.title}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {item.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* CTA */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="mt-8 flex flex-col sm:flex-row flex-wrap gap-4"
            >
              <a href="#book" className="btn-primary">
                Discover His Book
              </a>
              <Link href="/about" className="btn-secondary">
                Learn More About Kofi
              </Link>
              <Link href="/research" className="btn-secondary">
                My Research Papers
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

