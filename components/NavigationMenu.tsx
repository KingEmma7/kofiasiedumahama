'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { XMarkIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';

interface NavigationMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

const navigationLinks = [
  { name: 'About', href: '#about', id: 'about', isAnchor: true },
  { name: 'The Book', href: '/book', id: 'book', isAnchor: false },
  { name: 'Newsletter', href: '#newsletter', id: 'newsletter', isAnchor: true },
  { name: 'Connect', href: '#social', id: 'social', isAnchor: true },
];

export function NavigationMenu({ isOpen, onClose }: NavigationMenuProps) {
  const handleAnchorClick = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
            onClick={onClose}
            aria-hidden="true"
          />

          {/* Menu Panel - slides in from right */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 h-full w-full max-w-md bg-gray-50 dark:bg-gray-900 shadow-2xl z-50 overflow-y-auto"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-800">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Navigation
              </h2>
              <button
                onClick={onClose}
                className="p-2 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
                aria-label="Close menu"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>

            {/* Navigation Links */}
            <nav className="p-6" aria-label="Main navigation">
              <ul className="space-y-2">
                {navigationLinks.map((link, index) => (
                  <motion.li
                    key={link.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1, duration: 0.3 }}
                  >
                    {link.isAnchor ? (
                      <button
                        onClick={() => handleAnchorClick(link.id)}
                        className="w-full text-left px-4 py-4 text-lg font-medium text-gray-700 dark:text-gray-200 
                                 hover:bg-primary-50 dark:hover:bg-primary-950/30 
                                 hover:text-primary-600 dark:hover:text-primary-400
                                 rounded-lg transition-all duration-200
                                 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                      >
                        {link.name}
                      </button>
                    ) : (
                      <Link
                        href={link.href}
                        onClick={onClose}
                        className="block px-4 py-4 text-lg font-medium text-gray-700 dark:text-gray-200 
                                 hover:bg-primary-50 dark:hover:bg-primary-950/30 
                                 hover:text-primary-600 dark:hover:text-primary-400
                                 rounded-lg transition-all duration-200
                                 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                      >
                        {link.name}
                      </Link>
                    )}
                  </motion.li>
                ))}
              </ul>
            </nav>

            {/* Footer info */}
            <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-950">
              <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
                Kofi Asiedu-Mahama
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
