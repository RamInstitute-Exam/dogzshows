'use client';

import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  fullScreen?: boolean;
}

export const Spinner = ({ size = 'md', className = '', fullScreen = false }: SpinnerProps) => {
  const baseClasses = fullScreen 
    ? "w-full h-full flex flex-col items-center justify-center bg-transparent z-[9999]" 
    : "flex items-center justify-center w-full h-full min-h-[100px] bg-transparent";

  return (
    <div className={`${baseClasses} ${className}`}>
      <motion.div 
        className="relative flex flex-col items-center justify-center w-full max-w-[180px] md:max-w-[220px] lg:max-w-[280px]"
        initial={{ scale: 0.9, opacity: 0, y: 10 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      >
        {/* Logo pulse animation (glow removed as requested) */}
        <motion.div
          animate={{ scale: [1, 1.03, 1] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="relative z-10 w-full flex items-center justify-center"
        >
          <img 
            src="/Untitled-1.png" 
            alt="JUZDOG Loading..." 
            className="w-full h-auto object-contain bg-transparent block"
          />
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Spinner;
