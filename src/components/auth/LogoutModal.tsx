'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { LogOut, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/store/useAuthStore';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';

interface LogoutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function LogoutModal({ isOpen, onClose }: LogoutModalProps) {
  const { logout } = useAuthStore();
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    
    // Simulate slight delay for premium loading feel
    await new Promise(res => setTimeout(res, 1500));
    
    logout();
    toast.success('Logged out successfully.');
    router.push('/login');
    onClose();
  };

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}
            className="absolute inset-0 bg-black/25 backdrop-blur-[10px]" 
            onClick={!isLoggingOut ? onClose : undefined}
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative bg-card rounded-[24px] shadow-2xl w-[95%] md:w-[480px] overflow-hidden"
          >
            {isLoggingOut ? (
              <div className="p-12 text-center flex flex-col items-center justify-center space-y-4">
                <Loader2 className="w-12 h-12 text-foreground animate-spin" />
                <p className="text-lg font-bold text-foreground">Signing you out...</p>
              </div>
            ) : (
              <>
                <div className="p-8 text-center">
                  <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
                    <LogOut className="w-8 h-8 text-red-500" />
                  </div>
                  <h3 className="text-2xl font-extrabold text-foreground mb-3 flex items-center justify-center gap-2">🚪 Sign Out</h3>
                  <p className="text-muted-foreground text-base mb-8 max-w-[320px] mx-auto leading-relaxed">
                    Are you sure you want to logout from your JuzDog account?<br/><br/>
                    You will need to login again to access your dashboard.
                  </p>
                  <div className="flex gap-4 w-full">
                    <Button variant="outline" onClick={onClose} className="flex-1 rounded-xl h-12 text-base font-bold border-border text-muted-foreground hover:bg-card">
                      Cancel
                    </Button>
                    <Button onClick={handleLogout} className="flex-1 btn-primary-luxury">
                      Logout
                    </Button>
                  </div>
                </div>
                
                <button 
                  onClick={onClose}
                  className="absolute top-6 right-6 p-2 text-muted-foreground hover:bg-input hover:text-foreground rounded-full transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}
