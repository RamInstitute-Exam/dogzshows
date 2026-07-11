'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { 
  Home, User, Dog, Calendar, CreditCard, Award, Bell, Settings, 
  LogOut, FileBadge, Menu, Search, MessageSquare, Moon, ChevronRight, Download, LifeBuoy
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { USER_ROUTES, ADMIN_ROUTES } from '@/config/navigation';
import NotificationDropdown from '@/components/shared/NotificationDropdown';
import ProfileDropdown from '@/components/shared/ProfileDropdown';
import ThemeToggle from '@/components/shared/ThemeToggle';
import { useQueryClient } from '@tanstack/react-query';
import axiosInstance from '@/lib/axios';
import { Spinner } from '@/components/common/loader/Spinner';
import { useRouter } from 'next/navigation';
import OptimizedImage from '@/components/shared/OptimizedImage';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAuthenticated } = useAuthStore();
  const [mounted, setMounted] = useState(false);
  
  // Extract and normalize roles to uppercase
  const roles = user?.roles?.map((r: any) => typeof r === 'string' ? r.toUpperCase() : r.role?.name?.toUpperCase()) || [];
  const isAdminOrSuperAdmin = roles.includes('SUPER_ADMIN') || roles.includes('SUPER ADMIN') || roles.includes('ADMIN');

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);
  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({});

  useEffect(() => {
    setMounted(true);
  }, []);

  // Auto-collapse sidebar on tablet/smaller desktop, expand on large desktop, and close mobile drawer
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1280) {
        setIsSidebarCollapsed(true);
      } else {
        setIsSidebarCollapsed(false);
      }
      if (window.innerWidth >= 1024) {
        setIsMobileDrawerOpen(false);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleMenu = (name: string) => {
    setOpenMenus(prev => ({ ...prev, [name]: !prev[name] }));
  };

  const queryClient = useQueryClient();
  const handleRouteHover = (href: string) => {
    if (href === '/dashboard') {
      queryClient.prefetchQuery({
        queryKey: ['userDashboardStats'],
        queryFn: () => axiosInstance.get('/dashboard/stats').then(r => r.data.data)
      });
    }
  };

  const allowedRoutes = isAdminOrSuperAdmin
    ? ADMIN_ROUTES
    : USER_ROUTES.filter(route => route.roles?.some(r => roles.includes(r.toUpperCase())));

  useEffect(() => {
    if (mounted && !isAuthenticated && !user) {
      router.replace('/');
    } else if (mounted && isAdminOrSuperAdmin) {
      router.replace('/admin');
    }
  }, [mounted, isAuthenticated, user, isAdminOrSuperAdmin, router]);

  if (!mounted || (!isAuthenticated && !user)) {
    return <Spinner fullScreen />;
  }

  if (isAdminOrSuperAdmin) {
    return <Spinner fullScreen />;
  }

  return (
    <div className="min-h-screen bg-card flex flex-col selection:bg-foreground selection:text-foreground font-sans">
      
      {/* Top Header */}
      <header className="fixed top-0 w-full h-[72px] bg-card/80 backdrop-blur-md border-b border-border z-[100] flex items-center justify-between pl-6 pr-4">
        
        {/* Left: Sidebar Toggle, Logo */}
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setIsMobileDrawerOpen(true)} 
            className="lg:hidden p-2 hover:bg-input rounded-lg text-muted-foreground transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>
          
          <button 
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)} 
            className="hidden lg:block p-2 hover:bg-input rounded-lg text-muted-foreground transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>
          
          <div className="flex items-center">
            {isSidebarCollapsed ? (
              <div className="w-8 h-8 bg-foreground rounded-lg flex items-center justify-center shrink-0 hidden lg:flex">
                <Dog className="w-5 h-5 text-background" />
              </div>
            ) : null}
            <Link href="/" className={`${isSidebarCollapsed ? 'lg:hidden' : ''} flex items-center h-full`}>
              <OptimizedImage src="/Untitled-1.png" alt="JuzDog Logo" className="w-[110px] md:w-[130px] lg:w-[160px] h-auto object-contain transition-all hover:opacity-90" />
            </Link>
          </div>
        </div>

        {/* Center: Global Search */}
        <div className="hidden lg:flex flex-1 max-w-xl mx-8">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input 
              type="text" 
              placeholder="Search dogs, events, or transactions..." 
              className="w-full pl-10 pr-4 py-2 bg-input/50 border border-transparent focus:border-border focus:bg-card rounded-xl outline-none transition-all text-sm text-foreground placeholder:text-muted-foreground"
            />
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2 sm:gap-4">
          <button className="p-2 text-muted-foreground hover:text-foreground hover:bg-input rounded-full transition-colors hidden sm:block"><MessageSquare className="w-5 h-5" /></button>
          
          <ThemeToggle />

          <NotificationDropdown />
          
          <div className="h-8 w-px bg-border mx-2 hidden sm:block"></div>
          
          <ProfileDropdown />
        </div>
      </header>

      <div className="flex flex-1 pt-[72px] relative w-full min-w-0">
        {/* Sidebar (Desktop Only) */}
        <motion.aside 
          animate={{ width: isSidebarCollapsed ? 80 : 280 }}
          transition={{ type: "spring", bounce: 0, duration: 0.3 }}
          className="bg-card border-r border-border hidden lg:flex flex-col fixed h-[calc(100vh-72px)] overflow-hidden z-40"
        >
          <div className="flex-1 py-6 overflow-y-auto">
            
            <div className="px-4 mb-4">
              <p className={`text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 ${isSidebarCollapsed ? 'text-center' : ''}`}>Menu</p>
              <nav className="space-y-1">
                {allowedRoutes.map(route => {
                  const Icon = route.icon;
                  const hasChildren = !!route.children;
                  const isActive = pathname === route.href || (hasChildren && route.children?.some(c => pathname.startsWith(c.href)));
                  const isOpen = openMenus[route.name];

                  return (
                    <div key={route.name}>
                      {hasChildren ? (
                        <button onClick={() => toggleMenu(route.name)} className={`w-full flex items-center justify-between ${isSidebarCollapsed ? 'px-0 justify-center' : 'px-4'} py-3 text-sm font-medium rounded-xl transition-colors ${isActive ? 'bg-foreground/10 text-foreground' : 'text-muted-foreground hover:bg-card hover:text-foreground'}`}>
                          <div className="flex items-center">
                            <Icon className={`w-5 h-5 ${isSidebarCollapsed ? '' : 'mr-3'} ${isActive ? 'text-foreground' : 'text-muted-foreground'}`} />
                            {!isSidebarCollapsed && <span>{route.name}</span>}
                          </div>
                          {!isSidebarCollapsed && <ChevronRight className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-90' : ''}`} />}
                        </button>
                      ) : (
                        <Link href={route.href!} onMouseEnter={() => handleRouteHover(route.href!)} className={`flex items-center ${isSidebarCollapsed ? 'justify-center px-0' : 'px-4'} py-3 text-sm font-medium rounded-xl transition-colors ${isActive ? 'bg-foreground/10 text-foreground' : 'hover:bg-card hover:text-foreground'}`} title={route.name}>
                          <Icon className={`w-5 h-5 ${isSidebarCollapsed ? '' : 'mr-3'} ${isActive ? 'text-foreground' : 'text-muted-foreground'}`} />
                          {!isSidebarCollapsed && <span>{route.name}</span>}
                        </Link>
                      )}

                      {/* Render Children if open */}
                      {hasChildren && !isSidebarCollapsed && (
                        <AnimatePresence>
                          {isOpen && (
                            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                              <div className="pl-11 py-2 space-y-1">
                                {route.children?.map(child => (
                                  <Link key={child.name} href={child.href} onMouseEnter={() => handleRouteHover(child.href)} className={`block py-2 text-sm font-medium ${pathname === child.href ? 'text-foreground' : 'text-muted-foreground hover:text-foreground transition-colors'}`}>
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
              <p className={`text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 ${isSidebarCollapsed ? 'text-center' : ''}`}>System</p>
              <nav className="space-y-1">
                <Link href="/dashboard/settings" className={`flex items-center ${isSidebarCollapsed ? 'justify-center px-0' : 'px-4'} py-3 text-sm font-medium rounded-xl text-muted-foreground hover:bg-card hover:text-foreground`} title="Settings">
                  <Settings className={`w-5 h-5 ${isSidebarCollapsed ? '' : 'mr-3'} text-muted-foreground`} />
                  {!isSidebarCollapsed && <span>Settings</span>}
                </Link>
                <Link href="/dashboard/support" className={`flex items-center ${isSidebarCollapsed ? 'justify-center px-0' : 'px-4'} py-3 text-sm font-medium rounded-xl text-muted-foreground hover:bg-card hover:text-foreground`} title="Support">
                  <LifeBuoy className={`w-5 h-5 ${isSidebarCollapsed ? '' : 'mr-3'} text-muted-foreground`} />
                  {!isSidebarCollapsed && <span>Support</span>}
                </Link>
              </nav>
            </div>

          </div>
        </motion.aside>

        {/* Mobile Navigation Drawer */}
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
                className="relative w-[280px] h-full bg-card shadow-2xl flex flex-col border-r border-border"
              >
                <div className="flex-1 py-6 overflow-y-auto mt-[72px]">
                  <div className="px-4 mb-4">
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Menu</p>
                    <nav className="space-y-1">
                      {allowedRoutes.map(route => {
                        const Icon = route.icon;
                        const hasChildren = !!route.children;
                        const isActive = pathname === route.href || (hasChildren && route.children?.some(c => pathname.startsWith(c.href)));
                        const isOpen = openMenus[route.name];

                        return (
                          <div key={route.name}>
                            {hasChildren ? (
                              <button onClick={() => toggleMenu(route.name)} className={`w-full flex items-center justify-between px-4 py-3 text-sm font-medium rounded-xl transition-colors ${isActive ? 'bg-foreground/10 text-foreground' : 'text-muted-foreground hover:bg-card hover:text-foreground'}`}>
                                <div className="flex items-center">
                                  <Icon className={`w-5 h-5 mr-3 ${isActive ? 'text-foreground' : 'text-muted-foreground'}`} />
                                  <span>{route.name}</span>
                                </div>
                                <ChevronRight className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-90' : ''}`} />
                              </button>
                            ) : (
                              <Link href={route.href!} onClick={() => setIsMobileDrawerOpen(false)} onMouseEnter={() => handleRouteHover(route.href!)} className={`flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-colors ${isActive ? 'bg-foreground/10 text-foreground' : 'text-muted-foreground hover:bg-card hover:text-foreground'}`}>
                                <Icon className={`w-5 h-5 mr-3 ${isActive ? 'text-foreground' : 'text-muted-foreground'}`} />
                                <span>{route.name}</span>
                              </Link>
                            )}

                            {/* Render Children if open */}
                            {hasChildren && (
                              <AnimatePresence>
                                {isOpen && (
                                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                                    <div className="pl-11 py-2 space-y-1">
                                      {route.children?.map(child => (
                                        <Link key={child.name} href={child.href} onClick={() => setIsMobileDrawerOpen(false)} onMouseEnter={() => handleRouteHover(child.href)} className={`block py-2 text-sm font-medium ${pathname === child.href ? 'text-foreground' : 'text-muted-foreground hover:text-foreground transition-colors'}`}>
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
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">System</p>
                    <nav className="space-y-1">
                      <Link href="/dashboard/settings" onClick={() => setIsMobileDrawerOpen(false)} className="flex items-center px-4 py-3 text-sm font-medium rounded-xl text-muted-foreground hover:bg-card hover:text-foreground">
                        <Settings className="w-5 h-5 mr-3 text-muted-foreground" />
                        <span>Settings</span>
                      </Link>
                      <Link href="/dashboard/support" onClick={() => setIsMobileDrawerOpen(false)} className="flex items-center px-4 py-3 text-sm font-medium rounded-xl text-muted-foreground hover:bg-card hover:text-foreground">
                        <LifeBuoy className="w-5 h-5 mr-3 text-muted-foreground" />
                        <span>Support</span>
                      </Link>
                    </nav>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Content Area */}
        <main 
          className={`flex-1 px-4 sm:px-8 pb-8 pt-6 w-full min-w-0 transition-all duration-300 ${
            isSidebarCollapsed ? 'lg:pl-[80px]' : 'lg:pl-[280px]'
          }`}
          style={{ paddingTop: 0 }}
        >
          <div className="w-full max-w-[1600px] mx-auto">
            
            {/* Dynamic Breadcrumbs */}
            {pathname !== '/dashboard' && (
              <div className="flex flex-wrap items-center gap-2 text-sm font-medium text-muted-foreground mb-2 mt-4 lg:mt-0">
                <Link href="/dashboard" className="hover:text-foreground transition-colors">Dashboard</Link>
                {pathname.split('/').filter(Boolean).slice(1).map((segment, index, arr) => {
                  const isLast = index === arr.length - 1;
                  const href = `/dashboard/${arr.slice(0, index + 1).join('/')}`;
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
        </main>
      </div>

    </div>
  );
}
