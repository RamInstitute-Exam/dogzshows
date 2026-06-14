'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface LoaderContextType {
  isLoading: boolean;
  showLoader: () => void;
  hideLoader: () => void;
}

const LoaderContext = createContext<LoaderContextType | undefined>(undefined);

export function useLoader() {
  const context = useContext(LoaderContext);
  if (!context) {
    throw new Error('useLoader must be used within a GlobalLoaderProvider');
  }
  return context;
}

export function GlobalLoaderProvider({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  const showLoader = () => {
    setIsLoading(true);
    setProgress(0);
  };

  const hideLoader = () => {
    setProgress(100);
    setTimeout(() => {
      setIsLoading(false);
    }, 400); // Wait for progress bar to finish
  };

  // Simulate progress when loading
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isLoading) {
      interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 90) return prev;
          // Slowly increment up to 90%
          return prev + Math.random() * 10;
        });
      }, 300);
    }
    return () => clearInterval(interval);
  }, [isLoading]);

  return (
    <LoaderContext.Provider value={{ isLoading, showLoader, hideLoader }}>
      {children}

      <AnimatePresence>
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
            className="fixed inset-0 z-[99999] flex flex-col items-center justify-center bg-background/95 backdrop-blur-xl"
          >
            {/* Animated Logo Container */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ 
                duration: 0.8, 
                ease: "easeOut",
                repeat: Infinity,
                repeatType: "reverse"
              }}
              className="relative mb-8"
            >
              {/* Premium Glow Effect */}
              <div className="absolute inset-0 bg-[#F59E0B] blur-[40px] opacity-20 rounded-full" />
              
              <h1 className="text-4xl md:text-5xl font-extrabold tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-[#F59E0B] to-[#FB923C] relative z-10">
                JUZDOG
              </h1>
            </motion.div>

            {/* Progress Bar Container */}
            <div className="w-64 h-1.5 bg-[rgba(255,255,255,0.1)] rounded-full overflow-hidden relative">
              <motion.div
                initial={{ width: "0%" }}
                animate={{ width: `${progress}%` }}
                transition={{ ease: "linear", duration: 0.2 }}
                className="absolute left-0 top-0 h-full bg-gradient-to-r from-[#F59E0B] to-[#FB923C] rounded-full shadow-[0_0_10px_#F59E0B]"
              />
            </div>

            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-4 text-muted-foreground text-sm font-medium tracking-wider uppercase"
            >
              Loading Experience...
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>
    </LoaderContext.Provider>
  );
}
