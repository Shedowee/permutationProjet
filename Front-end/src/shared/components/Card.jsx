import React from 'react';
import { motion } from 'framer-motion';

const Card = ({ children, className = '', variant = 'default', noPadding = false, hover = true }) => {
  const variants = {
    default: 'bg-white border border-surface-100 shadow-soft',
    institutional: 'bg-white border border-surface-200 shadow-medium',
    glass: 'bg-white/70 backdrop-blur-lg border border-white/20 shadow-hard',
    primary: 'bg-primary-50 border border-primary-100 text-primary-900',
    accent: 'bg-secondary-50 border border-secondary-100 text-secondary-900',
    danger: 'bg-red-50 border border-red-100 text-red-900',
    warning: 'bg-amber-50 border border-amber-100 text-amber-900',
    success: 'bg-green-50 border border-green-100 text-green-900',
    dark: 'bg-surface-900 border border-surface-800 text-white shadow-hard',
  };

  const selectedVariant = variants[variant] || variants.default;
  
  return (
    <motion.div 
      whileHover={hover ? { y: -4, boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)' } : {}}
      className={`
        rounded-2xl transition-standard
        ${selectedVariant}
        ${noPadding ? '' : 'p-6 sm:p-8'}
        ${className}
      `}
    >
      {children}
    </motion.div>
  );
};

export default Card;
