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
  const baseClasses = 'relative inline-flex items-center justify-center font-bold transition-standard overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] focus:outline-none focus-visible:ring-4 focus-visible:ring-sky-500/15';
  
  const variants = {
    primary: 'bg-[linear-gradient(135deg,#007b3a_0%,#18a874_100%)] text-white shadow-[0_16px_34px_-22px_rgba(0,146,69,0.5)] hover:brightness-105',
    secondary: 'bg-slate-900 text-white shadow-[0_16px_34px_-24px_rgba(15,23,42,0.55)] hover:bg-slate-800',
    accent: 'bg-sky-600 text-white shadow-[0_16px_34px_-24px_rgba(2,132,199,0.48)] hover:bg-sky-500',
    danger: 'bg-red-600 text-white shadow-[0_16px_34px_-24px_rgba(220,38,38,0.48)] hover:bg-red-700',
    success: 'bg-emerald-600 text-white shadow-[0_16px_34px_-24px_rgba(5,150,105,0.48)] hover:bg-emerald-700',
    ghost: 'bg-transparent text-surface-600 hover:bg-slate-100/80 hover:text-surface-900',
    outline: 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 hover:border-sky-300 hover:text-sky-700',
  };
  
  const sizes = {
    xs: 'px-3 py-1.5 text-[10px] rounded-lg tracking-widest uppercase',
    sm: 'px-4 py-2 text-xs rounded-lg tracking-wider uppercase',
    md: 'px-5 py-2.5 text-sm rounded-lg',
    lg: 'px-7 py-3.5 text-base rounded-lg',
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
