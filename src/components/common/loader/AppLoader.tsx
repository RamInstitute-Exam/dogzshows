'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2 } from 'lucide-react';

export const AppLoader = ({ isLoading, isExiting }: { isLoading: boolean; isExiting: boolean }) => {
  return (
    <AnimatePresence>
      {(isLoading || isExiting) && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: isExiting ? 0 : 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className="fixed inset-0 z-[999999] flex flex-col items-center justify-center bg-[#F8F8F8] dark:bg-[#0B0B0B] select-none pointer-events-none"
        >
          <div className="flex flex-col items-center justify-center gap-4">
            {/* Logo - Transparent, no box/shadow */}
            <img
              src="/Untitled-1.png"
              alt="JuzDog Logo"
              className="w-[120px] md:w-[150px] lg:w-[180px] h-auto object-contain"
            />

            {/* Spinner */}
            <Loader2 className="w-[30px] h-[30px] text-brand-orange animate-spin" />

            {/* Loading Text */}
            <p className="text-[15px] font-medium text-gray-400 dark:text-gray-500 tracking-wide">
              Loading...
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
