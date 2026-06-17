'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const LOADING_MESSAGES = [
  "Loading...",
  "Preparing Dashboard...",
  "Loading Events...",
  "Loading Dogs...",
  "Almost Ready...",
  "Welcome to JuzDog..."
];

export const AppLoader = ({ isLoading, isExiting }: { isLoading: boolean; isExiting: boolean }) => {
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    if (!isLoading) return;
    
    // Rotate message every 2 seconds
    const interval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % LOADING_MESSAGES.length);
    }, 2000);
    
    return () => clearInterval(interval);
  }, [isLoading]);

  return (
    <AnimatePresence>
      {(isLoading || isExiting) && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: isExiting ? 0 : 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3, ease: "easeInOut" }} // 300ms overlay transition as requested
          className="fixed top-0 left-0 right-0 bottom-0 z-[999999] flex flex-col items-center justify-center bg-[#ffffff] dark:bg-background select-none pointer-events-none"
        >
          {/* Injecting pure GPU-accelerated CSS animations */}
          <style jsx global>{`
            @keyframes premiumBlinkGlow {
              0%, 100% {
                opacity: 1;
                transform: scale(1);
                box-shadow: 0 0 15px rgba(236, 72, 153, 0.20), 0 0 35px rgba(245, 158, 11, 0.15);
              }
              50% {
                opacity: 0.55;
                transform: scale(1.04);
                box-shadow: 0 0 25px rgba(236, 72, 153, 0.35), 0 0 50px rgba(245, 158, 11, 0.25);
              }
            }
            @keyframes premiumBlinkText {
              0%, 100% {
                opacity: 1;
              }
              50% {
                opacity: 0.55;
              }
            }
            .premium-logo-glow {
              animation: premiumBlinkGlow 1.2s infinite ease-in-out;
              will-change: transform, opacity, box-shadow;
            }
            .premium-text-blink {
              animation: premiumBlinkText 1.2s infinite ease-in-out;
              will-change: opacity;
            }
          `}</style>

          <div className="flex flex-col items-center justify-center">
            {/* Logo Container with soft glow */}
            <div className="premium-logo-glow p-4 rounded-3xl bg-transparent flex items-center justify-center">
              <img
                src="/Untitled-1.png"
                alt="JuzDog Logo"
                className="w-[120px] md:w-[150px] lg:w-[180px] h-auto object-contain rounded-2xl"
              />
            </div>

            {/* Rotating Pulsing Text */}
            <div className="relative h-8 mt-6 flex items-center justify-center text-center premium-text-blink">
              <AnimatePresence mode="wait">
                <motion.p
                  key={messageIndex}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="text-[#94A3B8] text-base md:text-[20px] font-medium tracking-wide whitespace-nowrap"
                  style={{ fontFamily: 'Poppins, sans-serif' }}
                >
                  {LOADING_MESSAGES[messageIndex]}
                </motion.p>
              </AnimatePresence>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
