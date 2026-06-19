'use client';

import React from 'react';
import Image from 'next/image';

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  fullScreen?: boolean;
}

export const Spinner = ({ size = 'md', className = '', fullScreen = false }: SpinnerProps) => {
  const sizeClasses = {
    sm: 100,
    md: 140,
    lg: 200,
  };

  const width = sizeClasses[size];
  const height = Math.round(width * 0.35); // JUZDOG logo aspect ratio approximation

  const baseClasses = fullScreen 
    ? "fixed inset-0 w-full h-full flex items-center justify-center bg-[#000] z-[9999]" 
    : "flex items-center justify-center w-full h-full min-h-[100px] bg-[#000]";

  return (
    <div className={`${baseClasses} ${className}`}>
      <div className="relative loader-logo flex items-center justify-center">
        <Image 
          src="/Untitled-1.png" 
          alt="JUZDOG Loading..." 
          width={width}
          height={height}
          className="object-contain"
          priority
        />
      </div>
    </div>
  );
};

export default Spinner;
