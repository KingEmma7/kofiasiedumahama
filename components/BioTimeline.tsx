'use client';

import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import {
  AcademicCapIcon,
  BookOpenIcon,
  GlobeAltIcon,
  LightBulbIcon,
  StarIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline';

interface TimelineEvent {
  year: string;
  title: string;
  location: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}

const timelineEvents: TimelineEvent[] = [
  {
    year: '1992',
    title: 'Born in Ghana',
    location: 'Accra, Ghana',
    description:
      'Born into a family that valued education, hard work, and community. These early years shaped my understanding of resilience and the power of dreams.',
    icon: SparklesIcon,
  },
  {
    year: '2010',
    title: 'Pursuit of Education',
    location: 'University Years',
    description:
      'Embarked on a journey of higher education, exploring the realms of business, philosophy, and personal development that would later influence my writing.',
    icon: AcademicCapIcon,
  },
  {
    year: '2015',
    title: 'The Turning Point',
    location: 'A New Beginning',
    description:
      'Faced significant challenges that tested my resolve. This period of reflection and growth became the foundation for my philosophy on purpose-driven living.',
    icon: LightBulbIcon,
  },
  {
    year: '2020',
    title: 'Writing "The Path to Purpose"',
    location: 'Creative Journey',
    description:
      'After years of experiences, lessons, and insights, I began writing the book that would encapsulate my journey and provide a roadmap for others seeking their purpose.',
    icon: BookOpenIcon,
  },
  {
    year: '2024',
    title: 'Global Impact',
    location: 'Worldwide',
    description:
      'Today, my work reaches people across continents. Through speaking engagements, the book, and online platforms, I continue to inspire transformation in lives around the world.',
    icon: GlobeAltIcon,
  },
];

function TimelineItem({
  event,
  index,
  isLast,
}: {
  event: TimelineEvent;
  index: number;
  isLast: boolean;
}) {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.2,
  });

  const isEven = index % 2 === 0;
  const Icon = event.icon;

  return (
    <div
      ref={ref}
      className={`relative flex items-center ${
        isEven ? 'md:flex-row' : 'md:flex-row-reverse'
      } flex-row`}
    >
      {/* Content card */}
      <motion.div
        initial={{ opacity: 0, x: isEven ? -50 : 50 }}
        animate={inView ? { opacity: 1, x: 0 } : {}}
        transition={{ duration: 0.6, delay: 0.2 }}
        className={`w-full md:w-5/12 ${
          isEven ? 'md:pr-12 md:text-right' : 'md:pl-12 md:text-left'
        } pl-16 md:pl-0`}
      >
        <div className="card card-hover p-6 md:p-8">
          {/* Year badge */}
          <span className="inline-block px-4 py-1 bg-primary-100 dark:bg-primary-900/30 text-primary-800 dark:text-primary-300 rounded-full text-sm font-semibold mb-4">
            {event.year}
          </span>

          {/* Title */}
          <h3 className="heading-md text-gray-900 dark:text-white mb-2">
            {event.title}
          </h3>

          {/* Location */}
          <p className="text-primary-600 dark:text-primary-400 font-medium text-sm uppercase tracking-wider mb-4">
            {event.location}
          </p>

          {/* Description */}
          <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
            {event.description}
          </p>
        </div>
      </motion.div>

      {/* Center timeline */}
      <div className="absolute left-0 md:left-1/2 flex items-center justify-center">
        {/* Line */}
        {!isLast && (
          <div className="absolute top-16 left-6 md:left-1/2 w-0.5 h-full bg-gradient-to-b from-primary-500 to-primary-200 dark:from-primary-600 dark:to-primary-900 -translate-x-1/2" />
        )}

        {/* Icon circle */}
        <motion.div
          initial={{ scale: 0 }}
          animate={inView ? { scale: 1 } : {}}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="relative z-10 w-12 h-12 bg-primary-900 dark:bg-primary-600 rounded-full flex items-center justify-center shadow-lg ring-4 ring-white dark:ring-gray-900"
        >
          <Icon className="w-6 h-6 text-white" />
        </motion.div>
      </div>

      {/* Empty space for the other side */}
      <div className="hidden md:block w-5/12" />
    </div>
  );
}

export function BioTimeline() {
  const [headerRef, headerInView] = useInView({
    triggerOnce: true,
    threshold: 0.2,
  });

  return (
    <section
      id="timeline"
      className="section-padding bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-950"
      aria-labelledby="timeline-heading"
    >
      <div className="section-container">
        {/* Section header */}
        <motion.div
          ref={headerRef}
          initial={{ opacity: 0, y: 30 }}
          animate={headerInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16 md:mb-24"
        >
          <span className="inline-block px-4 py-2 bg-primary-100 dark:bg-primary-900/30 text-primary-800 dark:text-primary-300 rounded-full text-sm font-semibold mb-6 uppercase tracking-wider">
            My Journey
          </span>
          <h2 id="timeline-heading" className="heading-lg text-gray-900 dark:text-white mb-6">
            From Humble Beginnings
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Every step of my journey has shaped who I am today and the message I share with the world.
          </p>
        </motion.div>

        {/* Timeline */}
        <div className="relative">
          {/* Desktop center line */}
          <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary-200 via-primary-500 to-primary-200 dark:from-primary-900 dark:via-primary-600 dark:to-primary-900 -translate-x-1/2" />

          {/* Mobile left line */}
          <div className="md:hidden absolute left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary-200 via-primary-500 to-primary-200 dark:from-primary-900 dark:via-primary-600 dark:to-primary-900" />

          {/* Timeline events */}
          <div className="space-y-12 md:space-y-24">
            {timelineEvents.map((event, index) => (
              <TimelineItem
                key={event.year}
                event={event}
                index={index}
                isLast={index === timelineEvents.length - 1}
              />
            ))}
          </div>
        </div>

        {/* Call to action */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mt-16 md:mt-24"
        >
          <p className="text-lg text-gray-600 dark:text-gray-300 mb-6">
            Ready to start your own journey of transformation?
          </p>
          <a
            href="#book"
            className="btn-primary"
          >
            Explore the Book
          </a>
        </motion.div>
      </div>
    </section>
  );
}

