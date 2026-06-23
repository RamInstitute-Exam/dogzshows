'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, Settings, Shield, Dog, Calendar, CreditCard, 
  FileBadge, Download, LifeBuoy, LogOut, Moon, Sun, 
  ChevronRight, Users, Award
} from 'lucide-react';
import Link from 'next/link';
import { useAuthStore } from '@/store/useAuthStore';
import LogoutModal from '@/components/auth/LogoutModal';
import { ADMIN_ROUTES, USER_ROUTES } from '@/config/navigation';
import OptimizedImage from '@/components/shared/OptimizedImage';

export default function ProfileDropdown() {
  const { user } = useAuthStore();
  const role = user?.roles?.[0] || 'USER';
  const [isOpen, setIsOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close on ESC key
  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsOpen(false);
    };
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, []);

  const toggleDropdown = () => setIsOpen(!isOpen);

  // Dynamic Base Path based on role
  const basePath = role === 'SUPER_ADMIN' || role === 'ADMIN' ? '/admin' : '/dashboard';

  if (!mounted) {
    return (
      <div className="w-32 h-10 bg-input rounded-full animate-pulse border border-transparent"></div>
    );
  }

  return (
    <div className="relative z-50" ref={dropdownRef}>
      {/* Background Blur Overlay for Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}
            className="fixed inset-0 bg-black/25 backdrop-blur-[10px] z-40" 
            onClick={() => setIsOpen(false)}
          />
        )}
      </AnimatePresence>
      
      {/* Trigger Button */}
      <button 
        onClick={toggleDropdown}
        className="flex items-center gap-2 hover:bg-input p-1 pr-3 rounded-full border border-transparent hover:border-border transition-all focus:outline-none focus:ring-2 focus:ring-foreground focus:border-transparent relative z-50"
        aria-haspopup="true"
        aria-expanded={isOpen}
      >
        <div className="relative">
          <div className="w-9 h-9 rounded-full bg-foreground flex items-center justify-center text-foreground font-bold text-sm shadow-sm overflow-hidden">
            {user?.profileImage ? (
              <OptimizedImage src={user.profileImage} alt={user.firstName} className="w-full h-full object-cover" />
            ) : (
              <span className="uppercase">{user?.firstName?.[0] || 'G'}</span>
            )}
          </div>
          {/* Online Indicator */}
          <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-border rounded-full"></span>
        </div>
        <div className="hidden sm:block text-left">
          <p className="text-xs font-bold text-foreground leading-tight truncate max-w-[120px]">
            {user?.firstName ? `${user.firstName} ${user.lastName}` : 'Guest User'}
          </p>
          <p className="text-[10px] font-bold text-foreground uppercase leading-tight tracking-wider">
            {role.replace('_', ' ')}
          </p>
        </div>
      </button>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            style={{ transformOrigin: 'top right' }}
            className="absolute right-0 mt-[12px] w-[320px] bg-card/95 backdrop-blur-xl border border-border rounded-[20px] shadow-2xl overflow-hidden premium-hover z-50"
          >
            {/* Profile Card Header */}
            <div className="p-5 border-b border-border bg-gradient-to-br from-card to-white">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-foreground flex items-center justify-center text-foreground font-bold text-xl shadow-md overflow-hidden shrink-0">
                  {user?.profileImage ? (
                    <OptimizedImage src={user.profileImage} alt={user.firstName} className="w-full h-full object-cover" />
                  ) : (
                    <span className="uppercase">{user?.firstName?.[0] || 'G'}</span>
                  )}
                </div>
                <div className="overflow-hidden">
                  <h4 className="text-lg font-extrabold text-foreground truncate">
                    {user?.firstName ? `${user.firstName} ${user.lastName}` : 'Guest User'}
                  </h4>
                  <p className="text-sm text-muted-foreground truncate">{user?.email || 'guest@juzdog.com'}</p>
                  <div className="mt-1 flex items-center gap-2">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-foreground/10 text-foreground text-[10px] font-bold uppercase tracking-wider">
                      {role.replace('_', ' ')}
                    </span>
                    <span className="text-[10px] text-muted-foreground font-medium whitespace-nowrap">Last login: Today</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Menu Links */}
            <div className="p-2 max-h-[60vh] overflow-y-auto hide-scrollbar">
              
              {/* Common Profile Section */}
              <div className="mb-2">
                <Link href={`${basePath}/profile`} onClick={() => setIsOpen(false)} className="w-full flex items-center px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-card hover:text-foreground rounded-xl transition-colors">
                  <User className="w-4 h-4 mr-3 text-muted-foreground" /> My Profile
                </Link>
                <Link href={`${basePath}/settings`} onClick={() => setIsOpen(false)} className="w-full flex items-center px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-card hover:text-foreground rounded-xl transition-colors">
                  <Settings className="w-4 h-4 mr-3 text-muted-foreground" /> Account Settings
                </Link>
                <Link href={`${basePath}/security`} onClick={() => setIsOpen(false)} className="w-full flex items-center px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-card hover:text-foreground rounded-xl transition-colors">
                  <Shield className="w-4 h-4 mr-3 text-muted-foreground" /> Security & 2FA
                </Link>
              </div>

              <div className="h-px bg-input my-2 mx-3"></div>

              {/* Role Specific Sections */}
              {(role === 'USER' || role === 'EVENT_MANAGER') && (
                <div className="mb-2">
                  <p className="px-3 py-1 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Platform</p>
                  <Link href="/dashboard/dogs" onClick={() => setIsOpen(false)} className="w-full flex items-center px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-card hover:text-foreground rounded-xl transition-colors">
                    <Dog className="w-4 h-4 mr-3 text-muted-foreground" /> My Dogs
                  </Link>
                  <Link href="/dashboard/events/registered" onClick={() => setIsOpen(false)} className="w-full flex items-center px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-card hover:text-foreground rounded-xl transition-colors">
                    <Calendar className="w-4 h-4 mr-3 text-muted-foreground" /> My Events
                  </Link>
                  <Link href="/dashboard/payments/transactions" onClick={() => setIsOpen(false)} className="w-full flex items-center px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-card hover:text-foreground rounded-xl transition-colors">
                    <CreditCard className="w-4 h-4 mr-3 text-muted-foreground" /> Payments
                  </Link>
                  <Link href="/dashboard/dogs/certificates" onClick={() => setIsOpen(false)} className="w-full flex items-center px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-card hover:text-foreground rounded-xl transition-colors">
                    <FileBadge className="w-4 h-4 mr-3 text-muted-foreground" /> Certificates
                  </Link>
                </div>
              )}

              {role === 'ADMIN' && (
                <div className="mb-2">
                  <p className="px-3 py-1 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Admin Quick Actions</p>
                  <Link href="/admin/users" onClick={() => setIsOpen(false)} className="w-full flex items-center px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-card hover:text-foreground rounded-xl transition-colors">
                    <Users className="w-4 h-4 mr-3 text-muted-foreground" /> User Database
                  </Link>
                </div>
              )}

              {role === 'JUDGE' && (
                <div className="mb-2">
                  <p className="px-3 py-1 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Judging</p>
                  <Link href="/dashboard/judge/assignments" onClick={() => setIsOpen(false)} className="w-full flex items-center px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-card hover:text-foreground rounded-xl transition-colors">
                    <Award className="w-4 h-4 mr-3 text-muted-foreground" /> Assigned Competitions
                  </Link>
                </div>
              )}

              <div className="h-px bg-input my-2 mx-3"></div>

              {/* Theme Toggle Placeholder */}
              <button className="w-full flex items-center justify-between px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-card rounded-xl transition-colors">
                <div className="flex items-center">
                  <Moon className="w-4 h-4 mr-3 text-muted-foreground" /> Dark Mode
                </div>
                <div className="w-8 h-4 bg-gray-200 rounded-full relative">
                  <div className="w-3 h-3 bg-card rounded-full absolute top-0.5 left-0.5 shadow-sm"></div>
                </div>
              </button>
            </div>

            {/* Footer / Logout */}
            <div className="p-2 border-t border-border bg-card/50">
              <button 
                onClick={() => {
                  setIsOpen(false);
                  setIsLogoutModalOpen(true);
                }} 
                className="w-full flex items-center px-3 py-2.5 text-sm font-bold text-red-600 hover:bg-red-50 hover:text-red-700 rounded-xl transition-colors group"
              >
                <LogOut className="w-4 h-4 mr-3 group-hover:-translate-x-1 transition-transform" /> Sign Out
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <LogoutModal isOpen={isLogoutModalOpen} onClose={() => setIsLogoutModalOpen(false)} />
    </div>
  );
}
