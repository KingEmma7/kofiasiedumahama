'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/outline';
import { CheckCircleIcon } from '@heroicons/react/24/solid';

interface AccordionItemProps {
  title: string;
  content: string[];
  isOpen: boolean;
  onToggle: () => void;
  index: number;
}

function AccordionItem({ title, content, isOpen, onToggle, index }: AccordionItemProps) {
  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full px-6 py-4 flex items-center justify-between bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-left"
      >
        <h4 className="text-lg font-semibold text-gray-900 dark:text-white pr-4">
          {title}
        </h4>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.3 }}
        >
          {isOpen ? (
            <ChevronUpIcon className="w-5 h-5 text-primary-600 dark:text-primary-400 flex-shrink-0" />
          ) : (
            <ChevronDownIcon className="w-5 h-5 text-gray-400 flex-shrink-0" />
          )}
        </motion.div>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="px-6 py-4 bg-gray-50 dark:bg-gray-900/50">
              <ul className="space-y-3">
                {content.map((item, idx) => (
                  <motion.li
                    key={idx}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="flex items-start gap-3"
                  >
                    <CheckCircleIcon className="w-5 h-5 text-primary-600 dark:text-primary-400 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700 dark:text-gray-300">{item}</span>
                  </motion.li>
                ))}
              </ul>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

interface BookInfoAccordionProps {
  readonly bookFeatures: readonly string[];
  readonly whyItMatters: readonly string[];
}

export function BookInfoAccordion({ bookFeatures, whyItMatters }: BookInfoAccordionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(0); // First accordion open by default

  const accordionItems = [
    {
      title: 'What Readers Will Discover',
      content: bookFeatures,
    },
    {
      title: 'Why This Book Matters',
      content: whyItMatters,
    },
  ];

  const toggleAccordion = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className="mb-20"
    >
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h3 className="heading-md text-gray-900 dark:text-white mb-4">
            Discover the Value
          </h3>
          <p className="text-lg text-gray-600 dark:text-gray-300 italic">
            This is not a finance book. It is a mindset blueprint for sustainable prosperity.
          </p>
        </div>
        <div className="grid md:grid-cols-2 gap-6">
          {accordionItems.map((item, index) => (
            <AccordionItem
              key={item.title}
              title={item.title}
              content={item.content}
              isOpen={openIndex === index}
              onToggle={() => toggleAccordion(index)}
              index={index}
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
}
