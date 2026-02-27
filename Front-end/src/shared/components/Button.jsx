import React from 'react';

const Button = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  className = '', 
  disabled = false,
  loading = false,
  onClick,
  ...props 
}) => {
  const baseClasses = 'font-semibold rounded-xl transition-all duration-300 focus:outline-none active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 flex items-center justify-center';
  
  const variants = {
    primary: 'bg-accent-500 text-white hover:bg-accent-600 shadow-sm shadow-accent-500/20',
    secondary: 'bg-white text-surface-700 hover:bg-surface-50 border border-surface-200 shadow-sm',
    accent: 'bg-accent-500 text-white hover:bg-accent-600 shadow-sm shadow-accent-500/20',
    danger: 'bg-red-600 text-white hover:bg-red-700 shadow-sm shadow-red-500/20',
    success: 'bg-green-600 text-white hover:bg-green-700 shadow-sm shadow-green-500/20',
    ghost: 'bg-transparent text-surface-500 hover:bg-surface-100 hover:text-surface-900',
    outline: 'bg-transparent border border-surface-200 text-surface-600 hover:border-primary-500 hover:text-primary-600 hover:bg-primary-50',
  };
  
  const sizes = {
    xs: 'px-2 py-1 text-xs',
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-5 py-2.5 text-sm',
    lg: 'px-8 py-3 text-base',
  };
  
  return (
    <button
      className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`}
      onClick={onClick}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      )}
      {children}
    </button>
  );
};

export default Button;
