import React from 'react';

const Card = ({ children, className = '', variant = 'default', noPadding = false }) => {
  const variants = {
    default: 'bg-white border-surface-200 shadow-sm hover:shadow-md hover:border-surface-300',
    glass: 'bg-white/70 backdrop-blur-md border-white/40 shadow-sm',
    primary: 'bg-primary-50/50 border-primary-100 shadow-sm',
    accent: 'bg-accent-50/50 border-accent-100 shadow-sm',
    danger: 'bg-red-50 border-red-100 shadow-sm',
    warning: 'bg-amber-50 border-amber-100 shadow-sm',
    success: 'bg-green-50 border-green-100 shadow-sm',
  };

  const selectedVariant = variants[variant] || variants.default;
  
  return (
    <div 
      className={`
        rounded-2xl border transition-all duration-300
        ${selectedVariant}
        ${noPadding ? '' : 'p-6'}
        ${className}
      `}
    >
      {children}
    </div>
  );
};

export default Card;
