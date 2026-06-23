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
  const sizeClasses = {
    sm: 100,
    md: 140,
    lg: 200,
  };

  const width = sizeClasses[size];
  const height = Math.round(width * 0.35); // JUZDOG logo aspect ratio approximation

  const baseClasses = fullScreen 
    ? "w-full h-full flex flex-col items-center justify-center bg-transparent z-[9999]" 
    : "flex items-center justify-center w-full h-full min-h-[100px] bg-transparent";

  return (
    <div className={`${baseClasses} ${className}`}>
      <motion.div 
        className="relative flex flex-col items-center justify-center"
        initial={{ scale: 0.9, opacity: 0, y: 10 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      >
        {/* Subtle glow effect behind the logo */}
        <motion.div 
          className="absolute inset-0 bg-primary/20 blur-[50px] rounded-full scale-150"
          animate={{
            opacity: [0.3, 0.8, 0.3],
            scale: [1.2, 1.6, 1.2],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        
        {/* Logo pulse animation */}
        <motion.div
          animate={{
            scale: [1, 1.03, 1],
            filter: [
              "drop-shadow(0px 0px 5px rgba(255,255,255,0.1))",
              "drop-shadow(0px 0px 15px rgba(255,255,255,0.3))",
              "drop-shadow(0px 0px 5px rgba(255,255,255,0.1))"
            ]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="relative z-10"
        >
          <Image 
            src="/Untitled-1.png" 
            alt="JUZDOG Loading..." 
            width={width}
            height={height}
            className="object-contain"
            priority
          />
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Spinner;
