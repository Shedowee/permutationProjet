import React from 'react';
import { motion } from 'framer-motion';

const Button = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  className = '', 
  disabled = false,
  loading = false,
  onClick,
  type = 'button',
  icon: Icon,
  ...props 
}) => {
  const baseClasses = 'relative inline-flex items-center justify-center font-bold transition-standard overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]';
  
  const variants = {
    primary: 'bg-primary-500 text-white shadow-primary hover:bg-primary-600',
    secondary: 'bg-secondary-500 text-white shadow-secondary hover:bg-secondary-600',
    accent: 'bg-accent-500 text-white shadow-soft hover:bg-accent-600',
    danger: 'bg-red-500 text-white shadow-soft hover:bg-red-600',
    success: 'bg-green-500 text-white shadow-soft hover:bg-green-600',
    ghost: 'bg-transparent text-surface-600 hover:bg-surface-100 hover:text-surface-900',
    outline: 'bg-transparent border-2 border-surface-200 text-surface-700 hover:bg-surface-50 hover:border-surface-300',
  };
  
  const sizes = {
    xs: 'px-3 py-1.5 text-[10px] rounded-lg tracking-widest uppercase',
    sm: 'px-4 py-2 text-xs rounded-xl tracking-wider uppercase',
    md: 'px-6 py-3 text-sm rounded-2xl',
    lg: 'px-8 py-4 text-base rounded-2xl',
  };
  
  return (
    <motion.button
      whileHover={!disabled && !loading ? { y: -2 } : {}}
      type={type}
      className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`}
      onClick={onClick}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <svg className="animate-spin h-5 w-5 text-current" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      ) : (
        <div className="flex items-center gap-2">
          {Icon && <Icon className="w-4 h-4" />}
          {children}
        </div>
      )}
    </motion.button>
  );
};

export default Button;
