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
          // Clean solid background without radial gradient box effect
          className="fixed inset-0 z-[999999] flex flex-col items-center justify-center bg-zinc-950 select-none"
        >
          <Spinner size="lg" className="bg-transparent" fullScreen />
        </motion.div>
      )}
    </AnimatePresence>
  );
};
