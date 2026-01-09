'use client';

import { useState, useEffect } from 'react';
import { motion, useTransform, MotionValue } from 'framer-motion';
import Image from 'next/image';

// Hero images for carousel
const heroImages = [
  '/images/kofi-main-pic.jpeg',
];

interface HeroCarouselProps {
  readonly scrollYProgress: MotionValue<number>;
  readonly overlayOpacity: MotionValue<number>;
}

export function HeroCarousel({ scrollYProgress, overlayOpacity }: HeroCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Auto-rotate images every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % heroImages.length);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  // Parallax effect
  const imageY = useTransform(scrollYProgress, [0, 1], ['0%', '20%']);

  return (
    <div className="absolute inset-0 z-0 overflow-hidden">
      <motion.div
        className="flex h-full"
        style={{ 
          y: imageY,
        }}
        initial={false}
        animate={{ x: `-${currentIndex * 100}%` }}
        transition={{ 
          duration: 0.8,
          ease: [0.4, 0, 0.2, 1]
        }}
      >
        {heroImages.map((image, index) => (
          <div
            key={`${image}-${index}`}
            className="relative flex-shrink-0 w-full h-full"
          >
            <Image
              src={image}
              alt={`Kofi Asiedu-Mahama - Image ${index + 1}`}
              fill
              className="object-cover object-top"
              priority={index === 0}
              quality={95}
            />
          </div>
        ))}
      </motion.div>
      
      {/* Gradient overlay for text readability */}
      <motion.div 
        className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent z-10"
        style={{ opacity: overlayOpacity }}
      />
    </div>
  );
}
