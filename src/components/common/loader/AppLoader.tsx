'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Spinner } from './Spinner';

export const AppLoader = ({ isLoading, isExiting }: { isLoading: boolean; isExiting: boolean }) => {
  React.useEffect(() => {
    if (isLoading || isExiting) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isLoading, isExiting]);

  return (
    <AnimatePresence>
      {(isLoading || isExiting) && (
        <motion.div
          initial={{ opacity: 1 }}
          animate={{ opacity: isExiting ? 0 : 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
          className="fixed inset-0 z-[999999] flex flex-col items-center justify-center bg-black select-none"
          style={{ overflow: 'hidden', position: 'fixed', inset: 0, width: '100vw', height: '100vh' }}
        >
          <Spinner size="lg" className="bg-transparent" fullScreen />
        </motion.div>
      )}
    </AnimatePresence>
  );
};
