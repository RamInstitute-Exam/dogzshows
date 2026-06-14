import Link from 'next/link';
import { Menu, X, Dog, LogOut } from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '@/store/useAuthStore';
import { useAuthModalStore } from '@/store/useAuthModalStore';
import { Button } from '@/components/ui/button';

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuthStore();
  const { openModal } = useAuthModalStore();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="fixed w-full z-50 bg-card/80 backdrop-blur-xl border-b border-border transition-all">
      <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 md:px-8 lg:px-10 xl:px-12">
        <div className="flex justify-between h-20">
          <div className="flex items-center">
            <Link href="/" className="flex-shrink-0 flex items-center gap-2 group">
              <div className="bg-brand-orange p-2 rounded-xl group-hover:bg-orange-600 transition-colors shadow-sm">
                <Dog className="h-6 w-6 text-foreground" />
              </div>
              <span className="font-outfit font-extrabold text-2xl tracking-tight text-foreground">
                Juz<span className="text-brand-orange">dog</span>
              </span>
            </Link>
            <div className="hidden sm:ml-10 sm:flex sm:space-x-1">
              {[
                { name: 'Events', href: '/events' },
                { name: 'Competitions', href: '/competitions' },
                { name: 'Winners', href: '/winners' },
                { name: 'Gallery', href: '/gallery' },
                { name: 'Judges', href: '/judges' },
                { name: 'About', href: '/about' },
              ].map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="inline-flex items-center px-4 py-2 text-sm font-bold text-muted-foreground hover:text-brand-orange hover:bg-orange-50 rounded-full transition-colors"
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </div>
          
          <div className="hidden sm:ml-6 sm:flex sm:items-center gap-3">
            {!isAuthenticated ? (
              <>
                <Button onClick={() => openModal('LOGIN')} variant="ghost" className="font-bold text-muted-foreground hover:text-foreground hover:bg-input rounded-full px-6">
                  Sign In
                </Button>
                <Button onClick={() => openModal('REGISTER')} className="bg-brand-orange hover:bg-orange-600 text-foreground font-bold rounded-full px-6 shadow-md shadow-brand-orange/20">
                  Get Started
                </Button>
              </>
            ) : (
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-brand-orange to-red-500 flex items-center justify-center text-foreground font-bold shadow-sm cursor-pointer">
                    {user?.firstName?.[0] || 'U'}
                  </div>
                </div>
                {user?.roles?.includes('Admin') && (
                  <Link href="/admin">
                    <Button variant="outline" size="sm" className="rounded-full font-bold">Admin</Button>
                  </Link>
                )}
                <Link href="/dashboard">
                  <Button variant="outline" size="sm" className="rounded-full font-bold border-brand-orange text-brand-orange hover:bg-orange-50">Dashboard</Button>
                </Link>
                <Button onClick={logout} variant="ghost" size="icon" className="text-muted-foreground hover:text-red-500 hover:bg-red-50 rounded-full">
                  <LogOut className="h-5 w-5" />
                </Button>
              </div>
            )}
          </div>

          <div className="flex items-center sm:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-muted-foreground hover:text-brand-orange focus:outline-none"
            >
              {isOpen ? <X className="block h-6 w-6" /> : <Menu className="block h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="sm:hidden bg-card border-t border-border"
          >
            <div className="px-2 pt-2 pb-3 space-y-1">
              {['Events', 'Competitions', 'Winners', 'Gallery', 'Judges', 'About'].map((item) => (
                <Link key={item} href={`/${item.toLowerCase()}`} className="block px-3 py-2 rounded-md text-base font-medium text-muted-foreground hover:bg-orange-50 hover:text-brand-orange">
                  {item}
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
