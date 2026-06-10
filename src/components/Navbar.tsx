'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Camera, Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  const navLinks = [
    { name: 'Home', href: '/' },
    { name: 'Photo Gallery', href: '/photos' },
    { name: 'Video Gallery', href: '/videos' },
    { name: 'Show Entries', href: '/entries' },
    { name: 'About Us', href: '/about' },
    { name: 'Contact Us', href: '/contact' },
  ];

  return (
    <nav className="fixed w-full top-0 z-50 transition-all duration-300 bg-white border-b border-gray-200 shadow-sm py-3">
      <div className="max-w-[1400px] mx-auto px-6">
        <div className="flex justify-between items-center h-12">
          
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 group z-50 relative">
            <div className="bg-brand-orange p-2 rounded-xl group-hover:scale-110 transition-transform duration-300">
              <Camera className="h-5 w-5 text-white" />
            </div>
            <span className={cn(
              "font-outfit font-extrabold text-2xl tracking-tight transition-colors duration-300 text-gray-900"
            )}>
              JuztDog <span className="font-light">Media</span>
            </span>
          </Link>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex space-x-1 relative">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link 
                  key={link.name} 
                  href={link.href} 
                  className={cn(
                    "relative px-4 py-2 rounded-full font-medium transition-all duration-300 text-sm",
                    isActive 
                      ? "text-[#F97316]" 
                      : "text-gray-600 hover:text-[#F97316]"
                  )}
                >
                  <span className="relative z-10">{link.name}</span>
                  {isActive && (
                    <motion.div
                      layoutId="active-nav-pill"
                      className="absolute inset-0 rounded-full -z-0 bg-orange-50"
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}
                </Link>
              );
            })}
          </div>

          {/* Mobile Menu Toggle */}
          <div className="flex items-center md:hidden z-50 relative">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-full transition-colors text-gray-900 hover:bg-gray-100"
            >
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="md:hidden absolute top-full left-0 w-full bg-white border-b border-gray-200 shadow-xl overflow-hidden"
          >
            <div className="px-4 py-6 flex flex-col space-y-2">
              {navLinks.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.name}
                    href={link.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={cn(
                      "px-4 py-3 rounded-xl font-medium transition-colors text-base",
                      isActive 
                        ? "bg-[#F97316] text-white" 
                        : "text-gray-700 hover:bg-orange-50 hover:text-[#F97316]"
                    )}
                  >
                    {link.name}
                  </Link>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
