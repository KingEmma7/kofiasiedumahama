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
    document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' });
    setIsMenuOpen(false);
  };

  return (
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
            <span 
              className="inline-block bg-clip-text text-transparent animate-gradient-x"
              style={{
                backgroundImage: 'linear-gradient(to left, #CE1126 0%, #FCD116 33%, #006B3F 66%, #CE1126 100%)',
                backgroundSize: '300% 100%',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))',
              }}
            >
              Kofi Asiedu-Mahama
            </span>
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
  );
}
