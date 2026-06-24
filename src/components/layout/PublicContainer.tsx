import React from 'react';
import { cn } from '@/lib/utils';

interface PublicContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
}

export default function PublicContainer({ children, className, ...props }: PublicContainerProps) {
  return (
    <div 
      {...props}
      className={cn(
        "w-full mx-auto box-border transition-all duration-300",
        // Mobile (< 768px): width 100%, padding 16px
        "px-4",
        // Tablet (768px - 1440px): width 100%, padding 20px
        "md:px-5",
        // Laptop (1440px): max-width 1380px, padding 24px
        "min-[1440px]:max-w-[1380px] min-[1440px]:px-6",
        // Large Laptop (1600px): max-width 1500px, padding 28px
        "min-[1600px]:max-w-[1500px] min-[1600px]:px-[28px]",
        // Desktop (1920px+): max-width 1680px, padding 32px
        "min-[1920px]:max-w-[1680px] min-[1920px]:px-8",
        className
      )}
    >
      {children}
    </div>
  );
}
