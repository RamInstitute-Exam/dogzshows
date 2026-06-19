'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, Lock, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/store/useAuthStore';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function LoginModal({ isOpen, onClose }: LoginModalProps) {
  const setMockRole = useAuthStore((state: any) => state.setMockRole);

  const handleMockLogin = (role: string) => {
    setMockRole(role);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-0">
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            onClick={onClose}
            className="absolute inset-0 bg-background/60 backdrop-blur-sm"
          />
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }} 
            animate={{ opacity: 1, scale: 1, y: 0 }} 
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-md bg-card rounded-[2rem] shadow-2xl overflow-hidden flex flex-col z-10"
          >
            <div className="p-8">
              <button onClick={onClose} className="absolute top-6 right-6 text-muted-foreground hover:text-foreground bg-card hover:bg-input p-2 rounded-full transition-colors">
                <X className="w-5 h-5" />
              </button>

              <h2 className="text-muted-foregroundxl font-extrabold text-foreground mb-2 tracking-tight">Welcome Back</h2>
              <p className="text-muted-foreground text-sm mb-8">Sign in to your JuzDog enterprise account to manage events and registries.</p>

              <form className="space-y-4 mb-6" onSubmit={(e) => e.preventDefault()}>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input type="email" placeholder="Email Address" className="w-full pl-12 pr-4 py-3 bg-card border border-border rounded-xl focus:ring-2 focus:ring-foreground outline-none transition-all" />
                </div>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input type="password" placeholder="Password" className="w-full pl-12 pr-4 py-3 bg-card border border-border rounded-xl focus:ring-2 focus:ring-foreground outline-none transition-all" />
                </div>
                
                <div className="flex justify-between items-center text-sm">
                  <label className="flex items-center gap-2 text-muted-foreground cursor-pointer">
                    <input type="checkbox" className="rounded text-foreground focus:ring-foreground" />
                    Remember me
                  </label>
                  <a href="#" className="font-bold text-foreground hover:text-foreground">Forgot Password?</a>
                </div>

                <Button className="w-full h-12 rounded-xl bg-card hover:bg-foreground text-background font-bold text-lg shadow-md mt-4">
                  Sign In
                </Button>
              </form>

              <div className="relative my-8">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-border"></div></div>
                <div className="relative flex justify-center text-sm"><span className="px-4 bg-card text-muted-foreground font-medium">Or continue with</span></div>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-8">
                <Button variant="outline" className="h-12 rounded-xl font-bold border-border hover:bg-card">
                  <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-5 h-5 mr-2" alt="Google" /> Google
                </Button>
                <Button variant="outline" className="h-12 rounded-xl font-bold border-border hover:bg-card text-[#1877F2]">
                  <svg className="w-5 h-5 mr-2 fill-current" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg> Facebook
                </Button>
              </div>

              {/* Dev Tools for UI Testing */}
              <div className="p-4 bg-foreground/10 rounded-xl border border-border/20">
                <p className="text-xs font-bold text-foreground uppercase mb-2">Dev Tools: Test Roles</p>
                <div className="flex gap-2">
                  <Button size="sm" onClick={() => handleMockLogin('USER')} className="bg-blue-600 hover:bg-blue-700 text-xs h-8">User</Button>
                  <Button size="sm" onClick={() => handleMockLogin('SUB_ADMIN')} className="bg-purple-600 hover:bg-purple-700 text-xs h-8">Sub Admin</Button>
                  <Button size="sm" onClick={() => handleMockLogin('ADMIN')} className="bg-red-600 hover:bg-red-700 text-xs h-8">Admin</Button>
                </div>
              </div>

              <p className="text-center text-sm text-muted-foreground mt-6">
                Don't have an account? <a href="#" className="font-bold text-foreground hover:text-foreground">Create Account</a>
              </p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
