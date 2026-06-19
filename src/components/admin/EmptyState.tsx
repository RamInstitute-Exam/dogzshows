'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Plus, UploadCloud, FolderSearch } from 'lucide-react';
import Link from 'next/link';

interface EmptyStateProps {
  title: string;
  description: string;
  primaryAction?: {
    label: string;
    href?: string;
    onClick?: () => void;
    icon?: React.ReactNode;
  };
  secondaryAction?: {
    label: string;
    href?: string;
    onClick?: () => void;
    icon?: React.ReactNode;
  };
  icon?: React.ReactNode;
}

export default function EmptyState({
  title,
  description,
  primaryAction,
  secondaryAction,
  icon
}: EmptyStateProps) {
  return (
    <div className="w-full min-h-[500px] flex flex-col items-center justify-center p-8 text-center bg-card border border-border rounded-[20px] shadow-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="flex flex-col items-center max-w-md"
      >
        <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mb-6">
          {icon ? icon : <FolderSearch className="w-12 h-12 text-primary" />}
        </div>
        
        <h3 className="text-xl font-bold text-foreground mb-3">
          {title}
        </h3>
        
        <p className="text-muted-foreground text-sm leading-relaxed mb-8">
          {description}
        </p>
        
        <div className="flex flex-wrap items-center justify-center gap-4 w-full">
          {primaryAction && (
            primaryAction.href ? (
              <Link 
                href={primaryAction.href}
                className="flex items-center gap-2 px-6 py-3 bg-primary hover:opacity-90 text-primary-foreground font-bold text-sm rounded-xl transition-all hover:-translate-y-0.5 shadow-md"
              >
                {primaryAction.icon || <Plus className="w-4 h-4" />}
                {primaryAction.label}
              </Link>
            ) : (
              <button 
                onClick={primaryAction.onClick}
                className="flex items-center gap-2 px-6 py-3 bg-primary hover:opacity-90 text-primary-foreground font-bold text-sm rounded-xl transition-all hover:-translate-y-0.5 shadow-md"
              >
                {primaryAction.icon || <Plus className="w-4 h-4" />}
                {primaryAction.label}
              </button>
            )
          )}
          
          {secondaryAction && (
            secondaryAction.href ? (
              <Link 
                href={secondaryAction.href}
                className="flex items-center gap-2 px-6 py-3 bg-accent hover:bg-accent/80 text-foreground font-semibold text-sm border border-border rounded-xl transition-all hover:-translate-y-0.5"
              >
                {secondaryAction.icon || <UploadCloud className="w-4 h-4" />}
                {secondaryAction.label}
              </Link>
            ) : (
              <button 
                onClick={secondaryAction.onClick}
                className="flex items-center gap-2 px-6 py-3 bg-accent hover:bg-accent/80 text-foreground font-semibold text-sm border border-border rounded-xl transition-all hover:-translate-y-0.5"
              >
                {secondaryAction.icon || <UploadCloud className="w-4 h-4" />}
                {secondaryAction.label}
              </button>
            )
          )}
        </div>
      </motion.div>
    </div>
  );
}
