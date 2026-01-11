'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, useTransform, MotionValue } from 'framer-motion';
import Image from 'next/image';

// Hero images for carousel
const heroImages = [
  '/images/kofi-main-pic.jpeg',
  '/images/kofi-smile.jpeg',
  '/images/kofi-speech3.jpeg',
];

interface HeroCarouselProps {
  readonly scrollYProgress: MotionValue<number>;
  readonly overlayOpacity: MotionValue<number>;
}

export function HeroCarousel({ scrollYProgress, overlayOpacity }: HeroCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [skipTransition, setSkipTransition] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-rotate images every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => {
        // If we're at the last real image, go to duplicate (seamless forward scroll)
        if (prev === heroImages.length - 1) {
          return heroImages.length; // Go to duplicate first image
        }
        // If we're at the duplicate, instantly reset to 0
        if (prev === heroImages.length) {
          setSkipTransition(true);
          // Reset skip flag after transition completes
          if (timeoutRef.current) clearTimeout(timeoutRef.current);
          timeoutRef.current = setTimeout(() => setSkipTransition(false), 50);
          return 0;
        }
        // Normal forward progression
        return prev + 1;
      });
    }, 5000);

    return () => {
      clearInterval(interval);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  // Parallax effect
  const imageY = useTransform(scrollYProgress, [0, 1], ['0%', '20%']);

  // Handle wrap-around: duplicate first image at the end for seamless forward loop
  const imagesWithDuplicate = [...heroImages, heroImages[0]];

  return (
    <div className="absolute inset-0 z-0 overflow-hidden">
      <motion.div
        className="flex h-full"
        style={{ 
          y: imageY,
        }}
        initial={false}
        animate={{ 
          x: `-${currentIndex * 100}%`,
        }}
        transition={{ 
          duration: skipTransition ? 0 : 0.8,
          ease: [0.4, 0, 0.2, 1]
        }}
      >
        {imagesWithDuplicate.map((image, index) => (
          <div
            key={`${image}-${index}`}
            className="relative flex-shrink-0 w-full h-full"
          >
            <Image
              src={image}
              alt={`Kofi Asiedu-Mahama - Image ${(index % heroImages.length) + 1}`}
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
