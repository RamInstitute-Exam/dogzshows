'use client';

import * as React from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { motion } from 'framer-motion';

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="flex items-center gap-3 opacity-0" aria-hidden="true">
        <div className="w-24 h-6" />
      </div>
    );
  }

  const isDark = theme === 'dark';

  return (
    <div className="flex items-center gap-3 shrink-0">
      <span className={`text-sm font-semibold items-center gap-1.5 transition-colors uppercase ${!isDark ? 'text-foreground font-bold' : 'text-muted-foreground'} hidden md:flex`}>
        <Sun className="w-4 h-4" />
        <span className="hidden sm:inline">LIGHT</span>
      </span>
      
      <button
        onClick={() => setTheme(isDark ? 'light' : 'dark')}
        className="theme-toggle bg-border transition-colors hover:bg-border/80 focus:outline-none"
        aria-label="Toggle theme"
      >
        <span
          className={`theme-toggle-thumb bg-foreground ${isDark ? 'active' : ''}`}
        />
      </button>

      <span className={`text-sm font-semibold items-center gap-1.5 transition-colors uppercase ${isDark ? 'text-foreground font-bold' : 'text-muted-foreground'} hidden md:flex`}>
        <span className="hidden sm:inline">DARK</span>
        <Moon className="w-4 h-4" />
      </span>
    </div>
  );
}
