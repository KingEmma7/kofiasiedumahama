'use client';

import { useState, useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ChevronDownIcon, Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';
import { ThemeToggle } from './ThemeToggle';
import { HeroCarousel } from './HeroCarousel';
import { NavigationMenu } from './NavigationMenu';
import Image from 'next/image';

export function Hero() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end start'],
  });

  // Parallax effects
  const overlayOpacity = useTransform(scrollYProgress, [0, 0.5], [0.6, 0.3]);

  const scrollToAbout = () => {
    const element = document.getElementById('about');
    if (element) {
      const offset = 80;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      });
    }
    setIsMenuOpen(false);
  };

  return (
    <>
      {/* Skip to content link for accessibility */}
      <a
        href="#about"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-1/2 focus:-translate-x-1/2 focus:z-[100] focus:px-6 focus:py-3 focus:bg-primary-600 focus:text-white focus:rounded-lg focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-primary-400 focus:ring-offset-2"
        onClick={(e) => {
          e.preventDefault();
          document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' });
        }}
      >
        Skip to main content
      </a>
      <section
        ref={containerRef}
        className="relative min-h-screen flex items-end justify-center overflow-hidden"
        aria-label="Hero section"
      >
      {/* Auto-rotating carousel background */}
      <HeroCarousel 
        scrollYProgress={scrollYProgress}
        overlayOpacity={overlayOpacity}
      />

      {/* Logo - enlarged */}
      <div className="absolute top-6 left-6 z-50">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Image
            src="/images/kofi-logo-transparent.png"
            alt="Kofi Asiedu-Mahama Logo"
            width={360}
            height={180}
            className="w-auto h-24 sm:h-24 md:h-40"
          />
        </motion.div>
      </div>

      {/* Hamburger menu and Theme toggle */}
      <div className="absolute top-6 right-6 z-50 flex items-center gap-4">
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="p-2 rounded-lg bg-white/10 dark:bg-gray-900/20 backdrop-blur-sm 
                     text-white hover:bg-white/20 dark:hover:bg-gray-800/30 
                     border border-white/20 dark:border-gray-700/50
                     transition-all duration-200 shadow-lg"
          aria-label="Toggle navigation menu"
          aria-expanded={isMenuOpen}
        >
          {isMenuOpen ? (
            <XMarkIcon className="w-6 h-6" />
          ) : (
            <Bars3Icon className="w-6 h-6" />
          )}
        </button>
        <ThemeToggle />
      </div>

      {/* Navigation Menu - slides in from right */}
      <NavigationMenu isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />

      {/* Author name overlay at bottom */}
      <motion.div
        className="relative z-20 pb-20 md:pb-32 px-6 w-full"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 0.3 }}
      >
        <div className="max-w-7xl mx-auto">
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-display font-bold mb-4 relative">
            <motion.span 
              className="inline-block text-gray-300 dark:text-floralwhite"
              initial="hidden"
              animate="visible"
            >
              {'Kofi Asiedu-Mahama'.split('').map((char, index) => (
                <motion.span
                  key={index}
                  className="inline-block text-white dark:text-floralwhite"
                  style={{
                    filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.4))',
                    textShadow: '0 2px 20px rgba(0,0,0,0.3)',
                  }}
                  variants={{
                    hidden: { opacity: 0, y: 20 },
                    visible: { 
                      opacity: 1, 
                      y: 0,
                      transition: {
                        delay: index * 0.03,
                        duration: 0.5,
                        ease: [0.4, 0, 0.2, 1]
                      }
                    }
                  }}
                >
                  {char === ' ' ? '\u00A0' : char}
                </motion.span>
              ))}
            </motion.span>
            <motion.div
              className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-[#CE1126] via-[#FCD116] to-[#006B3F]"
              initial={{ width: 0 }}
              animate={{ width: '100%' }}
              transition={{ 
                delay: 0.8,
                duration: 1.2,
                ease: [0.4, 0, 0.2, 1]
              }}
              style={{
                boxShadow: '0 2px 8px rgba(206, 17, 38, 0.4)',
              }}
            />
          </h1>
          <p className="text-xl md:text-2xl lg:text-3xl text-gray-100 dark:text-gray-200 font-light max-w-3xl drop-shadow-lg">
            Author • Thought Leader • Wealth Psychology Expert
          </p>
        </div>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20"
      >
        <button
          onClick={scrollToAbout}
          className="flex flex-col items-center text-white dark:text-gray-100 hover:text-gray-300 dark:hover:text-gray-300 transition-colors"
          aria-label="Scroll down"
        >
          <span className="text-xs uppercase tracking-widest mb-2 drop-shadow-lg">Discover More</span>
          <ChevronDownIcon className="w-6 h-6 animate-bounce drop-shadow-lg" />
        </button>
      </motion.div>
    </section>
    </>
  );
}
