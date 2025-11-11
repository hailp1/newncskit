'use client';

import React, { useState, useEffect } from 'react';
import { illustrationContent } from '@/data/illustration-content';
import { IllustrationSlide } from '@/types/illustration';

interface IllustrationPanelProps {
  mode: 'login' | 'register';
}

export const IllustrationPanel: React.FC<IllustrationPanelProps> = ({ mode }) => {
  const slides = illustrationContent[mode];
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    // Auto-rotate slides every 5 seconds
    const interval = setInterval(() => {
      setIsTransitioning(true);
      
      // Wait for fade out animation before changing slide
      setTimeout(() => {
        setCurrentSlide((prev) => (prev + 1) % slides.length);
        // Small delay before fading in
        setTimeout(() => {
          setIsTransitioning(false);
        }, 50);
      }, 400); // Fade out duration
    }, 5000);

    return () => clearInterval(interval);
  }, [slides.length]);

  // Reset to first slide when mode changes
  useEffect(() => {
    setCurrentSlide(0);
    setIsTransitioning(false);
  }, [mode]);

  const currentSlideData: IllustrationSlide = slides[currentSlide];

  return (
    <div 
      className="relative h-full min-h-screen w-full bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex flex-col items-center justify-center p-6 lg:p-8 xl:p-12 overflow-hidden transition-all duration-300"
      role="region"
      aria-label="Giới thiệu tính năng"
      aria-live="polite"
    >
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-10" aria-hidden="true">
        <div className="absolute top-10 left-10 w-24 h-24 lg:w-32 lg:h-32 bg-blue-500 rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 right-10 w-32 h-32 lg:w-40 lg:h-40 bg-purple-500 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-40 h-40 lg:w-48 lg:h-48 bg-pink-500 rounded-full blur-3xl"></div>
      </div>

      {/* Content container with fade and scale transition */}
      <div
        className={`relative z-10 w-full max-w-xl lg:max-w-2xl transition-all duration-500 ease-in-out ${
          isTransitioning 
            ? 'opacity-0 scale-95 translate-y-2' 
            : 'opacity-100 scale-100 translate-y-0'
        }`}
        style={{ willChange: 'opacity, transform' }}
        role="group"
        aria-roledescription="slide"
        aria-label={`Slide ${currentSlide + 1} of ${slides.length}: ${currentSlideData.title}`}
      >
        {/* Slide content */}
        <div className="mb-6 lg:mb-8">
          {currentSlideData.content}
        </div>

        {/* Slide title and description */}
        <div className="text-center space-y-2">
          <h2 className="text-xl lg:text-2xl xl:text-3xl font-bold text-gray-800 transition-colors duration-300">
            {currentSlideData.title}
          </h2>
          <p className="text-sm lg:text-base text-gray-600 transition-colors duration-300">
            {currentSlideData.description}
          </p>
        </div>
      </div>

      {/* Slide indicators */}
      <div 
        className="absolute bottom-6 lg:bottom-8 left-1/2 transform -translate-x-1/2 flex gap-2 z-20"
        role="group"
        aria-label="Điều hướng slide"
      >
        {slides.map((slide, index) => (
          <button
            key={index}
            onClick={() => {
              if (index !== currentSlide) {
                setIsTransitioning(true);
                setTimeout(() => {
                  setCurrentSlide(index);
                  setTimeout(() => {
                    setIsTransitioning(false);
                  }, 50);
                }, 400);
              }
            }}
            className={`h-2 rounded-full transition-all duration-300 ease-in-out min-w-[44px] min-h-[44px] flex items-center justify-center hover:scale-110 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
              index === currentSlide
                ? 'w-8 bg-blue-600'
                : 'w-2 bg-gray-300 hover:bg-gray-400'
            }`}
            aria-label={`Chuyển đến slide ${index + 1}: ${slide.title}`}
            aria-current={index === currentSlide ? 'true' : 'false'}
            tabIndex={0}
          >
            <span className={`h-2 rounded-full transition-all duration-300 ${
              index === currentSlide ? 'w-8 bg-blue-600' : 'w-2 bg-current'
            }`} aria-hidden="true"></span>
          </button>
        ))}
      </div>
    </div>
  );
};
