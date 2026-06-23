'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Spinner } from './Spinner';

export const AppLoader = ({ isLoading, isExiting }: { isLoading: boolean; isExiting: boolean }) => {
  return (
    <AnimatePresence>
      {(isLoading || isExiting) && (
        <motion.div
          initial={{ opacity: 1 }}
          animate={{ opacity: isExiting ? 0 : 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
          // Sleek dark premium gradient to prevent white flash
          className="fixed inset-0 z-[999999] flex flex-col items-center justify-center bg-zinc-950 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-zinc-900 via-zinc-950 to-black select-none"
        >
          <Spinner size="lg" className="bg-transparent" fullScreen />
        </motion.div>
      )}
    </AnimatePresence>
  );
};
