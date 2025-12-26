"use client";

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import type { ImagePlaceholder } from '@/lib/placeholder-images';

interface HeroSliderProps {
  images: ImagePlaceholder[];
  interval?: number;
}

export default function HeroSlider({ images, interval = 5000 }: HeroSliderProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const nextSlide = useCallback(() => {
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
      setIsTransitioning(false);
    }, 500); // Corresponds to the transition duration
  }, [images.length]);

  useEffect(() => {
    const slideInterval = setInterval(() => {
      nextSlide();
    }, interval);

    return () => clearInterval(slideInterval);
  }, [interval, nextSlide]);

  if (!images || images.length === 0) {
    return null;
  }

  return (
    <div className="relative group w-full aspect-[3/2] overflow-hidden rounded-xl">
      <div className="absolute -inset-0.5 bg-gradient-to-r from-primary to-secondary rounded-xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
      <div
        className="relative flex h-full w-full transition-transform duration-500 ease-in-out"
        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
      >
        {images.map((image, index) => (
          <div key={image.id} className="relative h-full w-full flex-shrink-0">
            <Image
              src={image.imageUrl}
              alt={image.description}
              fill
              priority={index === 0} // Prioritize loading the first image for LCP
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 650px"
              data-ai-hint={image.imageHint}
              className="object-cover"
            />
          </div>
        ))}
      </div>
       {/* Add a duplicate of the first image at the end for seamless looping effect */}
       <div
        className="absolute top-0 left-full flex h-full w-full transition-transform duration-500 ease-in-out"
        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
      >
        <div key={`${images[0].id}-clone`} className="relative h-full w-full flex-shrink-0">
             <Image
              src={images[0].imageUrl}
              alt={images[0].description}
              fill
              aria-hidden="true" // Hide from screen readers
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 650px"
              data-ai-hint={images[0].imageHint}
              className="object-cover"
            />
        </div>
      </div>
    </div>
  );
}
