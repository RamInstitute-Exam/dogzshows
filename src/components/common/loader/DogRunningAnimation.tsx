'use client';

import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';

// Dynamically import Lottie to prevent SSR issues
const Lottie = dynamic(() => import('lottie-react'), { ssr: false });

export const DogRunningAnimation = () => {
  const [animationData, setAnimationData] = useState<any>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    // Fetch the JSON dynamically from the public folder
    fetch('/lottie/dog-running.json')
      .then((res) => {
        if (!res.ok) throw new Error('Failed to load Lottie JSON');
        return res.json();
      })
      .then((data) => setAnimationData(data))
      .catch((err) => {
        console.error('Lottie fetch error:', err);
        setError(true);
      });
  }, []);

  // Accessibility Check
  const prefersReducedMotion = typeof window !== 'undefined' 
    ? window.matchMedia('(prefers-reduced-motion: reduce)').matches 
    : false;

  // Responsive widths based on User Request
  // Desktop: 120px, Tablet: 100px, Mobile: 80px
  const style = {
    width: '100%',
    maxWidth: '120px',
  };

  return (
    <div className="flex items-center justify-center w-20 md:w-[100px] lg:w-[120px] aspect-square">
      {/* Fallback if JSON fails or user prefers reduced motion */}
      {(!animationData || error || prefersReducedMotion) ? (
        <div className="w-full h-full flex items-center justify-center text-brand-orange animate-pulse">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
            <path d="M10 5.172C10 3.782 8.423 2.679 6.5 3c-2.823.47-4.113 6.006-4 7 .08.703 1.725 1.722 3.656 1 1.261-.472 1.969-1.45 2.344-2.5"/>
            <path d="M14.267 5.172c0-1.39 1.577-2.493 3.5-2.172 2.823.47 4.113 6.006 4 7-.08.703-1.725 1.722-3.656 1-1.261-.472-1.984-1.45-2.359-2.5"/>
            <path d="M8 14v.5"/>
            <path d="M16 14v.5"/>
            <path d="M11.25 16.25h1.5L12 17l-.75-.75Z"/>
            <path d="M4.42 11.247A13.152 13.152 0 0 0 4 14.556C4 18.728 7.582 21 12 21s8-2.272 8-6.444c0-1.061-.162-2.2-.493-3.309m-9.243-6.082A8.801 8.801 0 0 1 12 5c.78 0 1.5.108 2.161.306"/>
          </svg>
        </div>
      ) : (
        <Lottie
          animationData={animationData}
          loop={true}
          autoplay={true}
          style={style}
          className="w-full h-full drop-shadow-xl"
        />
      )}
    </div>
  );
};
