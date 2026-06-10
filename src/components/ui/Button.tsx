import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
}

const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  className = '',
  ...props
}) => {
  const baseClasses = "inline-flex items-center justify-center font-medium rounded-full transition-all duration-300 ease-out focus:outline-none focus:ring-2 focus:ring-offset-2";
  
  const variants = {
    primary: "bg-gradient-to-r from-brand-orange to-brand-gold text-white shadow-md hover:-translate-y-1 hover:shadow-lg hover:shadow-brand-orange/30 focus:ring-brand-orange",
    secondary: "bg-brand-dark text-white shadow-md hover:-translate-y-1 hover:shadow-lg hover:bg-brand-darker focus:ring-brand-dark",
    outline: "border-2 border-brand-orange text-brand-orange hover:bg-brand-orange/10 focus:ring-brand-orange",
    ghost: "text-brand-gray hover:bg-brand-gray/10 focus:ring-brand-gray",
  };

  const sizes = {
    sm: "px-4 py-2 text-sm",
    md: "px-6 py-3 text-base",
    lg: "px-8 py-4 text-lg",
  };

  const widthClass = fullWidth ? "w-full" : "";

  return (
    <button
      className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${widthClass} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
