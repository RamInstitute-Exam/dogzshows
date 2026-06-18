'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import * as Icons from 'lucide-react';
import { Menu, Search, MessageSquare, ChevronRight, Settings } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import NotificationDropdown from '@/components/shared/NotificationDropdown';
import ProfileDropdown from '@/components/shared/ProfileDropdown';
import ThemeToggle from '@/components/shared/ThemeToggle';
import api from '@/lib/api';
import { ADMIN_ROUTES } from '@/config/navigation';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user } = useAuthStore();
  const role = user?.roles?.[0] || 'SUPER_ADMIN';
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);
  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const activeRoute = ADMIN_ROUTES.find((r: any) => 
      r.children && r.children.some((c: any) => pathname.startsWith(c.href))
    );
    if (activeRoute) {
      setOpenMenus(prev => ({ ...prev, [activeRoute.name]: true }));
    }
  }, [pathname]);

  const toggleMenu = (name: string) => {
    setOpenMenus(prev => ({ ...prev, [name]: !prev[name] }));
  };

  return (
    <div className="min-h-screen bg-card flex flex-col selection:bg-brand-orange selection:text-foreground font-sans">
      
      <header className="fixed top-0 w-full h-[72px] bg-background text-foreground border-b border-border z-50 flex items-center justify-between pl-6 pr-4">
        
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setIsMobileDrawerOpen(true)} 
            className="lg:hidden p-2 hover:bg-accent rounded-lg text-muted-foreground transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>
          
          <button 
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)} 
            className="hidden lg:block p-2 hover:bg-accent rounded-lg text-muted-foreground transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>
          
          <div className="flex items-center">
            <Link href="/admin" className="flex items-center h-full">
              <img src="/Untitled-1.png" alt="JuzDog Admin" className="w-[110px] md:w-[130px] lg:w-[160px] h-auto object-contain transition-all hover:opacity-90" />
            </Link>
          </div>
        </div>

        {/* Center: Global Search */}
        <div className="hidden lg:flex flex-1 max-w-xl mx-8">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input 
              type="text" 
              placeholder="Search by user ID, KCI number, or transaction hash..." 
              className="w-full pl-10 pr-4 py-2 bg-card border border-border focus:border-red-500 focus:bg-card text-foreground rounded-xl outline-none transition-all text-sm"
            />
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2 sm:gap-4">
          <button className="p-2 text-muted-foreground hover:text-foreground hover:bg-accent rounded-full transition-colors hidden sm:block"><MessageSquare className="w-5 h-5" /></button>
          
          <ThemeToggle />

          <NotificationDropdown />
          
          <div className="h-8 w-px bg-accent mx-2 hidden sm:block"></div>
          
          <ProfileDropdown />
        </div>
      </header>

      <div className="flex flex-1 pt-[72px] w-full min-w-0">
        {/* Sidebar */}
        <motion.aside 
          animate={{ width: isSidebarCollapsed ? 80 : 280 }}
          transition={{ type: "spring", bounce: 0, duration: 0.3 }}
          className="bg-background border-r border-border hidden lg:flex flex-col sticky top-[72px] h-[calc(100vh-72px)] overflow-hidden z-40 flex-shrink-0 text-muted-foreground"
        >
          <div className="flex-1 py-6 overflow-y-auto">
            
            <div className="px-4 mb-4">
              <p className={`text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 ${isSidebarCollapsed ? 'text-center' : ''}`}>Core</p>
              
              <nav className="space-y-1">
                {ADMIN_ROUTES.map((route: any) => {
                  const hasChildren = route.children && route.children.length > 0;
                  const isActive = pathname === route.href || (hasChildren && route.children.some((c: any) => pathname.startsWith(c.href)));
                  const isOpen = openMenus[route.name];
                  const Icon = route.icon || Icons.Circle;

                  return (
                    <div key={route.name}>
                      {hasChildren ? (
                        <button onClick={() => toggleMenu(route.name)} className={`w-full flex items-center justify-between ${isSidebarCollapsed ? 'px-0 justify-center' : 'px-4'} py-3 text-sm font-medium rounded-xl transition-colors ${isActive ? 'bg-red-500/10 text-red-500' : 'hover:bg-card hover:text-foreground'}`}>
                          <div className="flex items-center">
                            <Icon className={`w-5 h-5 ${isSidebarCollapsed ? '' : 'mr-3'} ${isActive ? 'text-red-500' : 'text-muted-foreground'}`} />
                            {!isSidebarCollapsed && <span>{route.name}</span>}
                          </div>
                          {!isSidebarCollapsed && <Icons.ChevronRight className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-90' : ''}`} />}
                        </button>
                      ) : (
                        <Link href={route.href || '#'} className={`flex items-center ${isSidebarCollapsed ? 'justify-center px-0' : 'px-4'} py-3 text-sm font-medium rounded-xl transition-colors ${isActive ? 'bg-red-500/10 text-red-500' : 'hover:bg-card hover:text-foreground'}`} title={route.name}>
                          <Icon className={`w-5 h-5 ${isSidebarCollapsed ? '' : 'mr-3'} ${isActive ? 'text-red-500' : 'text-muted-foreground'}`} />
                          {!isSidebarCollapsed && <span>{route.name}</span>}
                        </Link>
                      )}

                      {/* Render Children if open */}
                      {hasChildren && !isSidebarCollapsed && (
                        <AnimatePresence>
                          {isOpen && (
                            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                              <div className="pl-11 py-2 space-y-1">
                                {route.children.map((child: any) => (
                                  <Link key={child.name} href={child.href || '#'} className={`block py-2 text-sm font-medium ${pathname === child.href ? 'text-red-500' : 'text-muted-foreground hover:text-foreground transition-colors'}`}>
                                    {child.name}
                                  </Link>
                                ))}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      )}
                    </div>
                  );
                })}
              </nav>
            </div>

          </div>

          {/* Removed Logout from Sidebar footer */}
        </motion.aside>

        {/* Mobile Sidebar Drawer */}
        <AnimatePresence>
          {isMobileDrawerOpen && (
            <div className="fixed inset-0 z-[1200] lg:hidden flex">
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                onClick={() => setIsMobileDrawerOpen(false)}
              />
              <motion.div 
                initial={{ x: '-100%' }}
                animate={{ x: 0 }}
                exit={{ x: '-100%' }}
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                className="relative w-[280px] h-full bg-background shadow-2xl flex flex-col"
              >
                <div className="flex-1 py-6 overflow-y-auto mt-[72px]">
                  <div className="px-4 mb-4">
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Core</p>
                    <nav className="space-y-1">
                      {ADMIN_ROUTES.map((route: any) => {
                        const hasChildren = route.children && route.children.length > 0;
                        const isActive = pathname === route.href || (hasChildren && route.children.some((c: any) => pathname.startsWith(c.href)));
                        const isOpen = openMenus[route.name];
                        const Icon = route.icon || Icons.Circle;

                        return (
                          <div key={route.name}>
                            {hasChildren ? (
                              <button onClick={() => toggleMenu(route.name)} className={`w-full flex items-center justify-between px-4 py-3 text-sm font-medium rounded-xl transition-colors ${isActive ? 'bg-red-500/10 text-red-500' : 'hover:bg-card text-muted-foreground hover:text-foreground'}`}>
                                <div className="flex items-center">
                                  <Icon className={`w-5 h-5 mr-3 ${isActive ? 'text-red-500' : 'text-muted-foreground'}`} />
                                  <span>{route.name}</span>
                                </div>
                                <ChevronRight className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-90' : ''}`} />
                              </button>
                            ) : (
                              <Link href={route.href || '#'} onClick={() => setIsMobileDrawerOpen(false)} className={`flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-colors ${isActive ? 'bg-red-500/10 text-red-500' : 'hover:bg-card text-muted-foreground hover:text-foreground'}`}>
                                <Icon className={`w-5 h-5 mr-3 ${isActive ? 'text-red-500' : 'text-muted-foreground'}`} />
                                <span>{route.name}</span>
                              </Link>
                            )}

                            {/* Render Children if open */}
                            {hasChildren && (
                              <AnimatePresence>
                                {isOpen && (
                                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                                    <div className="pl-11 py-2 space-y-1">
                                      {route.children.map((child: any) => (
                                        <Link key={child.name} href={child.href || '#'} onClick={() => setIsMobileDrawerOpen(false)} className={`block py-2 text-sm font-medium ${pathname === child.href ? 'text-red-500' : 'text-muted-foreground hover:text-foreground transition-colors'}`}>
                                          {child.name}
                                        </Link>
                                      ))}
                                    </div>
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            )}
                          </div>
                        );
                      })}
                    </nav>
                  </div>
                  <div className="px-4 mt-8">
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Configuration</p>
                    <nav className="space-y-1">
                      <Link href="/admin/settings" onClick={() => setIsMobileDrawerOpen(false)} className="flex items-center px-4 py-3 text-sm font-medium rounded-xl hover:bg-card text-muted-foreground hover:text-foreground">
                        <Settings className="w-5 h-5 mr-3 text-muted-foreground" />
                        <span>System Settings</span>
                      </Link>
                    </nav>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Content Area */}
        <div className="flex-1 flex flex-col min-w-0 w-full max-w-full">
          <motion.main 
            className="flex-1 w-full max-w-full p-5 overflow-hidden box-border"
          >
            <div className="w-full max-w-full  transition-all duration-300">
              
              {/* Dynamic Breadcrumbs */}
              {pathname !== '/admin' && (
                <div className="flex flex-wrap items-center gap-2 text-sm font-medium text-muted-foreground mb-2">
                  <Link href="/admin" className="hover:text-foreground transition-colors">Admin</Link>
                  {pathname.split('/').filter(Boolean).slice(1).map((segment, index, arr) => {
                    const isLast = index === arr.length - 1;
                    const href = `/admin/${arr.slice(0, index + 1).join('/')}`;
                    const title = segment.replace(/-/g, ' ');
                    
                    return (
                      <div key={href} className="flex items-center gap-2">
                        <span className="text-muted-foreground">/</span>
                        {isLast ? (
                          <span className="text-foreground capitalize">{title}</span>
                        ) : (
                          <Link href={href} className="hover:text-foreground transition-colors capitalize">{title}</Link>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {children}
            </div>
          </motion.main>
        </div>
      </div>

    </div>
  );
}
