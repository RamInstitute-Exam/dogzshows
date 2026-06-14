'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { useAuthModalStore } from '@/store/useAuthModalStore';
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '@/lib/utils';

// Views
import LoginForm from './views/LoginForm';
import RegisterForm from './views/RegisterForm';
import ForgotPasswordForm from './views/ForgotPasswordForm';

export default function AuthModal() {
  const { isOpen, view, closeModal } = useAuthModalStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  // Prevent background scrolling
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
      document.documentElement.style.overflow = 'unset';
    }
    return () => { 
      document.body.style.overflow = 'unset'; 
      document.documentElement.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Close on ESC
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeModal();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [closeModal]);

  if (!mounted) return null;

  const renderView = () => {
    switch (view) {
      case 'LOGIN': return <LoginForm />;
      case 'REGISTER': return <RegisterForm />;
      case 'FORGOT_PASSWORD': return <ForgotPasswordForm />;
      default: return <LoginForm />;
    }
  };

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[99998] flex items-center justify-center p-0 sm:p-6 overflow-hidden">
          {/* Backdrop */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0 bg-black/55 backdrop-blur-[12px]" 
            onClick={closeModal}
          />
          
          {/* Modal Panel */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className={cn(
              "relative z-[99999] bg-[#0B1220] sm:rounded-[24px] shadow-[0_40px_100px_rgba(0,0,0,0.35)] overflow-hidden hide-scrollbar max-h-[100vh] sm:max-h-[92vh] flex flex-col transition-all duration-300",
              view === 'REGISTER' ? "w-[100vw] sm:w-[95vw] xl:w-[1200px] h-[100vh] sm:h-auto" : "w-[100vw] sm:w-[520px] h-[100vh] sm:h-auto sm:max-h-[92vh] overflow-y-auto"
            )}
          >
            {/* Close Button */}
            <button 
              onClick={closeModal}
              className={cn(
                "absolute top-6 right-6 p-2 z-50 rounded-full transition-colors",
                view === 'REGISTER' ? "text-muted-foreground hover:bg-background/50 hover:text-foreground bg-[#0B1220]/80 backdrop-blur-md shadow-sm" : "text-muted-foreground hover:bg-background hover:text-foreground"
              )}
            >
              <X className="w-5 h-5" />
            </button>

            {/* Dynamic Content */}
            <AnimatePresence mode="wait">
              <motion.div
                key={view}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className={cn("w-full h-full", view === 'REGISTER' ? "flex-1 overflow-y-auto" : "")}
              >
                {renderView()}
              </motion.div>
            </AnimatePresence>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}
