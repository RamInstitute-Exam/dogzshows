'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Camera, Menu, X, Search, Bell, ChevronDown, Settings, LogOut } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/store/useAuthStore';
import { useAuthModalStore } from '@/store/useAuthModalStore';
import { Button } from '@/components/ui/button';

export default function InnerHeader() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAvatarDropdownOpen, setIsAvatarDropdownOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { openModal } = useAuthModalStore();
  const pathname = usePathname();

  const { user, isAuthenticated, logout } = useAuthStore();
  const role = user?.roles?.[0] || 'GUEST';

  useEffect(() => {
    setMounted(true);
  }, []);

  // Close drawer on ESC
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsMobileMenuOpen(false);
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, []);

  if (!mounted) return null;

  const navLinks = [
    { name: 'Home', href: '/' },
    { name: 'Events', href: '/events' },
    { name: 'Judges', href: '/judges' },
    { name: 'Gallery', href: '/gallery' },
    { name: 'Winners', href: '/winners' },
    { name: 'About', href: '/about' },
    { name: 'Contact', href: '/contact' },
  ];

  const getDropdownLinks = () => {
    if (role === 'ADMIN') return [
      { name: 'Dashboard', href: '/admin' },
      { name: 'Users', href: '/admin/users' },
      { name: 'Dogs', href: '/admin/dogs' },
      { name: 'Events', href: '/admin/events' },
      { name: 'Reports', href: '/admin/reports' },
    ];
    if (role === 'SUB_ADMIN') return [
      { name: 'Dashboard', href: '/dashboard' },
      { name: 'Assigned Events', href: '/dashboard/events' },
      { name: 'Competition', href: '/admin/competition' },
    ];
    return [
      { name: 'Dashboard', href: '/dashboard' },
      { name: 'My Profile', href: '/dashboard/profile' },
      { name: 'My Dogs', href: '/dashboard/dogs' },
      { name: 'My Registrations', href: '/dashboard/registrations' },
    ];
  };

  return (
    <header className="sticky top-0 z-[1000] glass-panel shadow-[0_2px_15px_rgba(0,0,0,0.08)] h-[64px] md:h-[72px] lg:h-[80px] flex flex-col justify-center">
      <div className="max-w-[1600px] mx-auto w-full px-4 sm:px-6 lg:px-8 flex justify-between items-center">
        {/* Logo */}
        <Link href="/" className="flex items-center group shrink-0">
          <img 
            src="/Untitled-1.png" 
            alt="JuzDog Logo" 
            className="w-[140px] md:w-[160px] lg:w-[180px] xl:w-[220px] h-auto object-contain group-hover:scale-105 transition-transform"
          />
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden lg:flex items-center gap-[32px] overflow-x-auto hide-scrollbar px-4 flex-1 justify-center">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link 
                key={link.name} 
                href={link.href} 
                className={cn(
                  "font-bold text-[15px] transition-colors whitespace-nowrap",
                  isActive ? "text-[#F59E0B]" : "text-[#CBD5E1] hover:text-foreground"
                )}
              >
                {link.name}
              </Link>
            );
          })}
        </div>

        {/* Right Actions */}
        <div className="hidden lg:flex items-center space-x-4 shrink-0">
          <button className="p-2 rounded-full text-muted-foreground hover:text-foreground hover:bg-input transition-colors">
            <Search className="w-5 h-5" />
          </button>
          
          {!isAuthenticated ? (
            <div className="flex items-center gap-3">
              <Button 
                variant="outline" 
                onClick={() => openModal('LOGIN')}
                className="btn-secondary-luxury px-6 h-[48px] rounded-xl text-sm"
              >
                Login
              </Button>
              <Button onClick={() => openModal('REGISTER')} className="btn-primary-luxury px-6 h-[48px] rounded-xl text-sm">
                Sign Up
              </Button>
              <Button className="bg-accent hover:bg-[#2D3748] border border-border text-foreground rounded-xl px-6 h-[48px] font-bold shadow-md text-sm">
                Register Dog
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <button className="p-2 rounded-full text-muted-foreground hover:bg-input transition-colors relative">
                <Bell className="w-5 h-5" />
                <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 border-2 border-border rounded-full"></span>
              </button>
              
              {/* User Avatar Dropdown */}
              <div className="relative">
                <button 
                  onClick={() => setIsAvatarDropdownOpen(!isAvatarDropdownOpen)}
                  className="flex items-center gap-2 pl-1 pr-3 py-1 rounded-full border border-border hover:border-border bg-card transition-all h-10"
                >
                  <div className="w-8 h-8 rounded-full bg-brand-orange flex items-center justify-center text-foreground font-bold text-sm">
                    {user?.firstName?.[0]}
                  </div>
                  <span className="font-bold text-sm text-muted-foreground">{user?.firstName}</span>
                  <ChevronDown className="w-4 h-4 text-muted-foreground" />
                </button>

                <AnimatePresence>
                  {isAvatarDropdownOpen && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute right-0 mt-2 w-56 bg-card rounded-2xl shadow-xl border border-border overflow-hidden"
                    >
                      <div className="p-4 border-b border-border bg-card">
                        <p className="font-bold text-foreground">{user?.firstName} {user?.lastName}</p>
                        <p className="text-xs font-bold text-brand-orange uppercase tracking-wider">{role}</p>
                      </div>
                      <div className="p-2">
                        {getDropdownLinks().map(link => (
                          <Link key={link.name} href={link.href} className="flex items-center px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-orange-50 hover:text-brand-orange rounded-xl transition-colors">
                            {link.name}
                          </Link>
                        ))}
                      </div>
                      <div className="p-2 border-t border-border">
                        <button className="w-full flex items-center px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-input rounded-xl transition-colors">
                          <Settings className="w-4 h-4 mr-2" /> Settings
                        </button>
                        <button onClick={logout} className="w-full flex items-center px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-xl transition-colors">
                          <LogOut className="w-4 h-4 mr-2" /> Logout
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          )}
        </div>

        {/* Mobile Hamburger */}
        <div className="lg:hidden flex items-center gap-4 shrink-0">
          {!isAuthenticated && (
            <Button size="sm" onClick={() => openModal('LOGIN')} className="bg-brand-orange hover:bg-orange-600 rounded-xl font-bold h-12 px-5 text-sm">
              Login
            </Button>
          )}
          <button onClick={() => setIsMobileMenuOpen(true)} className="p-2 rounded-full text-foreground">
            <Menu className="w-7 h-7" />
          </button>
        </div>
      </div>

      {/* Mobile Sidebar Drawer */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <div className="fixed inset-0 z-[9999] lg:hidden flex justify-start">
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
              onClick={() => setIsMobileMenuOpen(false)}
            />
            
            {/* Drawer */}
            <motion.div 
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="relative w-[80%] max-w-[320px] h-[100vh] bg-[#07111d]/90 backdrop-blur-[20px] shadow-2xl flex flex-col border-r border-border"
            >
              <div className="p-6 flex justify-between items-center border-b border-border">
                <img 
                  src="/Untitled-1.png" 
                  alt="JuzDog Logo" 
                  className="w-[140px] h-auto object-contain"
                />
                <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 bg-input rounded-full text-muted-foreground hover:bg-gray-200">
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-4">
                {navLinks.map(link => (
                  <Link key={link.name} href={link.href} onClick={() => setIsMobileMenuOpen(false)} className="text-xl font-bold text-foreground hover:text-brand-orange transition-colors">
                    {link.name}
                  </Link>
                ))}

                <div className="w-full h-px bg-[rgba(255,255,255,0.08)] my-4"></div>
                
                <Link href="/support" onClick={() => setIsMobileMenuOpen(false)} className="text-xl font-bold text-muted-foreground hover:text-foreground transition-colors">
                  Support
                </Link>
                <Link href="/rule-book" onClick={() => setIsMobileMenuOpen(false)} className="text-xl font-bold text-muted-foreground hover:text-foreground transition-colors">
                  Rule Book
                </Link>
              </div>

              <div className="p-6 border-t border-border space-y-4 bg-[#0B1220]">
                {!isAuthenticated ? (
                  <>
                    <Button onClick={() => {setIsMobileMenuOpen(false); openModal('LOGIN');}} variant="outline" className="w-full min-h-[54px] rounded-[14px] font-bold text-base btn-secondary-luxury">Login</Button>
                    <Button onClick={() => {setIsMobileMenuOpen(false); openModal('REGISTER');}} className="w-full min-h-[54px] rounded-[14px] btn-primary-luxury text-base">Sign Up</Button>
                    <Button className="w-full min-h-[54px] rounded-[14px] bg-card border border-border hover:bg-accent font-bold text-base text-foreground shadow-md">Register Dog</Button>
                  </>
                ) : (
                  <>
                    <div className="flex items-center gap-3 mb-4 p-4 bg-card rounded-xl shadow-sm border border-border">
                      <div className="w-10 h-10 rounded-full bg-brand-orange flex items-center justify-center text-foreground font-bold text-lg">{user?.firstName?.[0]}</div>
                      <div>
                        <p className="font-bold text-foreground text-sm">{user?.firstName} {user?.lastName}</p>
                        <p className="text-xs font-bold text-brand-orange uppercase">{role}</p>
                      </div>
                    </div>
                    <Button className="w-full min-h-[48px] rounded-xl bg-card hover:bg-foreground text-background text-foreground font-bold text-base">Go to Dashboard</Button>
                    <Button onClick={() => {setIsMobileMenuOpen(false); logout();}} variant="outline" className="w-full min-h-[48px] rounded-xl font-bold text-red-600 border-red-200 bg-red-50 hover:bg-red-100">Sign Out</Button>
                  </>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </header>
  );
}
