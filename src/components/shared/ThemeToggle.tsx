'use client';

import * as React from 'react';
import { useTheme } from 'next-themes';
import { motion } from 'framer-motion';
import { Moon, Sun } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return <div className="w-[68px] h-9" />; // Placeholder to avoid layout shift

  const isDark = resolvedTheme === 'dark';

  return (
    <button
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      className="relative flex items-center justify-between w-[68px] h-9 p-1 bg-card border border-border rounded-full cursor-pointer transition-colors hover:border-primary/50"
      aria-label="Toggle Theme"
    >
      <div className="flex items-center justify-center w-full h-full z-10 px-1">
        <Moon className={`w-3.5 h-3.5 mr-auto transition-colors ${isDark ? 'text-foreground' : 'text-muted-foreground'}`} />
        <Sun className={`w-3.5 h-3.5 ml-auto transition-colors ${!isDark ? 'text-foreground' : 'text-muted-foreground'}`} />
      </div>
      
      <motion.div
        className="absolute top-1 left-1 w-7 h-7 bg-primary rounded-full z-0 shadow-md"
        initial={false}
        animate={{
          x: isDark ? 0 : 28
        }}
        transition={{
          type: "spring",
          stiffness: 500,
          damping: 30
        }}
      />
    </button>
  );
}
