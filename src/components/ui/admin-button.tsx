'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

/* ─────────────────────────────────────────────────────────────
   AdminButton — fully theme-aware button for the Admin Panel.

   Variants:
     primary   – dominant action (Save, Create, Submit, Publish…)
     secondary – secondary action (Cancel, Back…)
     danger    – destructive action (Delete, Remove…)
     success   – positive action (Approve, Confirm…)
     outline   – bordered ghost
     ghost     – transparent, no border

   Sizes:
     sm | md | lg

   Features:
     • Automatically adapts bg/text to light & dark themes
     • loading prop shows spinner & disables clicks
     • disabled styles (opacity-50, cursor-not-allowed)
     • smooth hover scale + shadow transitions
───────────────────────────────────────────────────────────── */

export type AdminButtonVariant =
  | 'primary'
  | 'secondary'
  | 'danger'
  | 'success'
  | 'outline'
  | 'ghost';

export type AdminButtonSize = 'sm' | 'md' | 'lg';

interface AdminButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: AdminButtonVariant;
  size?: AdminButtonSize;
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  children?: React.ReactNode;
}

const variantClasses: Record<AdminButtonVariant, string> = {
  /**
   * Primary — Light: #111827 bg / white text
   *           Dark:  #FFFFFF bg / #111827 text
   * This guarantees contrast in both themes.
   */
  primary: [
    /* Light mode */
    'bg-[#111827] text-white border-transparent',
    'hover:bg-black hover:shadow-lg',
    /* Dark mode */
    'dark:bg-white dark:text-[#111827] dark:border-transparent',
    'dark:hover:bg-[#F3F4F6]',
    /* Common */
    'hover:scale-[1.02]',
  ].join(' '),

  /**
   * Secondary — Light: white bg / dark text / subtle border
   *             Dark:  transparent / white text / subtle border
   */
  secondary: [
    'bg-white text-[#111827] border border-[#D1D5DB]',
    'hover:bg-[#F9FAFB]',
    'dark:bg-transparent dark:text-white dark:border-[rgba(255,255,255,0.15)]',
    'dark:hover:bg-[rgba(255,255,255,0.06)]',
  ].join(' '),

  /**
   * Danger — always red bg, always white text
   */
  danger: [
    'bg-[#DC2626] text-white border-transparent',
    'hover:bg-[#B91C1C] hover:shadow-lg hover:scale-[1.02]',
    'dark:bg-[#EF4444] dark:text-white dark:border-transparent',
    'dark:hover:bg-[#DC2626]',
  ].join(' '),

  /**
   * Success — always green bg, always white / dark text
   */
  success: [
    'bg-[#16A34A] text-white border-transparent',
    'hover:bg-[#15803D] hover:shadow-lg hover:scale-[1.02]',
    'dark:bg-[#22C55E] dark:text-[#111827] dark:border-transparent',
    'dark:hover:bg-[#16A34A] dark:hover:text-white',
  ].join(' '),

  /**
   * Outline — transparent with border, foreground text
   */
  outline: [
    'bg-transparent text-[#111827] border border-[#D1D5DB]',
    'hover:bg-[#F3F4F6]',
    'dark:text-white dark:border-[rgba(255,255,255,0.15)]',
    'dark:hover:bg-[rgba(255,255,255,0.06)]',
  ].join(' '),

  /**
   * Ghost — no background, no border, just text
   */
  ghost: [
    'bg-transparent text-[#6B7280] border-transparent',
    'hover:bg-[#F3F4F6] hover:text-[#111827]',
    'dark:text-[#9CA3AF] dark:hover:bg-[rgba(255,255,255,0.06)] dark:hover:text-white',
  ].join(' '),
};

const sizeClasses: Record<AdminButtonSize, string> = {
  sm: 'h-8 px-3 text-xs gap-1.5 rounded-lg',
  md: 'h-10 px-4 text-sm gap-2 rounded-xl',
  lg: 'h-12 px-6 text-base gap-2.5 rounded-xl',
};

export function AdminButton({
  variant = 'primary',
  size = 'md',
  loading = false,
  leftIcon,
  rightIcon,
  disabled,
  className,
  children,
  type = 'button',
  ...props
}: AdminButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <button
      type={type}
      disabled={isDisabled}
      className={cn(
        /* Base styles */
        'inline-flex shrink-0 items-center justify-center',
        'font-semibold whitespace-nowrap select-none',
        'transition-all duration-300 ease-in-out',
        'outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#111827] dark:focus-visible:ring-white',
        /* Disabled */
        isDisabled && 'opacity-50 cursor-not-allowed pointer-events-none',
        /* Variant + Size */
        variantClasses[variant],
        sizeClasses[size],
        /* Caller overrides */
        className,
      )}
      {...props}
    >
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin shrink-0" />
      ) : (
        leftIcon && <span className="shrink-0">{leftIcon}</span>
      )}
      {children}
      {!loading && rightIcon && <span className="shrink-0">{rightIcon}</span>}
    </button>
  );
}

export default AdminButton;
