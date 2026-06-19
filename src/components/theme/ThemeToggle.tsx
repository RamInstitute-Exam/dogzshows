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
    <div className="flex items-center gap-3">
      <span className={`text-sm font-semibold flex items-center gap-1.5 transition-colors ${!isDark ? 'text-brand-orange' : 'text-muted-foreground'}`}>
        <Sun className="w-4 h-4" />
        <span className="hidden sm:inline">Light</span>
      </span>
      
      <button
        onClick={() => setTheme(isDark ? 'light' : 'dark')}
        className="relative inline-flex h-6 w-11 items-center rounded-full bg-border transition-colors hover:bg-border/80 focus:outline-none"
        aria-label="Toggle theme"
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-foreground transition-transform duration-250 ease-in-out ${isDark ? 'translate-x-6' : 'translate-x-1'}`}
        />
      </button>

      <span className={`text-sm font-semibold flex items-center gap-1.5 transition-colors ${isDark ? 'text-brand-orange' : 'text-muted-foreground'}`}>
        <span className="hidden sm:inline">Dark</span>
        <Moon className="w-4 h-4" />
      </span>
    </div>
  );
}
