import React from 'react';

const Card = ({ children, className = '', variant = 'default', noPadding = false }) => {
  const variants = {
    default: 'bg-white/80 backdrop-blur-md border border-secondary-100 shadow-sm hover:shadow-lg transition-all',
    institutional: 'bg-white/90 backdrop-blur-lg border border-neutral-200 shadow-[0_8px_30px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)]',
    glass: 'bg-white/60 backdrop-blur-xl border border-white/40 shadow-2xl',
    primary: 'bg-primary-50/80 backdrop-blur-md border border-primary-100 text-primary-900',
    accent: 'bg-secondary-50/80 backdrop-blur-md border border-secondary-100 text-secondary-900',
    danger: 'bg-red-50/80 backdrop-blur-md border border-red-100 text-red-900',
    warning: 'bg-amber-50/80 backdrop-blur-md border border-amber-100 text-amber-900',
    success: 'bg-primary-50/80 backdrop-blur-md border border-primary-100 text-primary-900',
    dark: 'bg-surface-800/90 backdrop-blur-xl border border-surface-900 text-primary-50 shadow-2xl',
  };

  const selectedVariant = variants[variant] || variants.default;
  
  return (
    <div 
      className={`
        rounded-xl transition-all duration-300
        ${selectedVariant}
        ${noPadding ? '' : 'p-6 md:p-8'}
        ${className}
      `}
    >
      {children}
    </div>
  );
};

export default Card;
