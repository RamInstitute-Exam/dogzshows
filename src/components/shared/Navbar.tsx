"use client";

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import {
  Menu as MenuIcon, X, ChevronDown, ExternalLink,
} from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '@/store/useAuthStore';
import { useAuthModalStore } from '@/store/useAuthModalStore';
import { ThemeToggle } from '@/components/theme/ThemeToggle';
import { useNavMenus, NavMenuItem } from '@/hooks/useNavMenus';

// ── Skeleton ───────────────────────────────────────────────────────────────

function NavSkeleton() {
  return (
    <>
      {[60, 110, 65, 120, 55, 60, 50, 65].map((w, i) => (
        <li key={i} className="flex items-center h-full">
          <div
            className="h-3.5 rounded-full bg-muted/40 animate-pulse"
            style={{ width: w }}
          />
        </li>
      ))}
    </>
  );
}

// ── Recursive desktop dropdown ─────────────────────────────────────────────

function DropdownPanel({
  items,
  depth = 0,
}: {
  items: NavMenuItem[];
  depth?: number;
}) {
  const [subId, setSubId] = useState<string | null>(null);

  return (
    <div className="bg-card border border-border rounded-2xl shadow-2xl py-2 min-w-[220px] overflow-visible">
      {items.map((item) => (
        <div
          key={item.id}
          className="relative group/sub"
          onMouseEnter={() => setSubId(item.id)}
          onMouseLeave={() => setSubId(null)}
        >
          <Link
            href={item.url === '#' && (item.children?.length ?? 0) > 0 ? '#' : item.url}
            target={item.openNewTab ? '_blank' : undefined}
            rel={item.openNewTab ? 'noopener noreferrer' : undefined}
            onClick={e => item.url === '#' && e.preventDefault()}
            className="group flex items-center justify-between px-4 py-[11px] text-[14px] font-medium text-foreground hover:bg-[var(--nav-text-active)]/10 hover:text-[var(--nav-text-active)] hover:pl-6 transition-all duration-150 whitespace-nowrap rounded-xl mx-1"
          >
            <span className="flex items-center gap-2">
              {item.name}
              {item.badge && (
                <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-[var(--nav-text-active)]/15 text-[var(--nav-text-active)]">
                  {item.badge}
                </span>
              )}
            </span>
            <span className="flex items-center gap-1 ml-6">
              {item.openNewTab && <ExternalLink className="w-2.5 h-2.5 opacity-40" />}
              {(item.children?.length ?? 0) > 0 && (
                <ChevronDown className="w-3 h-3 opacity-50 -rotate-90" />
              )}
            </span>
          </Link>

          {/* Nested sub-panel */}
          <AnimatePresence>
            {(item.children?.length ?? 0) > 0 && subId === item.id && (
              <motion.div
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -6 }}
                transition={{ duration: 0.13 }}
                className="absolute top-0 left-full ml-1 z-9999"
              >
                <DropdownPanel items={item.children} depth={depth + 1} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ))}
    </div>
  );
}

// ── Desktop nav item with hover-stable dropdown ────────────────────────────

function NavItem({ menu, pathname }: { menu: NavMenuItem; pathname: string }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLLIElement>(null);

  const hasChildren = (menu.children?.length ?? 0) > 0;
  const active =
    pathname === menu.url ||
    (menu.url !== '/' && menu.url !== '#' && pathname.startsWith(menu.url));

  const labelClass = [
    'flex items-center gap-[5px] whitespace-nowrap',
    'text-[16px] xl:text-[18px] font-semibold transition-colors duration-200 cursor-pointer',
    'relative select-none nav-menu-link tracking-[0.2px]',
    active ? 'text-[var(--nav-text-active)] active' : 'text-[var(--nav-text)] opacity-80 hover:opacity-100 hover:text-[var(--nav-text-active)]',
  ].join(' ');

  // Click outside listener
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [open]);

  // Escape key listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false);
        ref.current?.querySelector('button')?.focus();
      }
    };
    if (open) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [open]);

  const handleBlur = (e: React.FocusEvent) => {
    if (!ref.current?.contains(e.relatedTarget as Node)) {
      setOpen(false);
    }
  };

  return (
    <li
      ref={ref}
      className="nav-item"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onBlur={handleBlur}
    >
      {/* Label */}
      {hasChildren ? (
        <button
          className={labelClass}
          onClick={() => setOpen(v => !v)}
          aria-haspopup="true"
          aria-expanded={open}
          aria-label={menu.name}
        >
          {menu.name}
          {menu.badge && (
            <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-[var(--nav-text-active)]/15 text-[var(--nav-text-active)]">
              {menu.badge}
            </span>
          )}
          <ChevronDown
            className="w-3.5 h-3.5 flex-shrink-0 transition-transform duration-200 ml-[6px]"
            style={{ transform: open ? 'rotate(180deg)' : 'none' }}
          />
          {active && (
            <motion.span
              layoutId="nav-active"
              className="absolute bottom-0 left-0 right-0 h-[3px] bg-[var(--nav-text-active)] rounded-[20px]"
              transition={{ type: 'spring', stiffness: 380, damping: 30 }}
            />
          )}
        </button>
      ) : (
        <Link
          href={menu.url}
          target={menu.openNewTab ? '_blank' : undefined}
          rel={menu.openNewTab ? 'noopener noreferrer' : undefined}
          className={labelClass}
        >
          {menu.name}
          {menu.badge && (
            <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-[var(--nav-text-active)]/15 text-[var(--nav-text-active)]">
              {menu.badge}
            </span>
          )}
          {menu.openNewTab && <ExternalLink className="w-3 h-3 opacity-40" />}
          {active && (
            <motion.span
              layoutId="nav-active"
              className="absolute bottom-0 left-0 right-0 h-[3px] bg-[var(--nav-text-active)] rounded-[20px]"
              transition={{ type: 'spring', stiffness: 380, damping: 30 }}
            />
          )}
        </Link>
      )}

      {/* Dropdown — same hover zone as label (both inside li) */}
      <AnimatePresence>
        {hasChildren && open && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="absolute top-full left-0 z-9999"
          >
            <DropdownPanel items={menu.children} depth={0} />
          </motion.div>
        )}
      </AnimatePresence>
    </li>
  );
}

// ── Recursive mobile item ──────────────────────────────────────────────────

function MobileMenuItem({
  menu,
  onNavigate,
  depth = 0,
}: {
  menu: NavMenuItem;
  onNavigate: () => void;
  depth?: number;
}) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const hasChildren = (menu.children?.length ?? 0) > 0;
  const active =
    pathname === menu.url ||
    (menu.url !== '/' && menu.url !== '#' && pathname.startsWith(menu.url));

  const isTop = depth === 0;

  const style = isTop
    ? {
        height: '56px',
        fontSize: '18px',
        fontWeight: 600,
        borderBottom: '1px solid var(--border-color)',
        color: active ? 'var(--nav-text-active)' : 'var(--foreground)',
      }
    : {
        height: '48px',
        fontSize: '16px',
        fontWeight: 500,
        color: active ? 'var(--nav-text-active)' : 'var(--muted-foreground)',
        paddingLeft: `${depth * 20}px`,
      };

  const linkClass = "flex items-center px-3 justify-between w-full transition-colors duration-150 hover:text-[var(--nav-text-active)] hover:bg-black/5 dark:hover:bg-white/5 bg-transparent border-none text-left cursor-pointer";

  if (!hasChildren) {
    return (
      <Link
        href={menu.url}
        target={menu.openNewTab ? '_blank' : undefined}
        rel={menu.openNewTab ? 'noopener noreferrer' : undefined}
        onClick={onNavigate}
        className={linkClass}
        style={style}
      >
        <span className="flex items-center gap-2">
          {menu.name}
          {menu.badge && (
            <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-[var(--nav-text-active)]/15 text-[var(--nav-text-active)]">
              {menu.badge}
            </span>
          )}
        </span>
        {menu.openNewTab && <ExternalLink className="w-3.5 h-3.5 opacity-60" />}
      </Link>
    );
  }

  return (
    <div className="w-full flex flex-col">
      <button
        onClick={() => setOpen(v => !v)}
        className={linkClass}
        style={style}
      >
        <span className="flex items-center gap-2">
          {menu.name}
          {menu.badge && (
            <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-[var(--nav-text-active)]/15 text-[var(--nav-text-active)]">
              {menu.badge}
            </span>
          )}
        </span>
        <ChevronDown
          className="w-4 h-4 flex-shrink-0 transition-transform duration-200 opacity-60"
          style={{ transform: open ? 'rotate(180deg)' : 'none' }}
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="overflow-hidden flex flex-col w-full"
          >
            {menu.children.map(child => (
              <MobileMenuItem
                key={child.id}
                menu={child}
                onNavigate={onNavigate}
                depth={depth + 1}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Main Navbar ────────────────────────────────────────────────────────────

export default function Navbar() {
  const pathname = usePathname();
  const { user, isAuthenticated, logout } = useAuthStore();
  const { openModal } = useAuthModalStore();

  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [showSkeleton, setShowSkeleton] = useState(true);

  // Public menus — no role filter; public navbar is identical for all users.
  // RBAC applies only inside /dashboard and /admin.
  const { data: menus = [], isLoading, isError } = useNavMenus();

  useEffect(() => { setMounted(true); }, []);
  useEffect(() => { setIsMobileOpen(false); }, [pathname]);
  useEffect(() => {
    document.body.style.overflow = isMobileOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isMobileOpen]);

  useEffect(() => {
    if (!isLoading || isError) {
      setShowSkeleton(false);
    }
  }, [isLoading, isError]);

  // Loading safety timeout: fallback if loading takes too long (e.g. backend cold start)
  useEffect(() => {
    if (isLoading) {
      const timer = setTimeout(() => {
        setShowSkeleton(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isLoading]);

  const showAuth = mounted ? !isAuthenticated : true;
  const displayMenus = menus;

  return (
    <>
      {/* ── NAVBAR ─────────────────────────────────────────── */}
      <header className="navbar-header text-foreground">
        <div className="header-container">

          {/* ── LEFT: LOGO ── */}
          <div className="nav-logo">
            <Link href="/" aria-label="JuzDog Home">
              <Image
                src="/Untitled-1.png"
                alt="JuzDog"
                width={145}
                height={45}
                priority
                className="header-logo-img"
              />
            </Link>
          </div>

          {/* ── CENTER: NAV — desktop only ── */}
          <nav aria-label="Main navigation" className="nav-center !hidden lg:!flex">
            <ul className="nav-menu">
              {!mounted || showSkeleton ? (
                <NavSkeleton />
              ) : (
                displayMenus.map(menu => (
                  <NavItem key={menu.id} menu={menu} pathname={pathname} />
                ))
              )}
            </ul>
          </nav>

          {/* ── RIGHT: ACTIONS ── */}
          <div className="nav-actions">


            {/* Auth — desktop */}
            {mounted && showAuth && (
              <>
                <button
                  onClick={() => openModal('LOGIN')}
                  className="!hidden lg:!inline-flex navbar-btn-premium navbar-btn-login"
                >
                  Login
                </button>
                {/*
                <button
                  onClick={() => openModal('REGISTER')}
                  className="!hidden lg:!inline-flex navbar-btn-premium navbar-btn-signup"
                >
                  Sign Up
                </button>
                <Link
                  href="/dogs/register"
                  className="!hidden lg:!inline-flex navbar-btn-premium navbar-btn-register"
                >
                  Register Dog
                </Link>
                */}
              </>
            )}

            {mounted && !showAuth && (
              <>
                  <Link
                    href={user?.roles?.[0] === 'SUPER_ADMIN' || user?.roles?.[0] === 'ADMIN' ? '/admin' : '/dashboard'}
                    className="navbar-btn-premium navbar-btn-dashboard hidden sm:flex"
                  >
                    Dashboard
                  </Link>
                <div
                  className="navbar-avatar !hidden lg:!flex"
                  title={user?.firstName}
                >
                  {user?.firstName?.[0]?.toUpperCase() ?? 'U'}
                </div>
              </>
            )}

            {/* Theme toggle — always visible */}
            <ThemeToggle />


            {/* Mobile hamburger */}
            <button
              className="lg:!hidden nav-hamburger-btn"
              onClick={() => setIsMobileOpen(true)}
              aria-label="Open menu"
            >
              <MenuIcon className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>



      {/* ── MOBILE DRAWER ───────────────────────────────────── */}
      <AnimatePresence>
        {isMobileOpen && (
          <>
            <motion.div
              key="overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileOpen(false)}
              className="fixed inset-0 bg-black/30 dark:bg-black/60 backdrop-blur-sm z-[99998] lg:!hidden"
            />

            <motion.aside
              key="drawer"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 h-full w-[320px] z-[99999] shadow-2xl flex flex-col lg:!hidden mobile-drawer-container"
              aria-label="Mobile navigation"
            >
              {/* Drawer header */}
              <div className="flex items-center justify-between mb-8">
                <Link href="/" onClick={() => setIsMobileOpen(false)} className="logo flex items-center">
                  <Image
                    src="/Untitled-1.png"
                    alt="JuzDog"
                    width={100}
                    height={30}
                    priority
                    className="object-contain"
                  />
                </Link>
                <button
                  onClick={() => setIsMobileOpen(false)}
                  className="flex items-center justify-center w-10 h-10 rounded-full text-muted-foreground hover:text-foreground hover:bg-foreground/10 transition-colors"
                  aria-label="Close menu"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Drawer links */}
              <div className="flex-1 flex flex-col gap-0.5 overflow-y-auto">
                {!mounted || showSkeleton ? (
                  <div className="flex flex-col gap-3 py-4">
                    {[110, 90, 130, 80, 100, 70, 60].map((w, i) => (
                      <div key={i} className="h-4 rounded-full bg-muted/40 animate-pulse" style={{ width: w }} />
                    ))}
                  </div>
                ) : (
                  displayMenus.map(menu => (
                    <MobileMenuItem
                      key={menu.id}
                      menu={menu}
                      onNavigate={() => setIsMobileOpen(false)}
                    />
                  ))
                )}

                {/* CTA buttons */}
                <div className="mt-6 pt-5 border-t border-white/10 flex flex-col gap-2.5 px-0">
                  {mounted && isAuthenticated ? (
                    <>
                      <Link
                        href={user?.roles?.[0] === 'SUPER_ADMIN' || user?.roles?.[0] === 'ADMIN' ? '/admin' : '/dashboard'}
                        onClick={() => setIsMobileOpen(false)}
                        className="navbar-btn-premium navbar-btn-dashboard w-full"
                      >
                        Dashboard
                      </Link>
                      <button
                        onClick={() => { setIsMobileOpen(false); logout(); }}
                        className="w-full h-[50px] rounded-full font-bold text-sm text-red-400 border border-red-400/20 bg-red-400/5 hover:bg-red-400/10 transition-all hover:scale-[1.02]"
                      >
                        Logout
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => { setIsMobileOpen(false); openModal('LOGIN'); }}
                        className="navbar-btn-premium navbar-btn-login w-full"
                      >
                        Login
                      </button>
                      {/*
                      <button
                        onClick={() => { setIsMobileOpen(false); openModal('REGISTER'); }}
                        className="navbar-btn-premium navbar-btn-signup w-full"
                      >
                        Sign Up
                      </button>
                      <Link
                        href="/dogs/register"
                        onClick={() => setIsMobileOpen(false)}
                        className="navbar-btn-premium navbar-btn-register w-full"
                      >
                        Register Dog
                      </Link>
                      */}
                    </>
                  )}
                </div>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
